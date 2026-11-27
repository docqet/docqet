package commands

import (
	"context"
	"errors"
	"fmt"
	"slices"
	"strings"
	"text/tabwriter"

	"github.com/urfave/cli/v3"

	"github.com/docqet/docqet/internal/combine"
	"github.com/docqet/docqet/internal/derive"
)

// listKinds are what list lists, each by its plural.
var listKinds = []string{"domains", "features", "capabilities", "rules", "concepts", "personas", "problems", "constraints", "initiatives", "mechanisms", "components", "gaps", "tradeoffs", "decisions"}

// ListCommand lists docs of one kind, or gaps, tradeoffs or decisions.
// docqet:implements capability:cli-reads
func ListCommand() *cli.Command {
	return &cli.Command{
		Name:      "list",
		Category:  reading,
		Usage:     "Docs of one kind, or gaps, tradeoffs or decisions",
		ArgsUsage: "<kind>",
		Description: "Kinds: " + strings.Join(listKinds, ", ") + `.
Filters narrow the list as the UI's views do. A filter that doesn't apply to a
kind is refused.`,
		ArgValidator: maxArgs(1),
		Flags: withSourceFlags(
			&cli.StringFlag{Name: "stability", Usage: "only at `LEVEL`"},
			&cli.StringFlag{Name: "initiative", Usage: "only in initiative `ID`"},
			&cli.StringFlag{Name: "domain", Usage: "only in domain `ID`"},
			&cli.StringFlag{Name: "for", Usage: "only what affects `REF`, such as persona:front-desk-clerk"},
			&cli.StringFlag{Name: "on", Usage: "only what's on `REF`, such as component:ledger"},
			&cli.StringSliceFlag{Name: "impact", Usage: "only gaps with these `IMPACTS`, such as damaging,blocking"},
			&cli.StringFlag{Name: "sort", Usage: "order by `FIELD`, such as risk"},
		),
		Action: func(ctx context.Context, cmd *cli.Command) error {
			kind := kindOf(cmd.Args().First())
			if kind == "" {
				return fmt.Errorf("list needs a kind: one of %s", strings.Join(listKinds, ", "))
			}
			if err := listFlagsFit(cmd, kind); err != nil {
				return err
			}
			lo, err := readHere(ctx, cmd, cmd.String("initiative"))
			if err != nil {
				return err
			}
			rows, err := listRows(lo, cmd, kind)
			if err != nil {
				return err
			}
			out := cmd.Root().Writer
			if cmd.Bool("json") {
				writeJSON(out, map[string]any{"source": lo.source, "kind": kind, "items": rows})
				return nil
			}
			_, _ = fmt.Fprintf(out, "%s\n\n", lo.source.line())
			if len(rows) == 0 {
				_, _ = fmt.Fprintf(out, "No %s.\n", kind)
				return nil
			}
			tw := tabwriter.NewWriter(out, 0, 0, 2, ' ', 0)
			for _, r := range rows {
				_, _ = fmt.Fprintf(tw, "%s\t%s\t%s\n", r.Ref, oneLine(r.Name, 60), r.Detail)
			}
			return tw.Flush()
		},
	}
}

// kindOf is the kind a word names, plural or singular, or "".
func kindOf(word string) string {
	for _, k := range listKinds {
		if word == k || word+"s" == k || strings.TrimSuffix(k, "ies")+"y" == word {
			return k
		}
	}
	return ""
}

// listFlagsFit refuses a filter that doesn't apply to kind.
func listFlagsFit(cmd *cli.Command, kind string) error {
	fits := map[string][]string{
		"stability": {"capabilities"},
		"for":       {"capabilities", "gaps"},
		"on":        {"gaps", "tradeoffs", "decisions"},
		"impact":    {"gaps"},
		"sort":      {"gaps"},
		"domain":    {"features", "capabilities", "rules", "concepts", "gaps", "tradeoffs", "decisions"},
	}
	for flag, kinds := range fits {
		if cmd.IsSet(flag) && !slices.Contains(kinds, kind) {
			return fmt.Errorf("--%s only narrows %s", flag, strings.Join(kinds, ", "))
		}
	}
	if cmd.IsSet("sort") && cmd.String("sort") != "risk" {
		return errors.New("--sort only takes risk")
	}
	return nil
}

// listRow is one item in a list.
type listRow struct {
	Ref    string `json:"ref"`
	Name   string `json:"name"`
	Detail string `json:"detail,omitempty"`
	// Item is the gap, tradeoff or decision in full, for --json.
	Item any `json:"item,omitempty"`
}

