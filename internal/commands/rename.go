package commands

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"text/tabwriter"

	"github.com/urfave/cli/v3"

	"github.com/docqet/docqet/internal/state"
)

// RenameCommand changes an ID everywhere in the project, and prints the
// trailer that tells history it's the same thing.
// docqet:implements capability:renaming
func RenameCommand() *cli.Command {
	return &cli.Command{
		Name:         "rename",
		Category:     changing,
		ArgValidator: maxArgs(2),
		Usage:        "Change an ID everywhere in the project, and say so in history",
		ArgsUsage:    "<old> <new>",
		Description: `Changes a doc's ID, a rule's or concept's domain, or a gap's or tradeoff's key,
and every reference to it in the project's docs' frontmatter and its
annotations. A doc's file is renamed with it when it's named after the old ID.
A doc's gaps and tradeoffs follow it. Bodies aren't changed, since nothing
reads them. It prints the Docqet-Became trailer to commit the rename with.`,
		Flags: []cli.Flag{
			&cli.BoolFlag{Name: "dry-run", Usage: "show what would change, without changing it"},
			productFlag("also list the rest of the product's references, from the server"),
		},
		Action: func(ctx context.Context, cmd *cli.Command) error {
			if err := notBuiltFlags(cmd.IsSet, "product"); err != nil {
				return err
			}
			args := cmd.Args().Slice()
			if len(args) != 2 {
				return errors.New("rename needs the old reference and the new one, such as capability:early-arrival capability:early-check-in")
			}
			ix, err := indexHere(ctx, "")
			if err != nil {
				return err
			}
			plan, err := planRename(ix.state, args[0], args[1])
			if err != nil {
				return err
			}
			edits, err := plan.apply(ix.root, cmd.Bool("dry-run"))
			if err != nil {
				return err
			}
			trailer := fmt.Sprintf("%s: %s -> %s", becameKey, plan.oldRef, plan.newRef)
			out := cmd.Root().Writer
			if cmd.Bool("json") {
				writeJSON(out, map[string]any{"source": ix.source, "old": plan.oldRef, "new": plan.newRef, "dryRun": cmd.Bool("dry-run"), "edits": edits, "trailer": trailer})
				return nil
			}
			_, _ = fmt.Fprintf(out, "%s\n\n", ix.source.line())
			tw := tabwriter.NewWriter(out, 0, 0, 2, ' ', 0)
			for _, e := range edits {
				where := e.File
				if e.Line > 0 {
					where = fmt.Sprintf("%s:%d", e.File, e.Line)
				}
				if e.RenamedTo != "" {
					_, _ = fmt.Fprintf(tw, "%s\n  → %s\t%s\n", where, e.RenamedTo, e.What)
					continue
				}
				_, _ = fmt.Fprintf(tw, "%s\t%s\n", where, e.What)
			}
			_ = tw.Flush()
			if cmd.Bool("dry-run") {
				_, _ = fmt.Fprintln(out, "\nNothing was changed: this is what would be.")
			}
			_, _ = fmt.Fprintf(out, "\nAdd this trailer when you commit:\n  git commit --trailer %q\n", trailer)
			return nil
		},
	}
}

// renamePlan is a rename worked out: what's renamed, and what to.
type renamePlan struct {
	typ            string
	oldID, newID   string
	oldDom, newDom string // a rule's or concept's domains
	oldKey, newKey string // a gap's or tradeoff's keys
	oldRef, newRef string
	// docFiles are the files declaring the doc, or the doc the gap or
	// tradeoff is on.
	docFiles []string
	// domains is each doc file's domain, for links written without one.
	domains map[string]string
	// annotated are the files with annotations.
	annotated []string
}

// rename is one change rename made, or would make.
type renameEdit struct {
	File      string `json:"file"`
	Line      int    `json:"line,omitempty"`
	What      string `json:"what"`
	RenamedTo string `json:"renamedTo,omitempty"`
}

