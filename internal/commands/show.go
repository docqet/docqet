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
	"github.com/docqet/docqet/internal/state"
)

// ShowCommand shows one doc, gap or tradeoff in full.
// docqet:implements capability:cli-reads
func ShowCommand() *cli.Command {
	return &cli.Command{
		Name:      "show",
		Category:  reading,
		Usage:     "One doc, gap or tradeoff in full",
		ArgsUsage: "<reference>",
		Description: `Shows one doc with its fields, its links both ways, its evidence, its gaps
scored by risk, its tradeoffs and open decisions, and its body. A gap or
tradeoff is named by its doc and key, such as capability:room-booking#needs-a-mouse.`,
		ArgValidator: maxArgs(1),
		Flags:        sourceFlags(),
		Action: func(ctx context.Context, cmd *cli.Command) error {
			ref := cmd.Args().First()
			if ref == "" {
				return errors.New("show needs a reference, such as capability:room-booking")
			}
			lo, err := readHere(ctx, cmd, "")
			if err != nil {
				return err
			}
			s, err := showOf(lo.view.Product, ref)
			if err != nil {
				return err
			}
			out := cmd.Root().Writer
			if cmd.Bool("json") {
				writeJSON(out, map[string]any{"source": lo.source, "doc": s})
				return nil
			}
			_, _ = fmt.Fprintf(out, "%s\n\n", lo.source.line())
			s.print(out)
			return nil
		},
	}
}

// field is one line of a shown doc: a name and its values.
type field struct {
	Name   string   `json:"name"`
	Values []string `json:"values"`
}

// shown is a doc, gap or tradeoff as show shows it.
type shown struct {
	Ref         string         `json:"ref"`
	Type        string         `json:"type"`
	Name        string         `json:"name"`
	Description string         `json:"description,omitempty"`
	File        string         `json:"file,omitempty"`
	Fields      []field        `json:"fields"`
	Gaps        []gapView      `json:"gaps,omitempty"`
	Tradeoffs   []tradeoffView `json:"tradeoffs,omitempty"`
	Decisions   []decisionView `json:"decisions,omitempty"`
	Evidence    *evidenceView  `json:"evidence,omitempty"`
	Places      []state.Place  `json:"places,omitempty"`
	Body        string         `json:"body,omitempty"`
	gap         *gapView       // a gap shown on its own
	tradeoff    *tradeoffView  // a tradeoff shown on its own
}

type evidenceView struct {
	Implements []state.Place `json:"implements"`
	Verifies   []state.Place `json:"verifies"`
}

func evidenceOf(e combine.Evidence) *evidenceView {
	return &evidenceView{Implements: placesOf(e.Implements), Verifies: placesOf(e.Verifies)}
}

func (s *shown) add(name string, values ...string) {
	var kept []string
	for _, v := range values {
		if v != "" {
			kept = append(kept, v)
		}
	}
	if len(kept) > 0 {
		s.Fields = append(s.Fields, field{Name: name, Values: kept})
	}
}

func prefixed(prefix string, ids []string) []string {
	out := make([]string, len(ids))
	for i, id := range ids {
		out[i] = prefix + id
	}
	return out
}

