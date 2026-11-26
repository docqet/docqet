package commands

import (
	"context"
	"errors"
	"fmt"
	"io"
	"slices"
	"strings"
	"text/tabwriter"

	"github.com/urfave/cli/v3"

	"github.com/docqet/docqet/internal/combine"
	"github.com/docqet/docqet/internal/derive"
	"github.com/docqet/docqet/internal/git"
	"github.com/docqet/docqet/internal/state"
)

// TouchesCommand lists what a set of files, or a change, is about.
// docqet:implements capability:touches
func TouchesCommand() *cli.Command {
	return &cli.Command{
		Name:      "touches",
		Category:  reading,
		Usage:     "What a set of files or a change is about",
		ArgsUsage: "[path ...]",
		Description: `Lists what the annotations in the files name, the capabilities relying on the
components they name, and each capability's level, rules, gaps, tradeoffs and
open decisions: what a change to those files has to keep. Give files or
folders, or --staged for what's staged, or --base for everything changed since
a commit, such as origin/main.`,
		Flags: withSourceFlags(
			&cli.BoolFlag{Name: "staged", Usage: "what's staged"},
			&cli.StringFlag{Name: "base", Usage: "everything changed since `REV`"},
		),
		Action: func(ctx context.Context, cmd *cli.Command) error {
			lo, err := readHere(ctx, cmd, "")
			if err != nil {
				return err
			}
			paths, err := touchedPaths(ctx, cmd, lo.root)
			if err != nil {
				return err
			}
			t := touchesOf(lo.view.Product, lo.state.Problems, paths)
			out := cmd.Root().Writer
			if cmd.Bool("json") {
				writeJSON(out, map[string]any{
					"source": lo.source, "paths": paths, "files": t.Files, "technical": t.Technical,
					"capabilities": t.Capabilities, "mechanisms": t.Mechanisms,
				})
				return nil
			}
			_, _ = fmt.Fprintf(out, "%s\n\n", lo.source.line())
			t.print(out)
			return nil
		},
	}
}

// touchedPaths is the paths touches is about: those given, relative to the
// project's root, or what's staged, or what's changed since --base.
func touchedPaths(ctx context.Context, cmd *cli.Command, root string) ([]string, error) {
	args := cmd.Args().Slice()
	switch {
	case cmd.Bool("staged") && cmd.IsSet("base"), (cmd.Bool("staged") || cmd.IsSet("base")) && len(args) > 0:
		return nil, errors.New("give paths, --staged or --base: only one of them")
	case cmd.Bool("staged"):
		return git.Staged(ctx, root)
	case cmd.IsSet("base"):
		return git.Changed(ctx, root, cmd.String("base"))
	case len(args) == 0:
		return nil, errors.New("give the files or folders to look at, or --staged, or --base REV")
	}
	var paths []string
	for _, a := range args {
		p, err := relToRoot(root, a)
		if err != nil {
			return nil, err
		}
		paths = append(paths, p)
	}
	return paths, nil
}

type touchedAnnotation struct {
	Line int    `json:"line"`
	Verb string `json:"verb"`
	Ref  string `json:"ref"`
}

type touchedFile struct {
	File        string              `json:"file"`
	Annotations []touchedAnnotation `json:"annotations"`
	Problems    []string            `json:"problems,omitempty"`
}

type touchedTechnical struct {
	Ref        string   `json:"ref"`
	Applies    string   `json:"applies,omitempty"`
	ReliedOnBy []string `json:"reliedOnBy"`
}

type touchedCapability struct {
	Ref       string         `json:"ref"`
	Name      string         `json:"name"`
	Levels    []string       `json:"levels"`
	Rules     []string       `json:"rules"`
	Gaps      []gapView      `json:"gaps"`
	Tradeoffs []tradeoffView `json:"tradeoffs"`
	Decisions []decisionView `json:"decisions"`
}

type touches struct {
	Files        []touchedFile       `json:"files"`
	Technical    []touchedTechnical  `json:"technical"`
	Capabilities []touchedCapability `json:"capabilities"`
	// Mechanisms apply to every capability, so they're listed for any
	// change.
	Mechanisms []string `json:"mechanisms"`
}

