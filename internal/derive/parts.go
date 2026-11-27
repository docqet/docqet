package derive

import (
	"cmp"
	"slices"

	"github.com/docqet/docqet/internal/combine"
)

// Grouping is what a readiness's parts are: what's one level below what
// it's of. A product's are its areas, an area's, a persona's or an
// initiative's its features, a feature's its capabilities, and a
// capability's its steps, one improvement each.
type Grouping int

// The groupings, from the broadest.
const (
	ByArea Grouping = iota
	ByFeature
	ByCapability
	ByStep
)

// PartKind is what a part is: an area, a feature or a capability among
// those counted, a gap or decision that's the riskiest on capabilities in
// more than one of them, or, at its finest, one promotion.
type PartKind string

// The kinds of part.
const (
	PartArea       PartKind = "area"
	PartFeature    PartKind = "feature"
	PartCapability PartKind = "capability"
	PartGap        PartKind = "gap"
	PartDecision   PartKind = "decision"
	PartPromotion  PartKind = "promotion"
)

// Part is somewhere a readiness could rise, with how far, so the reader can
// see what holds it where it is and look further into each.
//
// An area, feature or capability names itself. A gap, decision or
// promotion is one step, its Next. Capabilities is those counted that are
// in it. Potential is what the readiness would be with all of it settled,
// unrounded: every capability in it at GA with nothing open on it, or the
// step taken. Next is the step in it that would raise the readiness most,
// nil when no one step raises it, such as two equally risky gaps on one
// capability. Potentials overlap, a capability can be in more than one
// part, so they don't add up.
type Part struct {
	Kind         PartKind
	Area         *combine.Area
	Feature      *combine.Feature
	Capability   *combine.Capability
	Capabilities []*combine.Capability
	Potential    float64
	Next         *Improvement
}

// group is an area, feature or capability among those counted, with where
// its capabilities are among the shares.
type group struct {
	part Part
	in   []int
}

// groupsOf returns the areas, features or capabilities some started
// capabilities fall in, as a grouping says. A capability in none of them is
// a group of its own, and one can be in several.
func groupsOf(p *combine.Product, parts []capabilityShare, by Grouping) []group {
	var groups []group
	grouped := make([]bool, len(parts))
	add := func(a Part, members []*combine.Capability) {
		var in []int
		for n, part := range parts {
			if slices.Contains(members, part.capability) {
				in = append(in, n)
				grouped[n] = true
			}
		}
		if len(in) > 0 {
			groups = append(groups, group{part: a, in: in})
		}
	}
	switch by {
	case ByArea:
		for _, a := range p.Areas {
			add(Part{Kind: PartArea, Area: a}, AreaCapabilities(p, a))
		}
	case ByFeature:
		for _, f := range p.Features {
			add(Part{Kind: PartFeature, Feature: f}, CapabilitiesByID(p, f.Capabilities))
		}
	}
	for n, part := range parts {
		if !grouped[n] {
			groups = append(groups, group{part: Part{Kind: PartCapability, Capability: part.capability}, in: []int{n}})
		}
	}
	return groups
}

// partsOf returns where the readiness of some started capabilities, whose
// figures are base and whose improvements one at a time are steps, could
// rise, as a grouping says, by how far each could raise it, most first:
//
//   - each area, feature or capability they fall in, with its potential,
//     every capability in it at GA with nothing open, and its next step:
//     the step in it that would raise readiness most, promoting all of it
//     to the next level among them;
//   - each gap or decision that's the riskiest on capabilities in more than
//     one of them, so it isn't hidden in any one.
//
// Where everything falls in one of them, it's the next grouping down, and
// at the finest, a capability's, each step is a part of its own. Only what
// would raise readiness is listed.
// docqet:implements capability:improvements
func partsOf(p *combine.Product, parts []capabilityShare, base figures, steps []Improvement, by Grouping) []Part {
	groups := groupsOf(p, parts, by)
	for by < ByStep && len(groups) == 1 {
		by++
		groups = groupsOf(p, parts, by)
	}
	if by == ByStep {
		return stepParts(steps)
	}

	var out []Part
	inSome := make([]bool, len(steps))
	for _, g := range groups {
		a := g.part
		settled := slices.Clone(parts)
		for _, n := range g.in {
			a.Capabilities = append(a.Capabilities, parts[n].capability)
			ga := *parts[n].capability
			ga.Stability = "ga"
			settled[n], _ = shareOfCapability(p, &ga)
			settled[n].riskiest, settled[n].next = exposedTo{}, exposedTo{}
		}
		f, _ := figuresOf(settled)
		if f.readiness-base.readiness <= gainsNothing {
			continue
		}
		a.Potential = f.readiness

		var next *Improvement
		consider := func(i Improvement) {
			if next == nil || i.Gain > next.Gain {
				next = &i
			}
		}
		for k, s := range steps {
			if within(s.Capabilities, a.Capabilities) {
				inSome[k] = true
				consider(s)
			}
		}
		several := Improvement{Kind: PromoteFeature, Feature: a.Feature}
		if a.Kind == PartArea {
			several = Improvement{Kind: PromoteArea, Area: a.Area}
		}
		if a.Kind != PartCapability {
			if i, ok := promoteSeveral(p, parts, base, several, g.in); ok {
				consider(i)
			}
		}
		a.Next = next
		out = append(out, a)
	}

	for k, s := range steps {
		if !inSome[k] && (s.Kind == Close || s.Kind == Answer) {
			out = append(out, stepPart(s))
		}
	}

	sortParts(out)
	return out
}

// stepParts returns each step as a part of its own, most first.
func stepParts(steps []Improvement) []Part {
	out := make([]Part, len(steps))
	for k, s := range steps {
		out[k] = stepPart(s)
	}
	sortParts(out)
	return out
}

// stepPart returns one step as a part: its potential is what it would
// make readiness.
func stepPart(s Improvement) Part {
	a := Part{Kind: PartPromotion, Capabilities: s.Capabilities, Potential: s.Readiness, Next: &s}
	switch s.Kind {
	case Close:
		a.Kind = PartGap
	case Answer:
		a.Kind = PartDecision
	}
	return a
}

// sortParts orders parts by their potential, most first, then by how much
// their next step adds.
func sortParts(parts []Part) {
	gain := func(a Part) float64 {
		if a.Next == nil {
			return 0
		}
		return a.Next.Gain
	}
	slices.SortStableFunc(parts, func(a, b Part) int {
		if c := cmp.Compare(b.Potential, a.Potential); c != 0 {
			return c
		}
		return cmp.Compare(gain(b), gain(a))
	})
}

// within reports whether every one of some capabilities is among others.
func within(these, others []*combine.Capability) bool {
	for _, c := range these {
		if !slices.Contains(others, c) {
			return false
		}
	}
	return true
}