func planRename(st *state.State, oldArg, newArg string) (*renamePlan, error) {
	o, ok1 := state.ParseRef(oldArg)
	n, ok2 := state.ParseRef(newArg)
	if !ok1 || !ok2 {
		return nil, errors.New("both have to be references, such as capability:early-arrival")
	}
	if o.Type != n.Type {
		return nil, fmt.Errorf("a %s can't become a %s: rename keeps the type", o.Type, n.Type)
	}
	domained := o.Type == state.TypeRule || o.Type == state.TypeConcept
	if !domained && (o.Domain != "" || n.Domain != "") {
		return nil, fmt.Errorf("a %s has no domain to change", o.Type)
	}
	ids := declaredIDs(st)
	p := &renamePlan{typ: o.Type, oldID: o.ID, newID: n.ID, domains: map[string]string{}}
	if domained {
		dom, err := domainOf(st, o)
		if err != nil {
			return nil, err
		}
		p.oldDom, p.newDom = dom, dom
		if n.Domain != "" {
			p.newDom = n.Domain
		}
	}
	p.oldRef, p.newRef = qualified(o.Type, o.ID, p.oldDom), qualified(n.Type, n.ID, p.newDom)
	switch {
	case (o.Key == "") != (n.Key == ""):
		return nil, errors.New("rename a doc to a doc, or a gap or tradeoff to one on the same doc")
	case o.Key != "":
		if p.oldRef != p.newRef {
			return nil, errors.New("a gap or tradeoff keeps its doc: rename only its key")
		}
		p.oldKey, p.newKey = o.Key, n.Key
		p.oldRef, p.newRef = p.oldRef+"#"+o.Key, p.newRef+"#"+n.Key
		if !ids[p.oldRef] {
			return nil, fmt.Errorf("%s isn't a gap or tradeoff in this project", p.oldRef)
		}
	default:
		if !ids[p.oldRef] {
			return nil, fmt.Errorf("%s isn't in this project", p.oldRef)
		}
	}
	if p.oldRef == p.newRef {
		return nil, errors.New("the new reference is the old one")
	}
	if ids[p.newRef] {
		return nil, fmt.Errorf("%s already exists: renaming onto it would make two things one", p.newRef)
	}
	p.collectFiles(st)
	return p, nil
}

// domainOf is the domain of the rule or concept a reference names, which may
// leave it out when only one domain has it.
func domainOf(st *state.State, r state.Ref) (string, error) {
	var found []string
	add := func(id, domain string) {
		if id == r.ID && (r.Domain == "" || r.Domain == domain) && !slices.Contains(found, domain) {
			found = append(found, domain)
		}
	}
	if r.Type == state.TypeRule {
		for _, x := range st.Rules {
			add(x.ID, x.Domain)
		}
	} else {
		for _, x := range st.Concepts {
			add(x.ID, x.Domain)
		}
	}
	switch len(found) {
	case 0:
		return "", fmt.Errorf("%s:%s isn't in this project", r.Type, r.ID)
	case 1:
		return found[0], nil
	}
	return "", fmt.Errorf("%s:%s is in several domains: say which, such as %s:%s@%s", r.Type, r.ID, r.Type, r.ID, found[0])
}

func qualified(typ, id, domain string) string {
	if domain != "" {
		return typ + ":" + id + "@" + domain
	}
	return typ + ":" + id
}

