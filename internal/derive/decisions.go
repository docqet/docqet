package derive

import (
	"fmt"
	"slices"

	"github.com/docqet/docqet/internal/combine"
	"github.com/docqet/docqet/internal/state"
)

// OpenDecisions returns the open decisions a doc's contributions list, in
// order: all of them, since answering one deletes it.
func OpenDecisions(d combine.Doc) []state.Decision {
	var decisions []state.Decision
	for _, f := range d.From {
		decisions = append(decisions, f.Decisions...)
	}
	return decisions
}

// HeldDecision is an open decision, with the doc it's held on, that doc's
// kind (domain, feature, capability, mechanism or component), and where it
// is among that doc's open decisions.
type HeldDecision struct {
	Decision state.Decision
	Kind     string
	Doc      *combine.Doc
	Index    int
}

// Key is what tells one decision from another: decisions have no IDs, so
// it's the doc it's on and where it is among that doc's.
func (h HeldDecision) Key() string {
	return fmt.Sprintf("%s#%d", state.DocRef(h.Kind, h.Doc.ID), h.Index)
}

// held returns a doc's open decisions, each held on it.
func held(kind string, d *combine.Doc) []HeldDecision {
	var out []HeldDecision
	for i, decision := range OpenDecisions(*d) {
		out = append(out, HeldDecision{Decision: decision, Kind: kind, Doc: d, Index: i})
	}
	return out
}

// HeldDecisions returns every open decision showing, each with the doc it's
// on: domains', then features', capabilities', mechanisms' and components'.
func HeldDecisions(p *combine.Product) []HeldDecision {
	var out []HeldDecision
	for _, d := range p.Domains {
		out = append(out, held("domain", &d.Doc)...)
	}
	for _, f := range p.Features {
		out = append(out, held("feature", &f.Doc)...)
	}
	for _, c := range p.Capabilities {
		out = append(out, held("capability", &c.Doc)...)
	}
	for _, t := range p.Mechanisms {
		out = append(out, held(combine.KindMechanism, &t.Doc)...)
	}
	for _, t := range p.Components {
		out = append(out, held(combine.KindComponent, &t.Doc)...)
	}
	return out
}

// DecisionsAffecting returns the open decisions that affect a gap or
// tradeoff, by its ID, each with the doc it's held on: what it waits on, or
// what reopens it. Affecting it never gives a decision risk.
func DecisionsAffecting(p *combine.Product, id string) []HeldDecision {
	var out []HeldDecision
	for _, h := range HeldDecisions(p) {
		if slices.Contains(h.Decision.Affects, id) {
			out = append(out, h)
		}
	}
	return out
}

// DecisionCountsOn returns the capabilities a decision is scored on: the
// capability it's on, every capability of the feature it's on, every
// capability with a part in the domain it's on, or every capability the
// mechanism or component it's on serves.
func DecisionCountsOn(p *combine.Product, h HeldDecision) []*combine.Capability {
	switch h.Kind {
	case "capability":
		return CapabilitiesByID(p, []string{h.Doc.ID})
	case "feature":
		if f := p.Feature(h.Doc.ID); f != nil {
			return CapabilitiesByID(p, f.Capabilities)
		}
	case "domain":
		if d := p.Domain(h.Doc.ID); d != nil {
			return DomainCapabilities(p, d)
		}
	default:
		if t := p.Technical(state.DocRef(h.Kind, h.Doc.ID)); t != nil {
			return CapabilitiesByID(p, t.Capabilities)
		}
	}
	return nil
}

// DecisionsOn returns the open decisions scored on a capability: its own,
// its feature's, those of each domain it has a part in, and those of the
// mechanisms and components it's built on. Rated or not.
func DecisionsOn(p *combine.Product, c *combine.Capability) []HeldDecision {
	out := held("capability", &c.Doc)
	if c.Feature != nil {
		if f := p.Feature(*c.Feature); f != nil {
			out = append(out, held("feature", &f.Doc)...)
		}
	}
	var domains []string
	for _, l := range c.Levels {
		domains = appendNew(domains, l.Domain)
	}
	for _, id := range domains {
		if d := p.Domain(id); d != nil {
			out = append(out, held("domain", &d.Doc)...)
		}
	}
	for _, t := range BuiltOn(p, c) {
		out = append(out, held(t.Kind, &t.Doc)...)
	}
	return out
}

// decisionRated is a rated decision's ratings, as a gap's are.
func decisionRated(d state.Decision) rated {
	return rated{impact: *d.Impact, likelihood: *d.Likelihood, reach: *d.Reach, affects: d.Affects}
}

// DecisionRiskOf returns what's at stake in an open decision's answer
// changing what people rely on now, scored on each capability it counts on,
// as a gap's risk is: the same scale, read about the change. It's nil for a
// decision that isn't rated, which has no risk.
func DecisionRiskOf(p *combine.Product, h HeldDecision) *Risk {
	if !h.Decision.Rated() {
		return nil
	}
	r := decisionRated(h.Decision)
	var on []RiskOn
	for _, c := range DecisionCountsOn(p, h) {
		on = append(on, scoreRatedOn(p, r, c))
	}
	risk := riskFrom(r, on)
	return &risk
}
