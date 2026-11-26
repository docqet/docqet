package derive

import "github.com/docqet/docqet/internal/combine"

// RiskBand is a quarter of the exposure scale: how much the gaps still open
// on some capabilities put at stake.
type RiskBand struct {
	ID   string
	From float64
	Name string
	Says string
}

// RiskBands are exposure's quarters, from the lowest.
var RiskBands = []RiskBand{
	{ID: "low", From: 0, Name: "Low", Says: "Little is at stake in its open gaps."},
	{ID: "minor", From: 25, Name: "Minor", Says: "Its open gaps could cost people a little, or seldom."},
	{ID: "moderate", From: 50, Name: "Moderate", Says: "Some of its open gaps could cost people if they bite."},
	{ID: "high", From: 75, Name: "High", Says: "Its open gaps are likely to cost people, or to cost them a lot."},
}

// Exposure is what the gaps still open on some capabilities put at stake
// together, 0 to 100, unrounded, or nil with nothing started. Capabilities is
// how many started ones it's worked out from. Band is nil with nothing
// started. Unacceptable is whether any gap is unacceptable on one of them.
type Exposure struct {
	Percent      *float64
	Capabilities int
	Band         *RiskBand
	Unacceptable bool
}

// ExposureOf returns the exposure of some capabilities, as of a feature,
// domain, project or persona. The most a capability could be exposed to is a
// certain damaging gap reaching all that breaks a claim its level makes. Its
// exposure is its riskiest gap's raw score's share of that, its own or one
// on what it's built on, and it counts with its level's weight in risk, at
// its level in short. Drafts don't count. Its band is the quarter it falls
// in, from its unrounded percent, and at least moderate while any gap is
// unacceptable on one of them.
func ExposureOf(p *combine.Product, capabilities []*combine.Capability) Exposure {
	var e Exposure
	exposed, weights := 0.0, 0.0
	for _, c := range capabilities {
		if !started(c.Stability) {
			continue
		}
		weight := RiskWeights[c.Stability]
		most := ImpactSteps["damaging"] * weight * ClaimFactors[c.Stability]
		var riskiest *RiskOn
		for _, g := range GapsOn(p, c) {
			if on := scoreOn(p, g, c); riskiest == nil || on.Raw > riskiest.Raw {
				riskiest = &on
			}
		}
		raw := 0.0
		if riskiest != nil {
			raw = riskiest.Raw
			if raw > 0 && VerdictOf(riskiest.Score) == Unacceptable {
				e.Unacceptable = true
			}
		}
		exposed += weight * raw / most
		weights += weight
		e.Capabilities++
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
