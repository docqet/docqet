package derive

import (
	"math"
	"slices"
	"strings"

	"github.com/docqet/docqet/internal/combine"
)

// ImpactSteps is each impact's step, from negligible up.
var ImpactSteps = map[string]float64{"negligible": 1, "inconvenient": 2, "blocking": 3, "damaging": 4}

// LikelihoodFactors is each likelihood's factor: each step down takes off a
// quarter.
var LikelihoodFactors = map[string]float64{"certain": 1, "expected": 0.75, "possible": 0.5, "unlikely": 0.25}

// ReachFactors is each reach's factor, as likelihood's.
var ReachFactors = map[string]float64{"all": 1, "most": 0.75, "some": 0.5, "few": 0.25}

// ClaimFactors is how much more a gap weighs where it breaks a claim, by the
// level that makes it: the more people are entitled to rely on a claim, the
// more breaking it costs.
var ClaimFactors = map[string]float64{"prototype": 1, "alpha": 1.125, "beta": 1.25, "ga": 1.5}

// RiskWeights is how much people are entitled to rely on each level, and how
// exposed they are to its gaps. A draft weighs nothing.
var RiskWeights = map[string]float64{"prototype": 2, "alpha": 3, "beta": 4, "ga": 6}

// The raw scores that are 0 and 100 on the scale: a certain negligible gap
// reaching all on a Prototype, and a certain damaging gap reaching all and
// breaking a claim on GA.
var (
	rawMin = ImpactSteps["negligible"] * RiskWeights["prototype"]
	rawMax = ImpactSteps["damaging"] * RiskWeights["ga"] * ClaimFactors["ga"]
)

// Scale puts a raw score on 0 to 100 by a log scale, so each step adds a
// steady amount, rounded and never below 0.
func Scale(raw float64) int {
	if raw <= 0 {
		return 0
	}
	return max(0, int(math.Round(math.Log(raw/rawMin)/math.Log(rawMax/rawMin)*100)))
}

// Verdict is whether leaving a gap open is acceptable, by the third of the
// scale its risk falls in.
type Verdict string

// The verdicts.
const (
	Unacceptable Verdict = "unacceptable"
	Tolerable    Verdict = "tolerable"
	Acceptable   Verdict = "acceptable"
)

// Verdicts are the verdicts, worst first.
var Verdicts = []Verdict{Unacceptable, Tolerable, Acceptable}

// VerdictFrom is the score each verdict starts at.
var VerdictFrom = map[Verdict]int{Unacceptable: 67, Tolerable: 33, Acceptable: 0}

// VerdictOf returns the verdict for a score.
func VerdictOf(score int) Verdict {
	switch {
	case score >= VerdictFrom[Unacceptable]:
		return Unacceptable
	case score >= VerdictFrom[Tolerable]:
		return Tolerable
	}
	return Acceptable
}

// RiskOn is how a gap scores on one capability: each part's factor, whether
// it breaks a claim there and that claim's factor, 1 where it breaks none,
// what they multiply to, and that on the scale.
type RiskOn struct {
	Capability  *combine.Capability
	Impact      float64
	Likelihood  float64
	Reach       float64
	Weight      float64
	Claim       bool
	ClaimFactor float64
	Raw         float64
	Score       int
}

// Spread is how many capabilities a gap has one score on.
type Spread struct {
	Score        int
	Capabilities int
}

// Risk is what's at stake in leaving a gap, or a rated decision, open. Score
// is its highest score on the capabilities it shows on, 0 on none.
type Risk struct {
	Impact     string
	Likelihood string
	Reach      string
	Score      int
	Verdict    Verdict
	// Claim is whether it breaks a claim on any capability it shows on.
	Claim bool
	// On is each capability it shows on, highest score first, then most
	// stable.
	On           []RiskOn
	Capabilities int
	// Spread is how many capabilities have each score, highest first.
	Spread []Spread
}

// rated is what risk is worked out from: a gap's ratings and what it
// affects, or a rated decision's. The numbers are the same for both; a
// decision's are read about what its answer could change.
type rated struct {
	impact, likelihood, reach string
	affects                   []string
}

func gapRated(g *combine.Gap) rated {
	return rated{impact: g.Impact, likelihood: g.Likelihood, reach: g.Reach, affects: g.Affects}
}

// scoreOn returns how a gap scores on one capability.
func scoreOn(p *combine.Product, g *combine.Gap, c *combine.Capability) RiskOn {
	return scoreRatedOn(p, gapRated(g), c)
}

// scoreRatedOn returns how a gap or rated decision scores on one
// capability: its impact's step times its likelihood times its reach, times
// the capability's level's weight in risk, times that level's claim factor
// where it breaks a claim the capability makes, affecting a rule it follows
// or an outcome its level expects. A draft weighs nothing, and scores 0.
func scoreRatedOn(p *combine.Product, r rated, c *combine.Capability) RiskOn {
	on := RiskOn{
		Capability:  c,
		Impact:      ImpactSteps[r.impact],
		Likelihood:  LikelihoodFactors[r.likelihood],
		Reach:       ReachFactors[r.reach],
		Weight:      RiskWeights[c.Stability],
		ClaimFactor: 1,
	}
	if on.Weight > 0 && breaksClaim(p, r.affects, c) {
		on.Claim = true
		on.ClaimFactor = ClaimFactors[c.Stability]
	}
	on.Raw = on.Impact * on.Likelihood * on.Reach * on.Weight * on.ClaimFactor
	on.Score = Scale(on.Raw)
	return on
}

