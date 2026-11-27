package services

import (
	"slices"
	"strings"

	"github.com/docqet/docqet/internal/combine"
	"github.com/docqet/docqet/internal/derive"
)

// ListCapabilities returns the capabilities showing, in the product's order:
// only those within, when within isn't nil, and only those whose level in
// short is one of levels, when there are any.
func (v *View) ListCapabilities(within []*combine.Capability, levels []string) []*combine.Capability {
	out := []*combine.Capability{}
	for _, c := range v.Capabilities {
		if within != nil && !slices.Contains(within, c) {
			continue
		}
		if len(levels) > 0 && !slices.Contains(levels, c.Stability) {
			continue
		}
		out = append(out, c)
	}
	return out
}

// ListedGap is a gap in a list, with its score among the capabilities a for
// names, or nil without one.
type ListedGap struct {
	Gap    *combine.Gap
	Within *derive.Scored
}

// ListGaps returns the gaps showing, in the product's order, or riskiest
// first with byRisk. With within not nil, it's only the gaps that show on
// those capabilities, each with its score there, and riskiest is riskiest
// there. With impacts, it's only the gaps rated one of them.
func (v *View) ListGaps(within []*combine.Capability, impacts []string, byRisk bool) []ListedGap {
	rated := func(g *combine.Gap) bool {
		return len(impacts) == 0 || slices.Contains(impacts, g.Impact)
	}
	out := []ListedGap{}
	if within == nil {
		for _, g := range v.Gaps {
			if rated(g) {
				out = append(out, ListedGap{Gap: g})
			}
		}
		if byRisk {
			out = derive.InRiskOrder(v.Product, out, func(l ListedGap) *combine.Gap { return l.Gap })
		}
		return out
	}
	// RiskAcross puts them riskiest there first, keeping the product's order
	// among equals.
	across := derive.RiskAcross(v.Product, v.Gaps, within)
	scored := map[*combine.Gap]*derive.Scored{}
	for i := range across.Items {
		if s := &across.Items[i]; s.On != nil && rated(s.Gap) {
			scored[s.Gap] = s
		}
	}
	if byRisk {
		for i := range across.Items {
			if s := &across.Items[i]; scored[s.Gap] != nil {
				out = append(out, ListedGap{Gap: s.Gap, Within: s})
			}
		}
		return out
	}
	for _, g := range v.Gaps {
		if s := scored[g]; s != nil {
			out = append(out, ListedGap{Gap: g, Within: s})
		}
	}
	return out
}

// ListDecisions returns every open decision showing, with the doc it's held
// on, riskiest first: the rated ones by their risk, then those with none,
// each in the product's order, the domains', then the features',
// capabilities', mechanisms' and components'.
func (v *View) ListDecisions() []derive.HeldDecision {
	out := derive.HeldDecisions(v.Product)
	scores := map[string]int{}
	for _, h := range out {
		scores[h.Key()] = -1
		if r := derive.DecisionRiskOf(v.Product, h); r != nil {
			scores[h.Key()] = r.Score
		}
	}
	slices.SortStableFunc(out, func(a, b derive.HeldDecision) int { return scores[b.Key()] - scores[a.Key()] })
	if out == nil {
		out = []derive.HeldDecision{}
	}
	return out
}

// The places a search can match a doc, best first.
const (
	MatchName        = "name"
	MatchDescription = "description"
	MatchBody        = "body"
)

// SearchResult is a doc that matches a search, and where it matched best.
type SearchResult struct {
	Kind        string // project, domain, feature, capability, rule, concept, persona, problem, constraint or initiative
	ID          string
	Name        string
	Description string
	Match       string
}

// Search returns the projects and docs whose text contains q, ignoring case:
// those whose name matches first, then their description, then their body,
// each in the product's order. Every project's contribution counts, and a
// rule's why and a concept's confusions count as body.
func (v *View) Search(q string) []SearchResult {
	q = strings.ToLower(q)
	byMatch := map[string][]SearchResult{}
	add := func(kind string, d combine.Doc) {
		names, descriptions, bodies := []string{d.Name}, []string{d.Description}, []string{d.Body}
		for _, f := range d.From {
			names = append(names, f.Name)
			descriptions = append(descriptions, f.Description)
			bodies = append(bodies, f.Body)
			if f.Why != nil {
				bodies = append(bodies, *f.Why)
			}
			for _, c := range f.ConfusedWith {
				bodies = append(bodies, c.Summary)
			}
		}
		for _, m := range []struct {
			match string
			texts []string
		}{{MatchName, names}, {MatchDescription, descriptions}, {MatchBody, bodies}} {
			if slices.ContainsFunc(m.texts, func(t string) bool { return strings.Contains(strings.ToLower(t), q) }) {
				byMatch[m.match] = append(byMatch[m.match], SearchResult{Kind: kind, ID: d.ID, Name: d.Name, Description: d.Description, Match: m.match})
				return
			}
		}
	}
	for _, p := range v.Projects {
		add("project", combine.Doc{ID: p.ID, Name: p.Name})
	}
	for _, d := range v.Domains {
		add("domain", d.Doc)
	}
	for _, f := range v.Features {
		add("feature", f.Doc)
	}
	for _, c := range v.Capabilities {
		add("capability", c.Doc)
	}
	for _, r := range v.Rules {
		add("rule", r.Doc)
	}
	for _, c := range v.Concepts {
		add("concept", c.Doc)
	}
	for _, p := range v.Personas {
		add("persona", p.Doc)
	}
	for _, pr := range v.Problems {
		add("problem", pr.Doc)
	}
	for _, cn := range v.Constraints {
		add("constraint", cn.Doc)
	}
	for _, i := range v.Initiatives {
		add("initiative", i.Doc)
	}
	out := []SearchResult{}
	for _, m := range []string{MatchName, MatchDescription, MatchBody} {
		out = append(out, byMatch[m]...)
	}
	return out
}