// collectFiles finds the files a rename can touch: every doc's file, with
// its domain, and every file with an annotation. Ignored files are in
// neither, so they're never changed.
func (p *renamePlan) collectFiles(st *state.State) {
	doc := func(typ, id, domain, file string) {
		p.domains[file] = domain
		if typ == p.typ && id == p.oldID && (p.oldDom == "" || domain == p.oldDom) {
			p.docFiles = append(p.docFiles, file)
		}
	}
	for _, x := range st.Domains {
		doc(state.TypeDomain, x.ID, x.ID, x.File)
	}
	for _, x := range st.Features {
		doc(state.TypeFeature, x.ID, x.Domain, x.File)
	}
	for _, x := range st.Capabilities {
		doc(state.TypeCapability, x.ID, x.Domain, x.File)
	}
	for _, x := range st.Rules {
		doc(state.TypeRule, x.ID, x.Domain, x.File)
	}
	for _, x := range st.Concepts {
		doc(state.TypeConcept, x.ID, x.Domain, x.File)
	}
	for _, x := range st.Personas {
		doc(state.TypePersona, x.ID, "", x.File)
	}
	for _, x := range st.Problems {
		doc(state.TypeProblem, x.ID, "", x.File)
	}
	for _, x := range st.Constraints {
		doc(state.TypeConstraint, x.ID, "", x.File)
	}
	for _, x := range st.Initiatives {
		doc(state.TypeInitiative, x.ID, "", x.File)
	}
	for _, x := range st.Mechanisms {
		doc(state.TypeMechanism, x.ID, "", x.File)
	}
	for _, x := range st.Components {
		doc(state.TypeComponent, x.ID, "", x.File)
	}
	seen := map[string]bool{}
	places := func(list []state.Place) {
		for _, pl := range list {
			if !seen[pl.File] {
				seen[pl.File] = true
				p.annotated = append(p.annotated, pl.File)
			}
		}
	}
	evidence := func(e state.Evidence) { places(e.Implements); places(e.Verifies) }
	for _, x := range st.Capabilities {
		evidence(x.Evidence)
	}
	for _, x := range st.Rules {
		evidence(x.Evidence)
	}
	for _, x := range st.Mechanisms {
		evidence(x.Evidence)
	}
	for _, x := range st.Components {
		evidence(x.Evidence)
	}
	for _, x := range st.Gaps {
		places(x.Places)
	}
	for _, x := range st.Tradeoffs {
		places(x.Places)
	}
	for _, x := range st.Findings {
		if x.File != "" && x.Line > 0 && !seen[x.File] {
			seen[x.File] = true
			p.annotated = append(p.annotated, x.File)
		}
	}
	slices.Sort(p.annotated)
}

var (
	refToken   = regexp.MustCompile(`(?:^|[^a-zA-Z0-9_./:-])((?:domain|feature|capability|rule|concept|persona|problem|constraint|initiative|mechanism|component):[a-z0-9]+(?:-[a-z0-9]+)*(?:@[a-z0-9]+(?:-[a-z0-9]+)*)?(?:#[a-z0-9]+(?:-[a-z0-9]+)*)?)`)
	annotation = regexp.MustCompile(`docqet:(?:implements|verifies|gap|tradeoff)[ \t]`)
	topKey     = regexp.MustCompile(`^([a-z][a-z-]*):`)
	itemID     = regexp.MustCompile(`^(\s*-\s+id:\s*)([a-z0-9-]+)(\s*(?:#.*)?)$`)
)

// apply makes the rename, or with dryRun works out what it would change.
func (p *renamePlan) apply(root string, dryRun bool) ([]renameEdit, error) {
	var edits []renameEdit
	files := append(slices.Clone(p.annotated), p.docFilesAll()...)
	slices.Sort(files)
	files = slices.Compact(files)
	for _, file := range files {
		_, isDoc := p.domains[file]
		full := filepath.Join(root, filepath.FromSlash(file))
		data, err := os.ReadFile(full)
		if err != nil {
			return nil, err
		}
		lines := strings.Split(string(data), "\n")
		own := slices.Contains(p.docFiles, file)
		changed := false
		inFront, section := false, ""
		for i, line := range lines {
			if isDoc {
				if strings.TrimSpace(line) == "---" {
					if i == 0 {
						inFront = true
						continue
					}
					if inFront {
						break
					}
				}
				if !inFront {
					continue
				}
				if m := topKey.FindStringSubmatch(line); m != nil {
					section = m[1]
				}
			} else if !annotation.MatchString(line) {
				continue
			}
			updated, what := p.rewriteLine(line, file, isDoc, own, section)
			if updated != line {
				lines[i] = updated
				changed = true
				edits = append(edits, renameEdit{File: file, Line: i + 1, What: what})
			}
		}
		if changed && !dryRun {
			if err := os.WriteFile(full, []byte(strings.Join(lines, "\n")), 0o644); err != nil {
				return nil, err
			}
		}
	}
	// A doc's file named after its old ID takes the new one.
	if p.oldKey == "" && p.oldID != p.newID {
		for _, file := range p.docFiles {
			if path.Base(file) != p.oldID+".md" {
				continue
			}
			to := path.Join(path.Dir(file), p.newID+".md")
			if _, err := os.Stat(filepath.Join(root, filepath.FromSlash(to))); err == nil {
				return nil, fmt.Errorf("can't rename %s to %s: it's taken", file, to)
			}
			if !dryRun {
				if err := os.Rename(filepath.Join(root, filepath.FromSlash(file)), filepath.Join(root, filepath.FromSlash(to))); err != nil {
					return nil, err
				}
			}
			edits = append(edits, renameEdit{File: file, What: "file", RenamedTo: to})
		}
	}
	return edits, nil
}

