// Package derive works out the figures nobody writes down from a combined
// product: maturity and its bands, each gap's risk and verdict, exposure,
// readiness, and its improvements. They're the understanding area's
// concepts, worked out as the UI works them out, with its numbers. It's pure: what it returns
// depends only on the product it's given.
//
// A figure for some capabilities, such as an area's or a persona's
// readiness, takes the capabilities it counts, so what's showing is decided
// before it: by which projects and initiative were combined, and by which
// capabilities are passed in.
package derive

import (
	"slices"
	"strings"

	"github.com/docqet/docqet/internal/combine"
	"github.com/docqet/docqet/internal/state"
)

// started reports whether level is a stability level, not a draft. Only
// started capabilities count toward a figure.
// docqet:implements rule:drafts-claim-nothing
func started(level string) bool {
	return combine.Rank(level) > 0
}

// AppliesAt reports whether an expected outcome applies at level: from its
// own level up, through Until where it has one. A draft claims none.
func AppliesAt(o state.Outcome, level string) bool {
	if !started(level) {
		return false
	}
	r := combine.Rank(level)
	return combine.Rank(o.Level) <= r && (o.Until == nil || combine.Rank(*o.Until) >= r)
}

// NextLevel returns the level after level: Prototype after a draft, or ""
// after GA.
func NextLevel(level string) string {
	r := max(combine.Rank(level), 0)
	if r < len(state.Levels) {
		return state.Levels[r]
	}
	return ""
}

// OutcomesOf returns every outcome of a quality, in level order.
func OutcomesOf(q *state.Quality) []state.Outcome {
	var outcomes []state.Outcome
	for _, l := range q.Levels {
		outcomes = append(outcomes, l.Outcomes...)
	}
	return outcomes
}

// ExpectedOutcome returns an expected outcome by its reference,
// outcome:<quality>/<level>/<id>, with its quality, or nils when the rubric
// has none.
func ExpectedOutcome(rubric *state.Rubric, id string) (*state.Outcome, *state.Quality) {
	if rubric == nil {
		return nil, nil
	}
	for qi := range rubric.Qualities {
		q := &rubric.Qualities[qi]
		for li := range q.Levels {
			for oi := range q.Levels[li].Outcomes {
				if o := &q.Levels[li].Outcomes[oi]; o.ID == id {
					return o, q
				}
			}
		}
	}
	return nil, nil
}

// CapabilitiesByID returns the capabilities with ids, in the order given,
// leaving out any not showing.
func CapabilitiesByID(p *combine.Product, ids []string) []*combine.Capability {
	var out []*combine.Capability
	for _, id := range ids {
		if c := p.Capability(id); c != nil {
			out = append(out, c)
		}
	}
	return out
}

// AreaCapabilities returns every capability in an area's features, each
// once.
func AreaCapabilities(p *combine.Product, a *combine.Area) []*combine.Capability {
	var ids []string
	for _, id := range a.Features {
		if f := p.Feature(id); f != nil {
			ids = appendNew(ids, f.Capabilities...)
		}
	}
	return CapabilitiesByID(p, ids)
}

// PersonaCapabilities returns the capabilities that list a persona: what a
// figure for the persona counts.
func PersonaCapabilities(p *combine.Product, persona *combine.Persona) []*combine.Capability {
	return CapabilitiesByID(p, persona.Capabilities)
}

// ProblemCapabilities returns the capabilities that solve a problem: what a
// figure for the problem counts.
func ProblemCapabilities(p *combine.Product, problem *combine.Problem) []*combine.Capability {
	return CapabilitiesByID(p, problem.Capabilities)
}

// ConstraintCapabilities returns the capabilities a constraint bears on: those
// that respect it, follow a rule respecting it, or rely on a component
// respecting it, and those a mechanism respecting it applies to. It's what a
// figure for the constraint counts.
func ConstraintCapabilities(p *combine.Product, constraint *combine.Constraint) []*combine.Capability {
	var ids []string
	add := func(list []string) {
		for _, id := range list {
			if !slices.Contains(ids, id) {
				ids = append(ids, id)
			}
		}
	}
	for _, key := range constraint.Rules {
		if r := p.Rule(key); r != nil {
			add(r.Capabilities)
		}
	}
	for _, id := range constraint.Mechanisms {
		if m := p.Technical(state.DocRef(state.TypeMechanism, id)); m != nil {
			add(m.Capabilities)
		}
	}
	add(constraint.Capabilities)
	for _, id := range constraint.Components {
		if c := p.Technical(state.DocRef(state.TypeComponent, id)); c != nil {
			add(c.Capabilities)
		}
	}
	return CapabilitiesByID(p, ids)
}