// breaksClaim reports whether what a gap or decision affects names a rule a
// capability follows, or an outcome its level in short expects.
func breaksClaim(p *combine.Product, affects []string, c *combine.Capability) bool {
	for _, ref := range affects {
		if rule, ok := strings.CutPrefix(ref, "rule:"); ok && slices.Contains(c.Rules, rule) {
			return true
		}
		if strings.HasPrefix(ref, "outcome:") {
			if o, _ := ExpectedOutcome(p.Rubric, ref); o != nil && AppliesAt(*o, c.Stability) {
				return true
			}
		}
	}
	return false
}

// ShowsOn returns the capabilities a gap or tradeoff shows on, by its ID:
// its capability's own, every capability its mechanism or component serves,
// or a feature's capabilities for a feature's tradeoff.
func ShowsOn(p *combine.Product, id string) []*combine.Capability {
	kind, subject := subjectOf(id)
	switch kind {
	case "capability":
		return CapabilitiesByID(p, []string{subject})
	case "feature":
		if f := p.Feature(subject); f != nil {
			return CapabilitiesByID(p, f.Capabilities)
		}
	default:
		if t := p.Technical(kind + ":" + subject); t != nil {
			return CapabilitiesByID(p, t.Capabilities)
		}
	}
	return nil
}

// RiskOf returns a gap's risk, scored on each capability it shows on. A
// tradeoff has none: it's chosen.
func RiskOf(p *combine.Product, g *combine.Gap) Risk {
	var on []RiskOn
	for _, c := range ShowsOn(p, g.ID) {
		on = append(on, scoreOn(p, g, c))
	}
	return riskFrom(gapRated(g), on)
}

// riskFrom returns a risk from how it scores on each capability it shows
// on: its highest score, with its verdict and spread.
func riskFrom(rt rated, on []RiskOn) Risk {
	slices.SortStableFunc(on, func(a, b RiskOn) int {
		if a.Score != b.Score {
			return b.Score - a.Score
		}
		return int(b.Weight - a.Weight)
	})
	r := Risk{
		Impact:       rt.impact,
		Likelihood:   rt.likelihood,
		Reach:        rt.reach,
		On:           on,
		Capabilities: len(on),
	}
	for _, o := range on {
		r.Claim = r.Claim || o.Claim
	}
	if len(on) > 0 {
		r.Score = on[0].Score
	}
	r.Verdict = VerdictOf(r.Score)
	for _, o := range on {
		if n := len(r.Spread); n > 0 && r.Spread[n-1].Score == o.Score {
			r.Spread[n-1].Capabilities++
		} else {
			r.Spread = append(r.Spread, Spread{Score: o.Score, Capabilities: 1})
		}
	}
	return r
}

// Scored is one gap among several, with its risk, and where it scores
// highest among the capabilities they're scored on, nil with none, where it
// scores 0.
type Scored struct {
	Gap     *combine.Gap
	Risk    Risk
	On      *RiskOn
	Score   int
	Verdict Verdict
}

// Across is what's at stake across some gaps, as in a capability, feature,
// domain, persona or component: each gap scored there, riskiest first, the
// highest of those and its verdict, and how many fall in each verdict. Score
// is nil, and Verdict "", with no gaps.
type Across struct {
	Score   *int
	Verdict Verdict
	Items   []Scored
	Counts  map[Verdict]int
}

// RiskAcross returns what's at stake across some gaps: each one's highest
// score on the capabilities within, or its risk anywhere when within is nil.
func RiskAcross(p *combine.Product, gaps []*combine.Gap, within []*combine.Capability) Across {
	var ids map[string]bool
	if within != nil {
		ids = map[string]bool{}
		for _, c := range within {
			ids[c.ID] = true
		}
	}
	items := make([]Scored, 0, len(gaps))
	for _, g := range gaps {
		s := Scored{Gap: g, Risk: RiskOf(p, g)}
		for i := range s.Risk.On {
			if ids == nil || ids[s.Risk.On[i].Capability.ID] {
				s.On = &s.Risk.On[i]
				break
			}
		}
		s.Score = s.Risk.Score
		if ids != nil {
			s.Score = 0
			if s.On != nil {
				s.Score = s.On.Score
			}
		}
		s.Verdict = VerdictOf(s.Score)
		items = append(items, s)
	}
	slices.SortStableFunc(items, func(a, b Scored) int { return b.Score - a.Score })
	a := Across{Items: items, Counts: map[Verdict]int{}}
	for _, v := range Verdicts {
		a.Counts[v] = 0
	}
	for _, s := range items {
		a.Counts[s.Verdict]++
	}
	if len(items) > 0 {
		a.Score = &items[0].Score
		a.Verdict = items[0].Verdict
	}
	return a
}

// byRisk orders risks riskiest first: by score, then by spread, comparing
// each capability's score in turn, highest first. It's for
// slices.SortStableFunc.
func byRisk(a, b Risk) int {
	for i := range max(len(a.On), len(b.On)) {
		if d := scoreAt(b.On, i) - scoreAt(a.On, i); d != 0 {
			return d
		}
	}
	return 0
}

func scoreAt(on []RiskOn, i int) int {
	if i < len(on) {
		return on[i].Score
	}
	return -1
}

// InRiskOrder returns items in order of their risk, riskiest first, keeping
// the given order among equals. of says which gap each is.
func InRiskOrder[T any](p *combine.Product, items []T, of func(T) *combine.Gap) []T {
	risks := make([]Risk, len(items))
	order := make([]int, len(items))
	for i, item := range items {
		risks[i] = RiskOf(p, of(item))
		order[i] = i
	}
	slices.SortStableFunc(order, func(a, b int) int { return byRisk(risks[a], risks[b]) })
	out := make([]T, len(items))
	for i, j := range order {
		out[i] = items[j]
	}
	return out
}
