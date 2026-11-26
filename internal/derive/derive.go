// Package derive works out the figures nobody writes down from a combined
// product: maturity and its bands, each gap's risk and verdict, exposure,
// readiness, and what's left. They're the reporting domain's concepts, worked
// out as the UI works them out, with its numbers. It's pure: what it returns
// depends only on the product it's given.
//
// A figure for some capabilities, such as a domain's or a persona's
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
// docqet:implements rule:drafts-claim-nothing@reporting
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

// LevelInDomain returns a capability's level in a domain: its own there, as
// it can differ by domain, or else its level in short.
func LevelInDomain(c *combine.Capability, domain string) string {
	for _, l := range c.Levels {
		if l.Domain == domain {
			return l.Level
		}
	}
	return c.Stability
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

// DomainCapabilities returns every capability with a part in a domain: those
// in its parts of features, then those in no feature, each once.
func DomainCapabilities(p *combine.Product, d *combine.Domain) []*combine.Capability {
	var ids []string
	for _, id := range d.Features {
		if part := partOf(p.Feature(id), d.ID); part != nil {
			ids = appendNew(ids, part.Capabilities...)
		}
	}
	return CapabilitiesByID(p, appendNew(ids, d.Capabilities...))
}

// PersonaCapabilities returns the capabilities that list a persona: what a
// figure for the persona counts.
func PersonaCapabilities(p *combine.Product, persona *combine.Persona) []*combine.Capability {
	return CapabilitiesByID(p, persona.Capabilities)
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

// partOf returns a feature's part in a domain, or nil.
func partOf(f *combine.Feature, domain string) *combine.Part {
	if f == nil {
		return nil
	}
	for i := range f.Parts {
		if f.Parts[i].Domain == domain {
			return &f.Parts[i]
		}
	}
	return nil
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