// ConstraintOn is a constraint that applies to a problem, and what, among
// the docs solving the problem, respects it: the capabilities solving it,
// the rules they follow, and the mechanisms and components they're built on.
// Broad is true when it applies because it applies to the whole project or
// product, not because the problem names it.
type ConstraintOn struct {
	Constraint  *combine.Constraint
	Broad       bool
	RespectedBy []string // as references
}

// Unaddressed reports whether nothing says the problem's solution keeps to
// it. A constraint the problem names needs something solving the problem to
// respect it. One that applies to everything is kept to wherever it's
// respected, so it's unaddressed only when nothing respects it at all.
func (c ConstraintOn) Unaddressed() bool {
	if len(c.RespectedBy) > 0 {
		return false
	}
	if !c.Broad {
		return true
	}
	cn := c.Constraint
	return len(cn.Rules) == 0 && len(cn.Mechanisms) == 0 && len(cn.Capabilities) == 0 && len(cn.Components) == 0
}

// ProblemConstraints returns the constraints that apply to a problem: those
// it's subject to, then those that apply to its whole product, or to a
// project it's written in, each with what solving it respects it.
// docqet:implements capability:constraints
func ProblemConstraints(p *combine.Product, problem *combine.Problem) []ConstraintOn {
	var projects []string
	for _, f := range problem.From {
		projects = append(projects, f.Project)
	}
	var applying []*combine.Constraint
	for _, id := range problem.SubjectTo {
		if cn := p.Constraint(id); cn != nil {
			applying = append(applying, cn)
		}
	}
	for _, cn := range p.Constraints {
		broad := cn.Applies == "product" ||
			(cn.Applies == "project" && slices.ContainsFunc(cn.AppliesIn, func(pr string) bool { return slices.Contains(projects, pr) }))
		if broad && !slices.Contains(applying, cn) {
			applying = append(applying, cn)
		}
	}

	out := make([]ConstraintOn, 0, len(applying))
	for _, cn := range applying {
		on := ConstraintOn{Constraint: cn, Broad: !slices.Contains(problem.SubjectTo, cn.ID), RespectedBy: []string{}}
		respected := func(ref string, respects []string) {
			if slices.Contains(respects, cn.ID) && !slices.Contains(on.RespectedBy, ref) {
				on.RespectedBy = append(on.RespectedBy, ref)
			}
		}
		for _, c := range ProblemCapabilities(p, problem) {
			respected(state.DocRef(state.TypeCapability, c.ID), c.Respects)
			for _, key := range c.Rules {
				if r := p.Rule(key); r != nil {
					respected(state.DocRef(state.TypeRule, r.ID), r.Respects)
				}
			}
			for _, ref := range c.BuiltBy {
				if t := p.Technical(ref); t != nil {
					respected(ref, t.Respects)
				}
			}
		}
		out = append(out, on)
	}
	return out
}

// PersonaCapabilitiesIn returns the capabilities in a feature that serve a
// persona: what a figure for the feature, for that persona, counts.
func PersonaCapabilitiesIn(p *combine.Product, persona *combine.Persona, f *combine.Feature) []*combine.Capability {
	var ids []string
	for _, id := range f.Capabilities {
		if slices.Contains(persona.Capabilities, id) {
			ids = append(ids, id)
		}
	}
	return CapabilitiesByID(p, ids)
}

// subjectOf returns what a gap or tradeoff is on, from its ID: capability
// and room-booking from capability:room-booking#no-waitlist@hotel-bookings.
func subjectOf(id string) (kind, subject string) {
	kind, rest, _ := strings.Cut(id, ":")
	subject, _, _ = strings.Cut(rest, "#")
	return kind, subject
}

// appendNew appends what isn't in list yet, keeping the order.
func appendNew(list []string, ids ...string) []string {
	for _, id := range ids {
		if !slices.Contains(list, id) {
			list = append(list, id)
		}
	}
	return list
}