// showOf finds what ref names and puts it together for show.
func showOf(p *combine.Product, ref string) (*shown, error) {
	r, ok := state.ParseRef(ref)
	if !ok {
		return nil, fmt.Errorf("%q isn't a reference: write <type>:<id>, such as capability:room-booking", ref)
	}
	notFound := fmt.Errorf("%s isn't in this project", ref)
	if r.Key != "" {
		return showItem(p, r)
	}
	switch r.Type {
	case state.TypeCapability:
		c := p.Capability(r.ID)
		if c == nil {
			return nil, notFound
		}
		s := docShown(c.Doc, r.Type, ref)
		s.add("stability", levelsOf(p, c)...)
		if c.Feature != nil {
			s.add("feature", "feature:"+*c.Feature)
		}
		s.add("solves", prefixed("problem:", c.Solves)...)
		s.add("personas", prefixed("persona:", c.Personas)...)
		s.add("initiatives", prefixed("initiative:", c.Initiatives)...)
		var rules []string
		for _, key := range c.Rules {
			standing := ""
			if rule := p.Rule(key); rule != nil {
				standing = " (" + string(derive.RuleStandingOf(c, rule)) + ")"
			}
			rules = append(rules, "rule:"+key+standing)
		}
		s.add("rules", rules...)
		s.add("respects", prefixed("constraint:", c.Respects)...)
		s.add("concepts", prefixed("concept:", c.Concepts)...)
		s.add("built by", c.BuiltBy...)
		s.add("archetypes", prefixed("archetype:", c.Archetypes)...)
		s.items(p, c.Gaps, c.Tradeoffs, ref, c.Doc)
		s.Evidence = evidenceOf(c.Evidence)
		return s, nil
	case state.TypeRule:
		rule := p.Rule(r.ID)
		if rule == nil {
			return nil, notFound
		}
		s := docShown(rule.Doc, r.Type, ref)
		if len(rule.From) > 0 && rule.From[0].Why != nil {
			s.add("why", oneLine(*rule.From[0].Why, 1000))
		}
		s.add("respects", prefixed("constraint:", rule.Respects)...)
		s.add("followed by", prefixed("capability:", rule.Capabilities)...)
		s.add("concepts", prefixed("concept:", rule.Concepts)...)
		s.add("gaps on it", declaredAll(rule.Gaps)...)
		s.Evidence = evidenceOf(rule.Evidence)
		return s, nil
	case state.TypeConcept:
		c := p.Concept(r.ID)
		if c == nil {
			return nil, notFound
		}
		s := docShown(c.Doc, r.Type, ref)
		s.add("used by", prefixed("capability:", c.Capabilities)...)
		s.add("rules", prefixed("rule:", c.Rules)...)
		for _, f := range c.From {
			for _, cw := range f.ConfusedWith {
				what := ""
				switch {
				case cw.Concept != nil:
					what = "concept:" + *cw.Concept
				case cw.Term != nil:
					what = *cw.Term
				}
				s.add("confused with", what+": "+oneLine(cw.Summary, 200))
			}
		}
		return s, nil
	case state.TypeArea:
		a := p.Area(r.ID)
		if a == nil {
			return nil, notFound
		}
		s := docShown(a.Doc, r.Type, ref)
		s.add("features", prefixed("feature:", a.Features)...)
		s.items(p, nil, nil, ref, a.Doc)
		return s, nil
	case state.TypeFeature:
		f := p.Feature(r.ID)
		if f == nil {
			return nil, notFound
		}
		s := docShown(f.Doc, r.Type, ref)
		if f.Area != nil {
			s.add("area", "area:"+*f.Area)
		}
		var caps []string
		for _, id := range f.Capabilities {
			if c := p.Capability(id); c != nil {
				caps = append(caps, fmt.Sprintf("capability:%s (%s)", id, c.Stability))
			} else {
				caps = append(caps, "capability:"+id)
			}
		}
		s.add("capabilities", caps...)
		s.items(p, nil, f.Tradeoffs, ref, f.Doc)
		return s, nil
	case state.TypePersona:
		pe := p.Persona(r.ID)
		if pe == nil {
			return nil, notFound
		}
		s := docShown(pe.Doc, r.Type, ref)
		if pe.Role != nil {
			s.add("role", *pe.Role)
		}
		if pe.Title != nil {
			s.add("title", *pe.Title)
		}
		s.add("problems", prefixed("problem:", pe.Problems)...)
		s.add("capabilities", prefixed("capability:", pe.Capabilities)...)
		s.add("features", prefixed("feature:", pe.Features)...)
		s.add("initiatives", prefixed("initiative:", pe.Initiatives)...)
		return s, nil
	case state.TypeConstraint:
		cn := p.Constraint(r.ID)
		if cn == nil {
			return nil, notFound
		}
		s := docShown(cn.Doc, r.Type, ref)
		if cn.Source != nil {
			s.add("source", *cn.Source)
		}
		switch cn.Applies {
		case "product":
			s.add("applies", "every problem in the product")
		case "project":
			s.add("applies", "every problem in "+strings.Join(cn.AppliesIn, ", "))
		}
		s.add("problems", prefixed("problem:", cn.Problems)...)
		s.add("respected by", slices.Concat(prefixed("rule:", cn.Rules), prefixed("capability:", cn.Capabilities),
			prefixed("mechanism:", cn.Mechanisms), prefixed("component:", cn.Components))...)
		s.items(p, cn.Gaps, nil, ref, cn.Doc)
		s.Evidence = evidenceOf(cn.Evidence)
		return s, nil
	case state.TypeProblem:
		pr := p.Problem(r.ID)
		if pr == nil {
			return nil, notFound
		}
		s := docShown(pr.Doc, r.Type, ref)
		if pr.Cost != nil {
			s.add("cost", *pr.Cost)
		}
		s.add("personas", prefixed("persona:", pr.Personas)...)
		s.add("capabilities", prefixed("capability:", pr.Capabilities)...)
		var constraints []string
		for _, on := range derive.ProblemConstraints(p, pr) {
			standing := " (respected by " + strings.Join(on.RespectedBy, ", ") + ")"
			switch {
			case on.Unaddressed():
				standing = " (nothing solving it respects it)"
			case len(on.RespectedBy) == 0:
				standing = " (applies to all, respected elsewhere)"
			}
			constraints = append(constraints, "constraint:"+on.Constraint.ID+standing)
		}
		s.add("subject to", constraints...)
		return s, nil
	case state.TypeInitiative:
		in := p.Initiative(r.ID)
		if in == nil {
			return nil, notFound
		}
		s := docShown(in.Doc, r.Type, ref)
		s.add("capabilities", prefixed("capability:", in.Capabilities)...)
		s.add("features", prefixed("feature:", in.Features)...)
		s.add("personas", prefixed("persona:", in.Personas)...)
		return s, nil
	case state.TypeMechanism, state.TypeComponent:
		t := p.Technical(ref)
		if t == nil {
			return nil, notFound
		}
		s := docShown(t.Doc, r.Type, ref)
		if t.Kind == combine.KindMechanism {
			s.add("applies", "every capability the "+t.Applies+" serves")
			s.add("respects", prefixed("constraint:", t.Respects)...)
		} else {
			if t.Within != "" {
				s.add("within", "component:"+t.Within)
			}
			if t.Archetype != "" {
				is := "archetype:" + t.Archetype
				if t.Is == "" {
					is += " (from component:" + t.Within + ")"
				}
				s.add("is", is)
			}
			s.add("parts", prefixed("component:", t.Parts)...)
			s.add("capabilities", prefixed("capability:", t.Capabilities)...)
			s.add("respects", prefixed("constraint:", t.Respects)...)
			s.add("gaps in its parts", partGaps(p, t)...)
		}
		s.add("meets", t.Meets...)
		s.items(p, t.Gaps, t.Tradeoffs, ref, t.Doc)
		s.Evidence = evidenceOf(t.Evidence)
		return s, nil
	case state.TypeArchetype:
		a := p.Archetype(r.ID)
		if a == nil {
			return nil, notFound
		}
		s := docShown(a.Doc, r.Type, ref)
		s.add("components", prefixed("component:", a.Components)...)
		s.add("builds", prefixed("capability:", a.Capabilities)...)
		return s, nil
	}
	return nil, fmt.Errorf("%s isn't a type of doc: it's one of area, feature, capability, rule, concept, persona, problem, constraint, initiative, mechanism, component or archetype", r.Type)
}

