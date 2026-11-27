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
	"github.com/docqet/docqet/internal/state"
)

// listKinds are what list lists, each by its plural.
var listKinds = []string{"areas", "features", "capabilities", "rules", "concepts", "personas", "problems", "constraints", "initiatives", "mechanisms", "components", "archetypes", "gaps", "tradeoffs", "decisions"}

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
			&cli.StringFlag{Name: "area", Usage: "only in area `ID`"},
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
		"area":      {"features", "capabilities", "gaps", "tradeoffs", "decisions"},
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
	area, on := cmd.String("area"), cmd.String("on")
	var within []*combine.Capability
	if f := cmd.String("for"); f != "" {
		var err error
		if within, err = v.Within(f); err != nil {
			return nil, fmt.Errorf("--for %s: nothing it names is in this project", f)
		}
	}
	inArea, err := areaFilter(p, area)
	if err != nil {
		return nil, err
	}
	isOn := func(id string) bool { return on == "" || strings.HasPrefix(declared(id), on+"#") }
	rows := []listRow{}
	switch kind {
	case "areas":
		for _, a := range p.Areas {
			rows = append(rows, listRow{Ref: "area:" + a.ID, Name: a.Name, Detail: fmt.Sprintf("%d features", len(a.Features))})
		}
	case "features":
		for _, f := range p.Features {
			if !inArea(state.DocRef(state.TypeFeature, f.ID)) {
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
			if !inArea(state.DocRef(state.TypeCapability, c.ID)) {
				continue
			}
			rows = append(rows, listRow{Ref: "capability:" + c.ID, Name: c.Name, Detail: strings.Join(levelsOf(p, c), ", ")})
		}
	case "rules":
		for _, r := range p.Rules {
			rows = append(rows, listRow{Ref: "rule:" + r.ID, Name: r.Name, Detail: fmt.Sprintf("followed by %d", len(r.Capabilities))})
		}
	case "concepts":
		for _, c := range p.Concepts {
			rows = append(rows, listRow{Ref: "concept:" + c.ID, Name: c.Name})
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
				if t.Archetype != "" {
					detail = "archetype:" + t.Archetype + ", " + detail
				}
			}
			rows = append(rows, listRow{Ref: t.Kind + ":" + t.ID, Name: t.Name, Detail: detail})
		}
	case "archetypes":
		for _, a := range p.Archetypes {
			rows = append(rows, listRow{Ref: "archetype:" + a.ID, Name: a.Name, Detail: fmt.Sprintf("%d components", len(a.Components))})
		}
	case "gaps":
		for _, l := range v.ListGaps(within, cmd.StringSlice("impact"), cmd.String("sort") == "risk") {
			g := l.Gap
			if !isOn(g.ID) || (area != "" && !gapInArea(p, g, inArea)) {
				continue
			}
			gv := gapViewOf(p, g)
			rows = append(rows, listRow{Ref: gv.ID, Name: g.Name, Detail: gv.ratings() + "   " + gv.riskText(), Item: gv})
		}
	case "tradeoffs":
		for _, t := range p.Tradeoffs {
			if isOn(t.ID) && inArea(declaredOn(t.ID)) {
				tv := tradeoffViewOf(t)
				rows = append(rows, listRow{Ref: tv.ID, Name: t.Name, Item: tv})
			}
		}
	case "decisions":
		for _, h := range v.ListDecisions() {
			ref := h.Kind + ":" + h.Doc.ID
			if (on != "" && ref != on) || !inArea(ref) {
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

// areaFilter returns whether a doc, by reference, is in an area: the area
// itself, a feature in it, or a capability in one of those. With no area,
// everything is.
func areaFilter(p *combine.Product, area string) (func(string) bool, error) {
	if area == "" {
		return func(string) bool { return true }, nil
	}
	a := p.Area(area)
	if a == nil {
		return nil, fmt.Errorf("--area %s: there's no such area", area)
	}
	in := map[string]bool{state.DocRef(state.TypeArea, a.ID): true}
	for _, id := range a.Features {
		in[state.DocRef(state.TypeFeature, id)] = true
	}
	for _, c := range derive.AreaCapabilities(p, a) {
		in[state.DocRef(state.TypeCapability, c.ID)] = true
	}
	return func(ref string) bool { return in[ref] }, nil
}

// gapInArea reports whether a gap shows on a capability in an area: its own,
// or one relying on what a technical gap is on.
func gapInArea(p *combine.Product, g *combine.Gap, inArea func(string) bool) bool {
	return slices.ContainsFunc(derive.ShowsOn(p, g.ID), func(c *combine.Capability) bool {
		return inArea(state.DocRef(state.TypeCapability, c.ID))
	})
}

// declaredOn is the doc a gap or tradeoff ID is on, as a reference:
// feature:front-desk from feature:front-desk#no-groups@hotel-bookings.
func declaredOn(id string) string {
	on, _, _ := strings.Cut(declared(id), "#")
	return on
}
