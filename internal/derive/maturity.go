package derive

import (
	"math"

	"github.com/docqet/docqet/internal/combine"
)

// LevelScore is what a capability at a level adds to a maturity: its score,
// and how much weight that score carries in the average.
type LevelScore struct {
	Score  int
	Weight int
}

// MaturityLevels is each level's score and weight. Higher levels weigh more,
// one GA as much as 1.5 Betas, 2 Alphas or 3 Prototypes, and each score sits
// inside its level's band, so something whose capabilities are all at one
// level lands in that level's band. Drafts have neither: they don't count.
var MaturityLevels = map[string]LevelScore{
	"prototype": {Score: 15, Weight: 2},
	"alpha":     {Score: 35, Weight: 3},
	"beta":      {Score: 60, Weight: 4},
	"ga":        {Score: 100, Weight: 6},
}

// Band is a quarter of the maturity scale, named for the level it's closest
// to, whose color it takes.
type Band struct {
	Level string
	Name  string
	From  int
}

// Bands are maturity's quarters, from the lowest.
var Bands = []Band{
	{Level: "prototype", Name: "Experimental", From: 0},
	{Level: "alpha", Name: "Emerging", From: 25},
	{Level: "beta", Name: "Promising", From: 50},
	{Level: "ga", Name: "Established", From: 75},
}

// BandOf returns the band a maturity is in. It's rounded and kept to 0 to
// 100 first, and each band starts at its From: 25 is Emerging.
func BandOf(maturity float64) Band {
	clamped := min(max(math.Round(maturity), 0), 100)
	return Bands[min(int(clamped)/25, 3)]
}

// Maturity is how far along some work is, as a whole percentage, with the
// band it's in.
type Maturity struct {
	Percent int
	Band    Band
}

func maturity(percent float64) *Maturity {
	p := int(math.Round(percent))
	return &Maturity{Percent: p, Band: BandOf(float64(p))}
}

// MaturityOfLevels returns the maturity of some levels: the weighted average
// of their scores in MaturityLevels, rounded. Drafts are left out, and it's
// nil when nothing is started.
func MaturityOfLevels(levels []string) *Maturity {
	total, weights := 0, 0
	for _, l := range levels {
		if s, ok := MaturityLevels[l]; ok {
			total += s.Score * s.Weight
			weights += s.Weight
		}
	}
	if weights == 0 {
		return nil
	}
	return maturity(float64(total) / float64(weights))
}

// bandWeighted returns the maturity of some maturities, as of a domain from
// its parts or a product from its features: their weighted average, each
// weighted as a capability in its band would be, however many capabilities
// it has, rounded. Each comes in already rounded. Those with none are left
// out, and it's nil when none has one.
func bandWeighted(maturities []*Maturity) *Maturity {
	total, weights := 0, 0
	for _, m := range maturities {
		if m == nil {
			continue
		}
		w := MaturityLevels[m.Band.Level].Weight
		total += m.Percent * w
		weights += w
	}
	if weights == 0 {
		return nil
	}
	return maturity(float64(total) / float64(weights))
}

// CapabilitiesMaturity returns the maturity of some capabilities, each at
// its level in short, as of a feature, a persona or an initiative.
func CapabilitiesMaturity(capabilities []*combine.Capability) *Maturity {
	levels := make([]string, len(capabilities))
	for i, c := range capabilities {
		levels[i] = c.Stability
	}
	return MaturityOfLevels(levels)
}

// FeatureMaturity returns a feature's maturity. It spans the feature's
// domains, so each capability counts once, at its level in short.
func FeatureMaturity(p *combine.Product, f *combine.Feature) *Maturity {
	return CapabilitiesMaturity(CapabilitiesByID(p, f.Capabilities))
}

// PartMaturity returns the maturity of a feature's part in a domain: the
// capabilities in that part, at their levels in that domain alone. One the
// domain lists but doesn't build has no level there, and doesn't count.
func PartMaturity(p *combine.Product, part combine.Part) *Maturity {
	var levels []string
	for _, c := range CapabilitiesByID(p, part.Capabilities) {
		for _, l := range c.Levels {
			if l.Domain == part.Domain {
				levels = append(levels, l.Level)
			}
		}
	}
	return MaturityOfLevels(levels)
}

// DomainMaturity returns a domain's maturity: band-weighted over its parts
// of features. Capabilities in no feature don't count.
func DomainMaturity(p *combine.Product, d *combine.Domain) *Maturity {
	var parts []*Maturity
	for _, id := range d.Features {
		if part := partOf(p.Feature(id), d.ID); part != nil {
			parts = append(parts, PartMaturity(p, *part))
		}
	}
	return bandWeighted(parts)
}

// ProductMaturity returns the maturity of everything showing, one project or
// several: band-weighted over its features, so a capability that spans
// domains counts once. A project's own maturity is this, of the product
// combined from that project alone.
func ProductMaturity(p *combine.Product) *Maturity {
	features := make([]*Maturity, len(p.Features))
	for i, f := range p.Features {
		features[i] = FeatureMaturity(p, f)
	}
	return bandWeighted(features)
}