// touchesOf works out what the files under paths are about.
func touchesOf(p *combine.Product, problems []state.Problem, paths []string) touches {
	inPaths := func(file string) bool {
		return slices.ContainsFunc(paths, func(path string) bool { return under(file, path) })
	}
	files := map[string]*touchedFile{}
	var order []string
	fileOf := func(name string) *touchedFile {
		if f, ok := files[name]; ok {
			return f
		}
		files[name] = &touchedFile{File: name, Annotations: []touchedAnnotation{}}
		order = append(order, name)
		return files[name]
	}
	named := map[string]bool{}
	note := func(places []combine.Place, verb, ref string) {
		for _, pl := range places {
			if inPaths(pl.File) {
				f := fileOf(pl.File)
				f.Annotations = append(f.Annotations, touchedAnnotation{Line: pl.Line, Verb: verb, Ref: ref})
				named[ref] = true
			}
		}
	}
	evidence := func(e combine.Evidence, ref string) {
		note(e.Implements, "implements", ref)
		note(e.Verifies, "verifies", ref)
	}
	for _, c := range p.Capabilities {
		evidence(c.Evidence, state.DocRef(state.TypeCapability, c.ID))
	}
	for _, r := range p.Rules {
		evidence(r.Evidence, ruleRef(state.TypeRule, r.ID))
	}
	for _, t := range append(append([]*combine.Technical{}, p.Mechanisms...), p.Components...) {
		evidence(t.Evidence, t.Kind+":"+t.ID)
	}
	for _, g := range p.Gaps {
		note(g.Places, "gap", g.ID)
	}
	for _, tr := range p.Tradeoffs {
		note(tr.Places, "tradeoff", tr.ID)
	}
	for _, pr := range problems {
		if pr.File != "" && inPaths(pr.File) && (pr.Type == state.InvalidAnnotation || pr.Subject == "") {
			f := fileOf(pr.File)
			f.Problems = append(f.Problems, fmt.Sprintf("line %d: %s", pr.Line, pr.Message))
		}
	}
	var t touches
	slices.Sort(order)
	for _, name := range order {
		f := files[name]
		slices.SortFunc(f.Annotations, func(a, b touchedAnnotation) int { return a.Line - b.Line })
		for i := range f.Annotations {
			f.Annotations[i].Ref = declared(f.Annotations[i].Ref)
		}
		t.Files = append(t.Files, *f)
	}

	// The capabilities the change is about: those named, those following a
	// rule named, those relying on a component named, and those a gap or
	// tradeoff named is on.
	touched := map[string]bool{}
	for _, c := range p.Capabilities {
		ref := state.DocRef(state.TypeCapability, c.ID)
		if named[ref] {
			touched[c.ID] = true
		}
		for _, id := range append(append([]string{}, c.Gaps...), c.Tradeoffs...) {
			if named[id] {
				touched[c.ID] = true
			}
		}
	}
	for _, r := range p.Rules {
		if named[ruleRef(state.TypeRule, r.ID)] {
			for _, c := range r.Capabilities {
				touched[c] = true
			}
		}
	}
	for _, tech := range append(append([]*combine.Technical{}, p.Components...), p.Mechanisms...) {
		ref := tech.Kind + ":" + tech.ID
		onIt := named[ref]
		for _, id := range append(append([]string{}, tech.Gaps...), tech.Tradeoffs...) {
			onIt = onIt || named[id]
		}
		if !onIt {
			continue
		}
		tt := touchedTechnical{Ref: ref, ReliedOnBy: []string{}}
		if tech.Kind == combine.KindMechanism {
			tt.Applies = tech.Applies
		} else {
			for _, id := range tech.Capabilities {
				touched[id] = true
				if c := p.Capability(id); c != nil {
					tt.ReliedOnBy = append(tt.ReliedOnBy, fmt.Sprintf("capability:%s (%s)", id, c.Stability))
				}
			}
		}
		t.Technical = append(t.Technical, tt)
	}
	for _, c := range p.Capabilities {
		if !touched[c.ID] {
			continue
		}
		tc := touchedCapability{
			Ref: state.DocRef(state.TypeCapability, c.ID), Name: c.Name, Levels: levelsOf(p, c),
			Rules: []string{}, Gaps: []gapView{}, Tradeoffs: []tradeoffView{},
			Decisions: decisionViews("", derive.OpenDecisions(c.Doc)),
		}
		for _, r := range c.Rules {
			tc.Rules = append(tc.Rules, inDomain(r, c.Domain))
		}
		for _, g := range gapsOf(p, c.Gaps) {
			tc.Gaps = append(tc.Gaps, gapViewOf(p, g))
		}
		for _, tr := range tradeoffsOf(p, c.Tradeoffs) {
			tc.Tradeoffs = append(tc.Tradeoffs, tradeoffViewOf(tr))
		}
		t.Capabilities = append(t.Capabilities, tc)
	}
	for _, m := range p.Mechanisms {
		t.Mechanisms = append(t.Mechanisms, "mechanism:"+m.ID)
	}
	return t
}

