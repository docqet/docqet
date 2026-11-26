package derive

import (
	"math"

	"github.com/docqet/docqet/internal/combine"
	"github.com/docqet/docqet/internal/state"
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

// NotReady is what a started capability still needs to be ready: to reach
// Beta, where it's below, and to close each gap that's unacceptable on it.
// Its open decisions don't count toward readiness, but are left to settle
// there too.
type NotReady struct {
	Capability *combine.Capability
	BelowBeta  bool
	Gaps       []*combine.Gap
	Decisions  []state.Decision
}

// NeedsOf returns what a started capability still needs to be ready. It
// needs nothing once it's at Beta or GA with no unacceptable gap, its own or
// one on what it's built on. Only gaps count, not tradeoffs.
func NeedsOf(p *combine.Product, c *combine.Capability) NotReady {
	n := NotReady{
		Capability: c,
		BelowBeta:  combine.Rank(c.Stability) < combine.Rank("beta"),
		Decisions:  OpenDecisions(c.Doc),
	}
	for _, g := range GapsOn(p, c) {
		if on := scoreOn(p, g, c); VerdictOf(on.Score) == Unacceptable {
			n.Gaps = append(n.Gaps, g)
		}
	}
	return n
}

// Readiness is how ready people can rely on some capabilities being: a
// recommendation, 0 to 100, for people to judge by. Percent is rounded, and
// nil with nothing started. Maturity is theirs, unrounded, each at its level
// in short and weighted flat by capability, not by band: nil with nothing
// started. Levels is each capability's level, Draft for a draft. Gaps is
// every gap on them, their own and those of what they're built on, each
// scored on them.
type Readiness struct {
	Percent    *int
	Maturity   *float64
	Exposure   Exposure
	Levels     []string
	Gaps       Across
	Ready      []*combine.Capability
	NotReady   []NotReady
	NotStarted []*combine.Capability
}

// ReadinessOf returns the readiness of some capabilities, as of a
// capability, feature, domain, persona or product: their maturity less their
// exposure, maturity × (1 − exposure), with those that have nothing left,
// those that still need something and what, and the drafts, not started,
// which never count.
// docqet:implements capability:readiness
func ReadinessOf(p *combine.Product, capabilities []*combine.Capability) Readiness {
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
	r := Readiness{
		Exposure: ExposureOf(p, capabilities),
		Levels:   make([]string, len(capabilities)),
		Gaps:     RiskAcross(p, gaps, capabilities),
	}
	total, weights := 0, 0
	for i, c := range capabilities {
		r.Levels[i] = c.Stability
		s, ok := MaturityLevels[c.Stability]
		if !ok {
			r.NotStarted = append(r.NotStarted, c)
			continue
		}
		total += s.Score * s.Weight
		weights += s.Weight
		if needs := NeedsOf(p, c); !needs.BelowBeta && len(needs.Gaps) == 0 {
			r.Ready = append(r.Ready, c)
		} else {
			r.NotReady = append(r.NotReady, needs)
		}
	}
	if weights > 0 {
		m := float64(total) / float64(weights)
		exposure := 0.0
		if r.Exposure.Percent != nil {
			exposure = *r.Exposure.Percent
		}
		percent := int(math.Round(m * (1 - exposure/100)))
		r.Maturity, r.Percent = &m, &percent
	}
	return r
}

// Started returns how many capabilities a readiness is worked out from: the
// started ones.
func (r Readiness) Started() int {
	return len(r.Ready) + len(r.NotReady)
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
	{From: 0, Name: "Unready", Says: "Most of what they need is still being explored, or its gaps put a lot at stake."},
	{From: 25, Name: "Partial", Says: "Some of it can be used, but much of what they need is still taking shape."},
	{From: 50, Name: "Viable", Says: "Enough is settled for them to rely on day to day."},
	{From: 75, Name: "Ready", Says: "What they need is mostly stable, and little is at stake in what's left open."},
}

// Band returns the quarter a readiness falls in, from its rounded percent,
// or nil with nothing started.
func (r Readiness) Band() *ReadinessBand {
	if r.Percent == nil {
		return nil
	}
	band := ReadinessBands[0]
	for _, b := range ReadinessBands {
		if *r.Percent >= b.From {
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
