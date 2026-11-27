package derive

import (
	"math"

	"github.com/docqet/docqet/internal/combine"
)

// GapsOn returns the gaps that show on a capability: its own, then those of
// the mechanisms and components it's built on.
func GapsOn(p *combine.Product, c *combine.Capability) []*combine.Gap {
	gaps := gapsByID(p, c.Gaps)
	for _, t := range BuiltOn(p, c) {
		gaps = append(gaps, gapsByID(p, t.Gaps)...)
	}
	return gaps
}

// Readiness is how ready people can rely on some capabilities being: a
// recommendation, 0 to 100, for people to judge by. Percent is rounded, and
// nil with nothing started. Maturity is theirs, unrounded, each at its level
// in short and weighted flat by capability, not by band: nil with nothing
// started. Levels is each capability's level, Draft for a draft. Gaps is
// every gap on them, their own and those of what they're built on, each
// scored on them. Started is how many it's worked out from, and NotStarted
// the drafts, which never count. Improvements is what would raise it, one
// thing at a time, most first, and Areas where it could rise, one level
// below what it's of, by how far, most first.
type Readiness struct {
	Percent      *int
	Maturity     *float64
	Exposure     Exposure
	Levels       []string
	Gaps         Across
	Started      int
	NotStarted   []*combine.Capability
	Improvements []Improvement
	Areas        []Area
}

// ReadinessOf returns the readiness of some capabilities, as of a
// capability, feature, domain, persona or product: their maturity less their
// exposure, maturity × (1 − exposure), with what would raise it, and the
// drafts, not started, which never count. by is what its areas are: the
// parts one level below what it's of.
// docqet:implements capability:readiness
func ReadinessOf(p *combine.Product, capabilities []*combine.Capability, by Grouping) Readiness {
	var gaps []*combine.Gap
	seen := map[*combine.Gap]bool{}
	for _, c := range capabilities {
		for _, g := range GapsOn(p, c) {
			if !seen[g] {
				seen[g] = true
				gaps = append(gaps, g)
			}
		}
	}
	parts := partsOf(p, capabilities)
	r := Readiness{
		Exposure: exposureOf(parts),
		Levels:   make([]string, len(capabilities)),
		Gaps:     RiskAcross(p, gaps, capabilities),
		Started:  len(parts),
	}
	for i, c := range capabilities {
		r.Levels[i] = c.Stability
		if !started(c.Stability) {
			r.NotStarted = append(r.NotStarted, c)
		}
	}
	if f, ok := figuresOf(parts); ok {
		percent := int(math.Round(f.readiness))
		r.Maturity, r.Percent = &f.maturity, &percent
		r.Improvements = improvementsOf(p, parts, f)
		r.Areas = areasOf(p, parts, f, r.Improvements, by)
	}
	return r
}

// ReadinessBand is a quarter of the readiness scale, named for what it
// recommends.
type ReadinessBand struct {
	From int
	Name string
	Says string
}

// ReadinessBands are readiness's quarters, from the lowest.
var ReadinessBands = []ReadinessBand{
	{From: 0, Name: "Unready", Says: "Most of what they need is still being explored, or what's open on it puts a lot at stake."},
	{From: 25, Name: "Partial", Says: "Some of it can be used, but much of what they need is still taking shape."},
	{From: 50, Name: "Viable", Says: "Enough is settled for them to rely on day to day."},
	{From: 75, Name: "Ready", Says: "What they need is mostly stable, and little is at stake in what's still open."},
}

// Band returns the quarter a readiness falls in, from its rounded percent,
// or nil with nothing started.
func (r Readiness) Band() *ReadinessBand {
	if r.Percent == nil {
		return nil
	}
	return readinessBandOf(*r.Percent)
}

// readinessBandOf returns the quarter a rounded readiness falls in.
func readinessBandOf(percent int) *ReadinessBand {
	band := ReadinessBands[0]
	for _, b := range ReadinessBands {
		if percent >= b.From {
			band = b
		}
	}
	return &band
}

// IsReady reports whether a readiness is in the Ready quarter, by its
// percent alone, and whether anything is started: with nothing started, it's
// neither ready nor not.
func (r Readiness) IsReady() (ready, started bool) {
	if r.Percent == nil {
		return false, false
	}
	return *r.Percent >= ReadinessBands[3].From, true
}