func (p *renamePlan) docFilesAll() []string {
	files := make([]string, 0, len(p.domains))
	for f := range p.domains {
		files = append(files, f)
	}
	return files
}

// rewriteLine renames what one line says: a doc's own id, domain or gap key
// when the line is in its own frontmatter, and any reference to it.
func (p *renamePlan) rewriteLine(line, file string, isDoc, own bool, section string) (string, string) {
	if own && isDoc {
		switch {
		case p.oldKey == "" && section == "id" && strings.HasPrefix(line, "id:"):
			return "id: " + p.newID, "id"
		case p.oldKey == "" && section == "domain" && strings.HasPrefix(line, "domain:") && p.oldDom != p.newDom:
			return "domain: " + p.newDom, "domain"
		case p.oldKey != "" && (section == "gaps" || section == "tradeoffs"):
			if m := itemID.FindStringSubmatch(line); m != nil && m[2] == p.oldKey {
				return m[1] + p.newKey + m[3], section + " key"
			}
		}
	}
	what := strings.TrimSpace(annotation.FindString(line))
	if isDoc {
		what = section
	}
	var b strings.Builder
	last := 0
	for _, m := range refToken.FindAllStringSubmatchIndex(line, -1) {
		start, end := m[2], m[3]
		token := line[start:end]
		r, ok := state.ParseRef(token)
		if !ok {
			continue
		}
		replacement, matched := p.replace(r, p.domains[file], isDoc)
		if !matched {
			// A doc moving to another domain keeps meaning what its links to
			// its old domain's rules and concepts meant.
			if !own || !isDoc || p.oldDom == p.newDom || r.Domain != "" || (r.Type != state.TypeRule && r.Type != state.TypeConcept) {
				continue
			}
			replacement = token + "@" + p.oldDom
		}
		b.WriteString(line[last:start])
		b.WriteString(replacement)
		last = end
	}
	if last == 0 {
		return line, ""
	}
	b.WriteString(line[last:])
	return b.String(), what
}

// replace returns what a reference becomes, and whether the rename is about
// it. domain is the domain of the doc it's written in, which a rule or
// concept link without one means.
func (p *renamePlan) replace(r state.Ref, domain string, inDoc bool) (string, bool) {
	if r.Type != p.typ || r.ID != p.oldID {
		return "", false
	}
	if p.oldDom != "" {
		dom := r.Domain
		if dom == "" && inDoc {
			dom = domain
		}
		if dom != p.oldDom {
			return "", false
		}
	}
	if p.oldKey != "" && r.Key != p.oldKey {
		return "", false
	}
	out := p.typ + ":" + p.newID
	if p.newDom != "" && (r.Domain != "" || !inDoc || domain != p.newDom) {
		out += "@" + p.newDom
	}
	switch {
	case p.oldKey != "":
		out += "#" + p.newKey
	case r.Key != "":
		out += "#" + r.Key
	}
	return out, true
}
