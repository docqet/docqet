package derive

import "github.com/docqet/docqet/internal/combine"

// RiskBand is a quarter of the exposure scale: how much the gaps and rated
// decisions still open on some capabilities put at stake.
type RiskBand struct {
	ID   string
	From float64
	Name string
	Says string
}

// RiskBands are exposure's quarters, from the lowest.
var RiskBands = []RiskBand{
	{ID: "low", From: 0, Name: "Low", Says: "Little is at stake in what's open on it."},
	{ID: "minor", From: 25, Name: "Minor", Says: "What's open on it could cost people a little, or seldom."},
	{ID: "moderate", From: 50, Name: "Moderate", Says: "Some of what's open on it could cost people if it bites or changes."},
	{ID: "high", From: 75, Name: "High", Says: "What's open on it is likely to cost people, or to cost them a lot."},
}

// Exposure is what the gaps and rated decisions still open on some
// capabilities put at stake together, 0 to 100, unrounded, or nil with
// nothing started. Capabilities is how many started ones it's worked out
// from. Band is nil with nothing started. Unacceptable is whether any gap or
// decision is unacceptable on one of them.
type Exposure struct {
	Percent      *float64
	Capabilities int
	Band         *RiskBand
	Unacceptable bool
}

// exposedTo is one gap or rated decision scored on a capability, by its
// key: a gap's ID, or a decision's Key.
type exposedTo struct {
	key      string
	gap      *combine.Gap
	decision *HeldDecision
	on       RiskOn
}

// exposedOn returns every gap and rated decision scored on a capability:
// its own gaps and those of what it's built on, then the rated decisions
// that count on it.
func exposedOn(p *combine.Product, c *combine.Capability) []exposedTo {
	var out []exposedTo
	for _, g := range GapsOn(p, c) {
		out = append(out, exposedTo{key: g.ID, gap: g, on: scoreOn(p, g, c)})
	}
	for _, h := range DecisionsOn(p, c) {
		if h.Decision.Rated() {
			out = append(out, exposedTo{key: h.Key(), decision: &h, on: scoreRatedOn(p, decisionRated(h.Decision), c)})
		}
	}
	return out
}

// capabilityPart is what one started capability adds to its group's
// maturity and exposure: its level's score and weight in maturity, its
// weight in risk and the most it could be exposed to, and the two riskiest
// things it's exposed to, so the exposure left once the riskiest is closed
// or answered is known. riskiest and next have no key when there's nothing.
type capabilityPart struct {
	capability       *combine.Capability
	score, matWeight float64
	weight, most     float64
	riskiest, next   exposedTo
}

// exposure is the capability's share of the most it could be exposed to.
func (c capabilityPart) exposure() float64 {
	return c.riskiest.on.Raw / c.most
}

// partOfCapability returns what a started capability adds, at its level in
// short, or false for a draft, which adds nothing.
func partOfCapability(p *combine.Product, c *combine.Capability) (capabilityPart, bool) {
	s, ok := MaturityLevels[c.Stability]
	if !ok {
		return capabilityPart{}, false
	}
	part := capabilityPart{
		capability: c,
		score:      float64(s.Score),
		matWeight:  float64(s.Weight),
		weight:     RiskWeights[c.Stability],
		most:       ImpactSteps["damaging"] * RiskWeights[c.Stability] * ClaimFactors[c.Stability],
	}
	for _, e := range exposedOn(p, c) {
		switch {
		case part.riskiest.key == "" || e.on.Raw > part.riskiest.on.Raw:
			part.next, part.riskiest = part.riskiest, e
		case part.next.key == "" || e.on.Raw > part.next.on.Raw:
			part.next = e
		}
	}
	return part, true
}

// partsOf returns what each started capability adds, in order.
func partsOf(p *combine.Product, capabilities []*combine.Capability) []capabilityPart {
	var parts []capabilityPart
	for _, c := range capabilities {
		if part, ok := partOfCapability(p, c); ok {
			parts = append(parts, part)
		}
	}
	return parts
}

// ExposureOf returns the exposure of some capabilities, as of a feature,
// domain, project or persona. The most a capability could be exposed to is a
// certain damaging gap reaching all that breaks a claim its level makes. Its
// exposure is the share of that of its riskiest gap or rated decision, its
// own, one that counts on it, or one on what it's built on, and it counts
// with its level's weight in risk, at its level in short. Drafts don't
// count. Its band is the quarter it falls in, from its unrounded percent,
// and at least moderate while any gap or decision is unacceptable on one of
// them.
func ExposureOf(p *combine.Product, capabilities []*combine.Capability) Exposure {
	return exposureOf(partsOf(p, capabilities))
}

func exposureOf(parts []capabilityPart) Exposure {
	e := Exposure{Capabilities: len(parts)}
	exposed, weights := 0.0, 0.0
	for _, c := range parts {
		if c.riskiest.on.Raw > 0 && VerdictOf(c.riskiest.on.Score) == Unacceptable {
			e.Unacceptable = true
		}
		exposed += c.weight * c.exposure()
		weights += c.weight
	}
	if weights == 0 {
		return e
	}
	percent := exposed / weights * 100
	e.Percent = &percent
	band := RiskBands[0]
	for _, b := range RiskBands {
		if percent >= b.From {
			band = b
		}
	}
	if e.Unacceptable && band.From < RiskBands[2].From {
		band = RiskBands[2]
	}
	e.Band = &band
	return e
}