// partGaps is the gaps on a component's parts, and on theirs, so what's
// missing inside a big component shows on it.
func partGaps(p *combine.Product, t *combine.Technical) []string {
	var out []string
	seen := map[string]bool{t.ID: true}
	var walk func(parts []string)
	walk = func(parts []string) {
		for _, id := range parts {
			part := p.Technical(state.DocRef(state.TypeComponent, id))
			if part == nil || seen[id] {
				continue
			}
			seen[id] = true
			for _, g := range gapsOf(p, part.Gaps) {
				out = append(out, gapViewOf(p, g).ID)
			}
			walk(part.Parts)
		}
	}
	walk(t.Parts)
	return out
}

// docShown starts a shown doc with what every doc has.
func docShown(d combine.Doc, typ, ref string) *shown {
	return &shown{Ref: ref, Type: typ, Name: d.Name, Description: d.Description, File: d.File, Fields: []field{}, Body: strings.TrimSpace(d.Body)}
}

// items adds a doc's gaps, riskiest first, its tradeoffs and its open
// decisions.
func (s *shown) items(p *combine.Product, gaps, tradeoffs []string, on string, d combine.Doc) {
	for _, g := range gapsOf(p, gaps) {
		s.Gaps = append(s.Gaps, gapViewOf(p, g))
	}
	for _, t := range tradeoffsOf(p, tradeoffs) {
		s.Tradeoffs = append(s.Tradeoffs, tradeoffViewOf(t))
	}
	kind, _, _ := strings.Cut(on, ":")
	s.Decisions = []decisionView{}
	for i, decision := range derive.OpenDecisions(d) {
		v := heldDecisionView(p, derive.HeldDecision{Decision: decision, Kind: kind, Doc: &d, Index: i})
		v.On = ""
		s.Decisions = append(s.Decisions, v)
	}
}