func listRows(lo local, cmd *cli.Command, kind string) ([]listRow, error) {
	p, v := lo.view.Product, lo.view
	domain, on := cmd.String("domain"), cmd.String("on")
	var within []*combine.Capability
	if f := cmd.String("for"); f != "" {
		var err error
		if within, err = v.Within(f); err != nil {
			return nil, fmt.Errorf("--for %s: nothing it names is in this project", f)
		}
	}
	inDomain := func(d string) bool { return domain == "" || d == domain }
	isOn := func(id string) bool { return on == "" || strings.HasPrefix(declared(id), on+"#") }
	rows := []listRow{}
	switch kind {
	case "domains":
		for _, d := range p.Domains {
			rows = append(rows, listRow{Ref: "domain:" + d.ID, Name: d.Name})
		}
	case "features":
		for _, f := range p.Features {
			if domain != "" && f.Domain != domain && !slices.ContainsFunc(f.Parts, func(pt combine.Part) bool { return pt.Domain == domain }) {
				continue
			}
			rows = append(rows, listRow{Ref: "feature:" + f.ID, Name: f.Name, Detail: fmt.Sprintf("%d capabilities", len(f.Capabilities))})
		}
	case "capabilities":
		levels := []string{}
		if l := cmd.String("stability"); l != "" {
			levels = append(levels, l)
		}
		for _, c := range v.ListCapabilities(within, levels) {
			if domain != "" && !slices.ContainsFunc(c.Levels, func(l combine.LevelIn) bool { return l.Domain == domain }) {
				continue
			}
			rows = append(rows, listRow{Ref: "capability:" + c.ID, Name: c.Name, Detail: strings.Join(levelsOf(p, c), ", ")})
		}
	case "rules":
		for _, r := range p.Rules {
			if inDomain(r.Domain) {
				rows = append(rows, listRow{Ref: "rule:" + r.ID, Name: r.Name, Detail: fmt.Sprintf("followed by %d", len(r.Capabilities))})
			}
		}
	case "concepts":
		for _, c := range p.Concepts {
			if inDomain(c.Domain) {
				rows = append(rows, listRow{Ref: "concept:" + c.ID, Name: c.Name})
			}
		}
	case "personas":
		for _, pe := range p.Personas {
			detail := ""
			if pe.Title != nil {
				detail = *pe.Title
			}
			rows = append(rows, listRow{Ref: "persona:" + pe.ID, Name: pe.Name, Detail: detail})
		}
	case "problems":
		for _, pr := range p.Problems {
			rows = append(rows, listRow{Ref: "problem:" + pr.ID, Name: pr.Name, Detail: fmt.Sprintf("%d capabilities", len(pr.Capabilities))})
		}
	case "constraints":
		for _, cn := range p.Constraints {
			detail := ""
			if cn.Source != nil {
				detail = *cn.Source
			}
			rows = append(rows, listRow{Ref: "constraint:" + cn.ID, Name: cn.Name, Detail: detail})
		}
	case "initiatives":
		for _, in := range p.Initiatives {
			rows = append(rows, listRow{Ref: "initiative:" + in.ID, Name: in.Name, Detail: fmt.Sprintf("%d capabilities", len(in.Capabilities))})
		}
	case "mechanisms", "components":
		list := p.Mechanisms
		if kind == "components" {
			list = p.Components
		}
		for _, t := range list {
			detail := "applies to the " + t.Applies
			if t.Kind == combine.KindComponent {
				detail = fmt.Sprintf("relied on by %d", len(t.Capabilities))
			}
			rows = append(rows, listRow{Ref: t.Kind + ":" + t.ID, Name: t.Name, Detail: detail})
		}
	case "gaps":
		for _, l := range v.ListGaps(within, cmd.StringSlice("impact"), cmd.String("sort") == "risk") {
			g := l.Gap
			if !isOn(g.ID) || (domain != "" && !gapInDomain(p, g, domain)) {
				continue
			}
			gv := gapViewOf(p, g)
			rows = append(rows, listRow{Ref: gv.ID, Name: g.Name, Detail: gv.ratings() + "   " + gv.riskText(), Item: gv})
		}
	case "tradeoffs":
		for _, t := range p.Tradeoffs {
			if isOn(t.ID) && inDomain(t.Domain) {
				tv := tradeoffViewOf(t)
				rows = append(rows, listRow{Ref: tv.ID, Name: t.Name, Item: tv})
			}
		}
	case "decisions":
		for _, h := range v.ListDecisions() {
			ref := h.Kind + ":" + h.Doc.ID
			if (on != "" && ref != on) || !inDomain(h.Doc.Domain) {
				continue
			}
			d := heldDecisionView(v.Product, h)
			name := ""
			if h.Decision.Topic != nil {
				name = *h.Decision.Topic
			}
			detail := oneLine(h.Decision.Question, 100)
			if r := d.ratingsText(); r != "" {
				detail += "   " + r
			}
			rows = append(rows, listRow{Ref: ref, Name: name, Detail: detail, Item: d})
		}
	}
	return rows, nil
}

// gapInDomain reports whether a gap is in a domain: a product gap's own, or a
// technical gap on something a capability in that domain relies on.
func gapInDomain(p *combine.Product, g *combine.Gap, domain string) bool {
	if g.Domain != "" {
		return g.Domain == domain
	}
	for _, c := range derive.ShowsOn(p, g.ID) {
		if slices.ContainsFunc(c.Levels, func(l combine.LevelIn) bool { return l.Domain == domain }) {
			return true
		}
	}
	return false
}