func (t touches) print(out io.Writer) {
	if len(t.Files) == 0 && len(t.Capabilities) == 0 {
		_, _ = fmt.Fprintln(out, "Nothing in these files is named in Docqet.")
	}
	for _, f := range t.Files {
		_, _ = fmt.Fprintln(out, f.File)
		for _, a := range f.Annotations {
			_, _ = fmt.Fprintf(out, "  %d  %s %s\n", a.Line, a.Verb, a.Ref)
		}
		for _, pr := range f.Problems {
			_, _ = fmt.Fprintf(out, "  problem: %s\n", pr)
		}
		_, _ = fmt.Fprintln(out)
	}
	for _, tt := range t.Technical {
		switch {
		case tt.Applies != "":
			_, _ = fmt.Fprintf(out, "%s\n  applies to every capability the %s serves\n\n", tt.Ref, tt.Applies)
		case len(tt.ReliedOnBy) == 0:
			_, _ = fmt.Fprintf(out, "%s\n  relied on by no capability\n\n", tt.Ref)
		default:
			_, _ = fmt.Fprintf(out, "%s\n  relied on by %s\n\n", tt.Ref, strings.Join(tt.ReliedOnBy, ", "))
		}
	}
	for _, c := range t.Capabilities {
		_, _ = fmt.Fprintf(out, "%s   %s\n", c.Ref, strings.Join(c.Levels, ", "))
		tw := tabwriter.NewWriter(out, 0, 0, 2, ' ', 0)
		_, _ = fmt.Fprintf(tw, "  rules\t%s\n", orNone(c.Rules))
		var gaps []string
		for _, g := range c.Gaps {
			gaps = append(gaps, fmt.Sprintf("%s (%s)", keyOf(g.ID), g.ratings()))
		}
		_, _ = fmt.Fprintf(tw, "  gaps\t%s\n", orNone(gaps))
		var tradeoffs []string
		for _, tr := range c.Tradeoffs {
			tradeoffs = append(tradeoffs, keyOf(tr.ID))
		}
		_, _ = fmt.Fprintf(tw, "  tradeoffs\t%s\n", orNone(tradeoffs))
		if len(c.Decisions) == 0 {
			_, _ = fmt.Fprintf(tw, "  decisions\tnone open\n")
		}
		for i, d := range c.Decisions {
			label := ""
			if i == 0 {
				label = "decisions"
			}
			_, _ = fmt.Fprintf(tw, "  %s\t%s\n", label, oneLine(d.Question, 100))
		}
		_ = tw.Flush()
		_, _ = fmt.Fprintln(out)
	}
	if len(t.Mechanisms) > 0 {
		_, _ = fmt.Fprintf(out, "Mechanisms apply to every capability: %s\n", strings.Join(t.Mechanisms, ", "))
	}
}

// orNone joins a list, or says there's none.
func orNone(list []string) string {
	if len(list) == 0 {
		return "none"
	}
	return strings.Join(list, ", ")
}
