package derive

import (
	"slices"
	"strings"

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

// The kinds of thing a gap, tradeoff or decision can affect.
const (
	AffectsOutcome  = "outcome"
	AffectsRule     = "rule"
	AffectsGap      = "gap"
	AffectsTradeoff = "tradeoff"
)

// Affected is one thing a gap, tradeoff or decision affects, found: an
// expected outcome with its quality, a rule, a gap or a tradeoff, by Kind.
type Affected struct {
	Kind     string
	Outcome  *state.Outcome
	Quality  *state.Quality
	Rule     *combine.Rule
	Gap      *combine.Gap
	Tradeoff *combine.Tradeoff
}

// AffectedBy returns what a gap's, tradeoff's or decision's affects name,
// each found. Anything that isn't there is left out.
func AffectedBy(p *combine.Product, affects []string) []Affected {
	var out []Affected
	for _, ref := range affects {
		if strings.HasPrefix(ref, "outcome:") {
			if o, q := ExpectedOutcome(p.Rubric, ref); o != nil {
				out = append(out, Affected{Kind: AffectsOutcome, Outcome: o, Quality: q})
			}
			continue
		}
		if key, ok := strings.CutPrefix(ref, "rule:"); ok {
			if r := p.Rule(key); r != nil {
				out = append(out, Affected{Kind: AffectsRule, Rule: r})
			}
			continue
		}
		if g := p.Gap(ref); g != nil {
			out = append(out, Affected{Kind: AffectsGap, Gap: g})
		} else if t := p.Tradeoff(ref); t != nil {
			out = append(out, Affected{Kind: AffectsTradeoff, Tradeoff: t})
		}
	}
	return out
}

// HeldDecision is an open decision, with the doc it's held on and that doc's
// kind: domain, feature, capability, mechanism or component.
type HeldDecision struct {
	Decision state.Decision
	Kind     string
	Doc      *combine.Doc
}

// DecisionsAffecting returns the open decisions that affect a gap or
// tradeoff, by its ID, each with the doc it's held on: what it waits on, or
// what reopens it.
func DecisionsAffecting(p *combine.Product, id string) []HeldDecision {
	var out []HeldDecision
	add := func(kind string, d *combine.Doc) {
		for _, decision := range OpenDecisions(*d) {
			if slices.Contains(decision.Affects, id) {
				out = append(out, HeldDecision{Decision: decision, Kind: kind, Doc: d})
			}
		}
	}
	for _, d := range p.Domains {
		add("domain", &d.Doc)
	}
	for _, f := range p.Features {
		add("feature", &f.Doc)
	}
	for _, c := range p.Capabilities {
		add("capability", &c.Doc)
	}
	for _, t := range p.Mechanisms {
		add(combine.KindMechanism, &t.Doc)
	}
	for _, t := range p.Components {
		add(combine.KindComponent, &t.Doc)
	}
	return out
}

// RuleStanding is whether a capability holds to a rule it follows.
type RuleStanding string

// The standings a capability can have on a rule: not yet, when one of its
// gaps names the rule; with evidence, when something verifies or implements
// the rule; or on trust, when nothing says either way. A gap wins over
// evidence, since a rule's evidence is about every capability that follows
// it.
const (
	RuleGap      RuleStanding = "gap"
	RuleEvidence RuleStanding = "evidence"
	RuleTrust    RuleStanding = "trust"
)

// RuleStandingOf returns whether a capability holds to a rule it follows.
// Following a rule claims it holds, so on trust is the usual standing, not a
// warning.
func RuleStandingOf(c *combine.Capability, r *combine.Rule) RuleStanding {
	for _, id := range r.Gaps {
		if slices.Contains(c.Gaps, id) {
			return RuleGap
		}
	}
	if hasEvidence(r.Evidence) {
		return RuleEvidence
	}
	return RuleTrust
}

// hasEvidence reports whether anything implements or verifies a doc.
func hasEvidence(e combine.Evidence) bool {
	return len(e.Verifies) > 0 || len(e.Implements) > 0
}

func gapsByID(p *combine.Product, ids []string) []*combine.Gap {
	var out []*combine.Gap
	for _, id := range ids {
		if g := p.Gap(id); g != nil {
			out = append(out, g)
		}
	}
	return out
}

func tradeoffsByID(p *combine.Product, ids []string) []*combine.Tradeoff {
	var out []*combine.Tradeoff
	for _, id := range ids {
		if t := p.Tradeoff(id); t != nil {
			out = append(out, t)
		}
	}
	return out
}

// BuiltOn returns what a capability is built on: the mechanisms that apply
// to it and the components that list it.
func BuiltOn(p *combine.Product, c *combine.Capability) []*combine.Technical {
	var out []*combine.Technical
	for _, ref := range c.BuiltBy {
		if t := p.Technical(ref); t != nil {
			out = append(out, t)
		}
	}
	return out
}

// TechnicalGap is a gap on a mechanism or component a capability is built
// on, with what it's on.
type TechnicalGap struct {
	Gap *combine.Gap
	On  *combine.Technical
}

// Left is what's still open about a capability: decisions nobody has made,
// its known gaps, and the technical gaps of what it's built on. Evidence
// isn't among them: what's declared holds unless a gap says otherwise.
// Tradeoffs aren't either: they're decided.
type Left struct {
	Decisions []state.Decision
	Gaps      []*combine.Gap
	Technical []TechnicalGap
}

// Count returns how many things are left.
func (l Left) Count() int {
	return len(l.Decisions) + len(l.Gaps) + len(l.Technical)
}

// LeftIn returns what's still open about a capability. With technical
// false, as for a persona, it's only what someone using the product would
// notice.
func LeftIn(p *combine.Product, c *combine.Capability, technical bool) Left {
	l := Left{Decisions: OpenDecisions(c.Doc), Gaps: gapsByID(p, c.Gaps)}
	if technical {
		for _, t := range BuiltOn(p, c) {
			for _, g := range gapsByID(p, t.Gaps) {
				l.Technical = append(l.Technical, TechnicalGap{Gap: g, On: t})
			}
		}
	}
	return l
}

// Standing is where an expected outcome stands for a capability.
type Standing string

// The standings an expected outcome can have for a capability, from the
// first that holds.
const (
	// StandingNotExpected is when its level doesn't expect it.
	StandingNotExpected Standing = "not-expected"
	// StandingGap is when a gap on it, or on what it's built on, affects
	// the outcome.
	StandingGap Standing = "gap"
	// StandingTradeoff is when a tradeoff on it, or on what it's built on,
	// affects it: not met, by choice.
	StandingTradeoff Standing = "tradeoff"
	// StandingOpen is when an open decision on it, or on what it's built on,
	// affects it: whether to meet it isn't settled.
	StandingOpen Standing = "open"
	// StandingEvidence is when a mechanism or component it's built on says
	// it meets it.
	StandingEvidence Standing = "evidence"
	// StandingTrust is when nothing names it, so it counts as met on its
	// level's word.
	StandingTrust Standing = "trust"
)

// OutcomeStanding is where an expected outcome stands for a capability, with
// the gaps, tradeoffs and decisions that affect it and what says it meets
// it.
type OutcomeStanding struct {
	Standing  Standing
	Gaps      []*combine.Gap
	Tradeoffs []*combine.Tradeoff
	Decisions []state.Decision
	By        []*combine.Technical
}

// OutcomeStandingOf returns where an expected outcome stands for a
// capability, at its level in short.
func OutcomeStandingOf(p *combine.Product, c *combine.Capability, o state.Outcome) OutcomeStanding {
	on := BuiltOn(p, c)
	var s OutcomeStanding
	gaps, tradeoffs, decisions := gapsByID(p, c.Gaps), tradeoffsByID(p, c.Tradeoffs), OpenDecisions(c.Doc)
	for _, t := range on {
		gaps = append(gaps, gapsByID(p, t.Gaps)...)
		tradeoffs = append(tradeoffs, tradeoffsByID(p, t.Tradeoffs)...)
		decisions = append(decisions, OpenDecisions(t.Doc)...)
		if slices.Contains(t.Meets, o.ID) {
			s.By = append(s.By, t)
		}
	}
	for _, g := range gaps {
		if slices.Contains(g.Affects, o.ID) {
			s.Gaps = append(s.Gaps, g)
		}
	}
	for _, t := range tradeoffs {
		if slices.Contains(t.Affects, o.ID) {
			s.Tradeoffs = append(s.Tradeoffs, t)
		}
	}
	for _, d := range decisions {
		if slices.Contains(d.Affects, o.ID) {
			s.Decisions = append(s.Decisions, d)
		}
	}
	switch {
	case !AppliesAt(o, c.Stability):
		s.Standing = StandingNotExpected
	case len(s.Gaps) > 0:
		s.Standing = StandingGap
	case len(s.Tradeoffs) > 0:
		s.Standing = StandingTradeoff
	case len(s.Decisions) > 0:
		s.Standing = StandingOpen
	case len(s.By) > 0:
		s.Standing = StandingEvidence
	default:
		s.Standing = StandingTrust
	}
	return s
}