// showItem shows a gap or tradeoff on its own.
func showItem(p *combine.Product, r state.Ref) (*shown, error) {
	doc := state.DocRef(r.Type, r.ID)
	ref := doc + "#" + r.Key
	if g := p.Gap(gapID(p, doc, r.Key)); g != nil {
		v := gapViewOf(p, g)
		s := &shown{Ref: ref, Type: "gap", Name: g.Name, Description: g.Description, Fields: []field{}, gap: &v}
		s.add("on", doc)
		s.add("ratings", v.ratings())
		s.add("risk", fmt.Sprintf("%d (%s)", v.Risk, v.Verdict))
		s.add("affects", v.Affects...)
		for _, on := range derive.RiskOf(p, g).On {
			s.add("scores", fmt.Sprintf("%d on capability:%s (%s)", on.Score, on.Capability.ID, on.Capability.Stability))
		}
		for _, d := range derive.DecisionsAffecting(p, g.ID) {
			s.Decisions = append(s.Decisions, heldDecisionView(p, d))
		}
		s.Places = v.Places
		s.Gaps = []gapView{v}
		return s, nil
	}
	if t := tradeoffOn(p, doc, r.Key); t != nil {
		v := tradeoffViewOf(t)
		s := &shown{Ref: ref, Type: "tradeoff", Name: t.Name, Description: t.Description, Fields: []field{}, tradeoff: &v}
		s.add("on", doc)
		if t.Benefit != nil {
			s.add("benefit", oneLine(*t.Benefit, 1000))
		}
		s.add("drawback", oneLine(t.Drawback, 1000))
		s.add("affects", v.Affects...)
		s.Places = v.Places
		s.Tradeoffs = []tradeoffView{v}
		return s, nil
	}
	return nil, fmt.Errorf("%s isn't a gap or tradeoff in this project", ref)
}

// gapID is the combined ID of the gap with key on doc, or "".
func gapID(p *combine.Product, doc, key string) string {
	prefix := doc + "#" + key + "@"
	for _, g := range p.Gaps {
		if strings.HasPrefix(g.ID, prefix) {
			return g.ID
		}
	}
	return ""
}

func (s *shown) print(out io.Writer) {
	_, _ = fmt.Fprintf(out, "%s   %s\n", s.Ref, s.Name)
	if s.Description != "" {
		_, _ = fmt.Fprintf(out, "%s\n", oneLine(s.Description, 2000))
	}
	_, _ = fmt.Fprintln(out)
	tw := tabwriter.NewWriter(out, 0, 0, 2, ' ', 0)
	for _, f := range s.Fields {
		_, _ = fmt.Fprintf(tw, "  %s\t%s\n", f.Name, strings.Join(f.Values, ", "))
	}
	if s.File != "" {
		_, _ = fmt.Fprintf(tw, "  file\t%s\n", s.File)
	}
	_ = tw.Flush()
	if s.gap == nil && len(s.Gaps) > 0 {
		_, _ = fmt.Fprintln(out, "\nGaps, riskiest first")
		tw = tabwriter.NewWriter(out, 0, 0, 2, ' ', 0)
		for _, g := range s.Gaps {
			_, _ = fmt.Fprintf(tw, "  %s\t%s\t%s\t%s\n", keyOf(g.ID), g.Name, g.ratings(), g.riskText())
		}
		_ = tw.Flush()
	}
	if s.tradeoff == nil && len(s.Tradeoffs) > 0 {
		_, _ = fmt.Fprintln(out, "\nTradeoffs")
		tw = tabwriter.NewWriter(out, 0, 0, 2, ' ', 0)
		for _, t := range s.Tradeoffs {
			_, _ = fmt.Fprintf(tw, "  %s\t%s\n", keyOf(t.ID), t.Name)
		}
		_ = tw.Flush()
	}
	if len(s.Decisions) > 0 {
		_, _ = fmt.Fprintln(out, "\nOpen decisions")
		for _, d := range s.Decisions {
			on := ""
			if d.On != "" {
				on = d.On + ": "
			}
			_, _ = fmt.Fprintf(out, "  %s%s\n", on, oneLine(d.Question, 200))
			if r := d.ratingsText(); r != "" {
				_, _ = fmt.Fprintf(out, "    %s\n", r)
			}
		}
	}
	if e := s.Evidence; e != nil && len(e.Implements)+len(e.Verifies) > 0 {
		_, _ = fmt.Fprintln(out, "\nEvidence")
		printPlaces(out, "implements", e.Implements)
		printPlaces(out, "verifies", e.Verifies)
	}
	if len(s.Places) > 0 {
		_, _ = fmt.Fprintln(out, "\nMarked in the code")
		printPlaces(out, "at", s.Places)
	}
	if s.Body != "" {
		_, _ = fmt.Fprintf(out, "\n%s\n", s.Body)
	}
}

func printPlaces(out io.Writer, verb string, places []state.Place) {
	for _, p := range places {
		_, _ = fmt.Fprintf(out, "  %s  %s:%d  %s\n", verb, p.File, p.Line, oneLine(p.Text, 80))
	}
}
