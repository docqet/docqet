package derive

import (
	"cmp"
	"math"
	"slices"

	"github.com/docqet/docqet/internal/combine"
)

// ImprovementKind is what an improvement does: promote a capability to its
// next level, promote every capability in a feature or a domain to its next
// level, close a gap, or answer a rated decision.
type ImprovementKind string

// The kinds of improvement.
const (
	Promote        ImprovementKind = "promote"
	PromoteFeature ImprovementKind = "promote-feature"
	PromoteDomain  ImprovementKind = "promote-domain"
	Close          ImprovementKind = "close"
	Answer         ImprovementKind = "answer"
)

// Improvement is something that would raise the readiness of some
// capabilities, and by how much. It's what could be done, not what has to
// be: whether it's worth doing is for people to judge.
//
// A promotion names the capability and the level it would reach. Promoting
// a feature or a domain names it, and takes each of its capabilities to its
// own next level. Closing a gap names the gap,
// and answering a decision the decision. Capabilities is where it changes
// something among those counted: those promoted, or those the gap or
// decision is the riskiest on. Readiness, Maturity and
// Exposure are what they'd be after it, unrounded, and Gain how much
// readiness it adds. Band is the quarter it would move readiness into, nil
// when it stays in the same one.
type Improvement struct {
	Kind         ImprovementKind
	Capability   *combine.Capability
	To           string
	Feature      *combine.Feature
	Domain       *combine.Domain
	Gap          *combine.Gap
	Decision     *HeldDecision
	Capabilities []*combine.Capability
	Readiness    float64
	Maturity     float64
	Exposure     float64
	Gain         float64
	Band         *ReadinessBand
}

// figures are some capabilities' maturity, exposure and readiness,
// unrounded: maturity and readiness 0 to 100, and exposure a percentage.
type figures struct {
	maturity, exposure, readiness float64
}

// figuresOf returns the figures of some started capabilities' parts, or
// false with none started.
func figuresOf(parts []capabilityPart) (figures, bool) {
	score, matWeights, exposed, weights := 0.0, 0.0, 0.0, 0.0
	for _, c := range parts {
		score += c.score * c.matWeight
		matWeights += c.matWeight
		exposed += c.weight * c.exposure()
		weights += c.weight
	}
	if matWeights == 0 || weights == 0 {
		return figures{}, false
	}
	f := figures{maturity: score / matWeights, exposure: exposed / weights * 100}
	f.readiness = f.maturity * (1 - f.exposure/100)
	return f, true
}

// gainsNothing is a gain too small to count, from rounding.
const gainsNothing = 1e-9

// improve returns an improvement with what readiness, maturity and exposure
// would be once some capabilities' parts are changed, and how much it
// gains on base, or false when it would raise nothing.
func improve(i Improvement, base figures, changed []capabilityPart) (Improvement, bool) {
	f, ok := figuresOf(changed)
	if !ok {
		return i, false
	}
	i.Readiness, i.Maturity, i.Exposure = f.readiness, f.maturity, f.exposure
	i.Gain = f.readiness - base.readiness
	if i.Gain <= gainsNothing {
		return i, false
	}
	if before, after := readinessBandOf(int(math.Round(base.readiness))), readinessBandOf(int(math.Round(f.readiness))); after.From != before.From {
		i.Band = after
	}
	return i, true
}

// promotedPart returns a started capability's part at its next level, or
// false at GA.
func promotedPart(p *combine.Product, part capabilityPart) (capabilityPart, bool) {
	next := NextLevel(part.capability.Stability)
	if next == "" {
		return capabilityPart{}, false
	}
	c := *part.capability
	c.Stability = next
	return partOfCapability(p, &c)
}

// promoteSeveral returns promoting each of some capabilities, by where they
// are in parts, to its next level, as one improvement, or false when fewer
// than two can be promoted or it would raise nothing.
func promoteSeveral(p *combine.Product, parts []capabilityPart, base figures, i Improvement, these []int) (Improvement, bool) {
	changed := slices.Clone(parts)
	for _, n := range these {
		if promoted, ok := promotedPart(p, parts[n]); ok {
			changed[n] = promoted
			i.Capabilities = append(i.Capabilities, parts[n].capability)
		}
	}
	if len(i.Capabilities) < 2 {
		return i, false
	}
	return improve(i, base, changed)
}

// improvementsOf returns what would raise the readiness of some started
// capabilities, whose figures are base, one thing at a time, most first:
//
//   - promoting each one below GA to its next level, which raises maturity,
//     and can raise exposure where a gap or decision breaks a claim the new
//     level makes;
//   - closing each gap, or answering each rated decision, that's the
//     riskiest on one of them, which lowers exposure to the next riskiest
//     there. One that's the riskiest on several is one improvement.
//
// Only what would raise readiness is listed: a gap that isn't the riskiest
// anywhere raises nothing yet, and an unrated decision never does.
// Promoting several at once is worked out with the areas, in areasOf.
// docqet:implements capability:improvements
func improvementsOf(p *combine.Product, parts []capabilityPart, base figures) []Improvement {
	var out []Improvement
	add := func(i Improvement, changed []capabilityPart) {
		if i, ok := improve(i, base, changed); ok {
			out = append(out, i)
		}
	}

	for n, part := range parts {
		promoted, ok := promotedPart(p, part)
		if !ok {
			continue
		}
		changed := slices.Clone(parts)
		changed[n] = promoted
		add(Improvement{Kind: Promote, Capability: part.capability, To: promoted.capability.Stability, Capabilities: []*combine.Capability{part.capability}}, changed)
	}

	// Each gap or decision that's the riskiest somewhere, in the order first
	// met, with where it is.
	var keys []string
	riskiest := map[string][]int{}
	for n, part := range parts {
		if part.riskiest.key == "" || part.riskiest.on.Raw <= part.next.on.Raw {
			continue
		}
		if _, ok := riskiest[part.riskiest.key]; !ok {
			keys = append(keys, part.riskiest.key)
		}
		riskiest[part.riskiest.key] = append(riskiest[part.riskiest.key], n)
	}
	for _, key := range keys {
		changed := slices.Clone(parts)
		i := Improvement{}
		for _, n := range riskiest[key] {
			e := parts[n].riskiest
			i.Gap, i.Decision = e.gap, e.decision
			i.Capabilities = append(i.Capabilities, parts[n].capability)
			changed[n].riskiest, changed[n].next = parts[n].next, exposedTo{}
		}
		i.Kind = Close
		if i.Decision != nil {
			i.Kind = Answer
		}
		add(i, changed)
	}

	slices.SortStableFunc(out, func(a, b Improvement) int { return cmp.Compare(b.Gain, a.Gain) })
	return out
}
