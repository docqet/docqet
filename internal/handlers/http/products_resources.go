package http

import (
	"strings"

	"github.com/docqet/docqet/internal/combine"
	"github.com/docqet/docqet/internal/derive"
	"github.com/docqet/docqet/internal/services"
	"github.com/docqet/docqet/internal/state"
)

// The builders here translate what combine puts together, and what derive
// works out from it, into the resources in resources.go.

// list returns s, or an empty slice for nil, so a list in JSON is [] and
// never null.
func list[T any](s []T) []T {
	if s == nil {
		return []T{}
	}
	return s
}

// ptr returns a pointer to s, or nil for "".
func ptr[T ~string](s T) *string {
	if s == "" {
		return nil
	}
	v := string(s)
	return &v
}

func ids[T any](items []*T, id func(*T) string) []string {
	out := make([]string, len(items))
	for i, x := range items {
		out[i] = id(x)
	}
	return out
}

func capabilityIDs(caps []*combine.Capability) []string {
	return ids(caps, func(c *combine.Capability) string { return c.ID })
}

func gapIDs(gaps []*combine.Gap) []string {
	return ids(gaps, func(g *combine.Gap) string { return g.ID })
}

func newMaturityResource(m *derive.Maturity) *MaturityResource {
	if m == nil {
		return nil
	}
	return &MaturityResource{Percent: m.Percent, Band: m.Band.Level}
}

func newExposureResource(e derive.Exposure) ExposureResource {
	r := ExposureResource{Percent: e.Percent, Capabilities: e.Capabilities, Unacceptable: e.Unacceptable}
	if e.Band != nil {
		r.Band = &e.Band.ID
	}
	return r
}

func newScoredGapResource(s derive.Scored) ScoredGapResource {
	r := ScoredGapResource{Gap: s.Gap.ID, Score: s.Score, Verdict: string(s.Verdict)}
	if s.On != nil {
		r.Capability = &s.On.Capability.ID
	}
	return r
}

func newRiskSummaryResource(a derive.Across) RiskSummaryResource {
	r := RiskSummaryResource{
		Score:   a.Score,
		Verdict: ptr(a.Verdict),
		Counts:  map[string]int{},
		Gaps:    make([]ScoredGapResource, len(a.Items)),
	}
	for v, n := range a.Counts {
		r.Counts[string(v)] = n
	}
	for i, s := range a.Items {
		r.Gaps[i] = newScoredGapResource(s)
	}
	return r
}

func newDecisionResource(d state.Decision) DecisionResource {
	return DecisionResource{Topic: d.Topic, Question: d.Question, Affects: list(d.Affects)}
}

func newDecisionResources(ds []state.Decision) []DecisionResource {
	out := make([]DecisionResource, len(ds))
	for i, d := range ds {
		out[i] = newDecisionResource(d)
	}
	return out
}

func newHeldDecisionResource(h derive.HeldDecision) HeldDecisionResource {
	return HeldDecisionResource{DecisionResource: newDecisionResource(h.Decision), On: state.DocRef(h.Kind, h.Doc.ID)}
}

func newHeldDecisionResources(hs []derive.HeldDecision) []HeldDecisionResource {
	out := make([]HeldDecisionResource, len(hs))
	for i, h := range hs {
		out[i] = newHeldDecisionResource(h)
	}
	return out
}

func newReadinessResource(r derive.Readiness) ReadinessResource {
	res := ReadinessResource{
		Percent:    r.Percent,
		Maturity:   r.Maturity,
		Exposure:   newExposureResource(r.Exposure),
		Levels:     list(r.Levels),
		Gaps:       newRiskSummaryResource(r.Gaps),
		Ready:      capabilityIDs(r.Ready),
		NotReady:   make([]NeedResource, len(r.NotReady)),
		NotStarted: capabilityIDs(r.NotStarted),
	}
	if b := r.Band(); b != nil {
		res.Band = &b.Name
	}
	for i, n := range r.NotReady {
		res.NotReady[i] = NeedResource{
			Capability: n.Capability.ID,
			BelowBeta:  n.BelowBeta,
			Gaps:       gapIDs(n.Gaps),
			Decisions:  newDecisionResources(n.Decisions),
		}
	}
	return res
}

func newPlaceResources(places []combine.Place) []PlaceResource {
	out := make([]PlaceResource, len(places))
	for i, p := range places {
		out[i] = PlaceResource{Project: p.Project, File: p.File, Line: p.Line, Text: p.Text}
	}
	return out
}

func newEvidenceResource(e combine.Evidence) EvidenceResource {
	return EvidenceResource{Implements: newPlaceResources(e.Implements), Verifies: newPlaceResources(e.Verifies)}
}

func newDocResource(d combine.Doc) DocResource {
	r := DocResource{
		ID:          d.ID,
		Project:     d.Project,
		Domain:      d.Domain,
		File:        d.File,
		Name:        d.Name,
		Description: d.Description,
		Body:        d.Body,
		From:        make([]ContributionResource, len(d.From)),
	}
	for i, f := range d.From {
		c := ContributionResource{
			Project:     f.Project,
			Domain:      f.Domain,
			File:        f.File,
			Name:        f.Name,
			Description: f.Description,
			Body:        f.Body,
			Role:        f.Role,
			Title:       f.Title,
			Why:         f.Why,
		}
		if len(f.Decisions) > 0 {
			c.Decisions = newDecisionResources(f.Decisions)
		}
		for _, cw := range f.ConfusedWith {
			c.ConfusedWith = append(c.ConfusedWith, ConfusionResource{Concept: cw.Concept, Term: cw.Term, Summary: cw.Summary})
		}
		r.From[i] = c
	}
	return r
}

func newProductProjectResource(v *services.View, p combine.Project) ProductProjectResource {
	return ProductProjectResource{
		ID:        p.ID,
		Name:      p.Name,
		Product:   p.Product,
		Commit:    p.Commit,
		IndexedAt: p.IndexedAt,
		Maturity:  newMaturityResource(v.ProjectMaturity(p.ID)),
	}
}

func newProductResource(v *services.View) ProductResource {
	r := ProductResource{
		ID:       v.ID,
		Name:     v.Name,
		Projects: make([]ProductProjectResource, len(v.Projects)),
		Maturity: newMaturityResource(derive.ProductMaturity(v.Product)),
	}
	for i, p := range v.Projects {
		r.Projects[i] = newProductProjectResource(v, p)
	}
	return r
}

// newStatusResource is the product at a glance, or, with within not nil,
// the figures of the capabilities a ?for= names. Counts are always what's
// showing in the product.
func newStatusResource(v *services.View, within []*combine.Capability) StatusResource {
	p := v.Product
	maturity := derive.ProductMaturity(p)
	capabilities := p.Capabilities
	if within != nil {
		maturity = derive.CapabilitiesMaturity(within)
		capabilities = within
	}
	readiness := derive.ReadinessOf(p, capabilities)
	listed := v.ListGaps(within, nil, false)
	gaps := make([]*combine.Gap, len(listed))
	for i, l := range listed {
		gaps[i] = l.Gap
	}

	counts := CountsResource{
		Domains:      len(p.Domains),
		Features:     len(p.Features),
		Capabilities: map[string]int{combine.Draft: 0},
		Rules:        len(p.Rules),
		Concepts:     len(p.Concepts),
		Personas:     len(p.Personas),
		Initiatives:  len(p.Initiatives),
		Mechanisms:   len(p.Mechanisms),
		Components:   len(p.Components),
		Gaps:         len(p.Gaps),
		Tradeoffs:    len(p.Tradeoffs),
		Decisions:    len(v.ListDecisions()),
		Problems:     len(p.Problems),
	}
	for _, l := range state.Levels {
		counts.Capabilities[l] = 0
	}
	for _, c := range p.Capabilities {
		counts.Capabilities[c.Stability]++
	}

	return StatusResource{
		Maturity:  newMaturityResource(maturity),
		Readiness: newReadinessResource(readiness),
		Exposure:  newExposureResource(readiness.Exposure),
		Risk:      newRiskSummaryResource(derive.RiskAcross(p, gaps, within)),
		Counts:    counts,
	}
}

func newDomainResource(p *combine.Product, d *combine.Domain) DomainResource {
	readiness := derive.ReadinessOf(p, derive.DomainCapabilities(p, d))
	return DomainResource{
		DocResource:  newDocResource(d.Doc),
		Features:     list(d.Features),
		Capabilities: list(d.Capabilities),
		Maturity:     newMaturityResource(derive.DomainMaturity(p, d)),
		Readiness:    newReadinessResource(readiness),
		Exposure:     newExposureResource(readiness.Exposure),
	}
}

func newFeatureResource(p *combine.Product, f *combine.Feature) FeatureResource {
	readiness := derive.ReadinessOf(p, derive.CapabilitiesByID(p, f.Capabilities))
	r := FeatureResource{
		DocResource:  newDocResource(f.Doc),
		Capabilities: list(f.Capabilities),
		Tradeoffs:    list(f.Tradeoffs),
		Parts:        make([]PartResource, len(f.Parts)),
		Maturity:     newMaturityResource(derive.FeatureMaturity(p, f)),
		Readiness:    newReadinessResource(readiness),
		Exposure:     newExposureResource(readiness.Exposure),
	}
	for i, part := range f.Parts {
		r.Parts[i] = PartResource{
			Domain:       part.Domain,
			Capabilities: list(part.Capabilities),
			Maturity:     newMaturityResource(derive.PartMaturity(p, part)),
		}
	}
	return r
}

func newCapabilityResource(p *combine.Product, c *combine.Capability) CapabilityResource {
	one := []*combine.Capability{c}
	readiness := derive.ReadinessOf(p, one)
	left := derive.LeftIn(p, c, true)
	r := CapabilityResource{
		DocResource: newDocResource(c.Doc),
		Personas:    list(c.Personas),
		Initiatives: list(c.Initiatives),
		Stability:   c.Stability,
		Levels:      make([]LevelResource, len(c.Levels)),
		Feature:     c.Feature,
		Rules:       list(c.Rules),
		Concepts:    list(c.Concepts),
		Gaps:        list(c.Gaps),
		Tradeoffs:   list(c.Tradeoffs),
		BuiltBy:     list(c.BuiltBy),
		Evidence:    newEvidenceResource(c.Evidence),
		Readiness:   newReadinessResource(readiness),
		Exposure:    newExposureResource(readiness.Exposure),
		Risk:        newRiskSummaryResource(derive.RiskAcross(p, derive.GapsOn(p, c), one)),
		Left: LeftResource{
			Decisions: newDecisionResources(left.Decisions),
			Gaps:      gapIDs(left.Gaps),
			Technical: make([]TechnicalGapResource, len(left.Technical)),
		},
		RuleStandings: map[string]string{},
		Outcomes:      []OutcomeStandingResource{},
	}
	for i, l := range c.Levels {
		r.Levels[i] = LevelResource{Project: l.Project, Domain: l.Domain, Level: l.Level}
	}
	for i, t := range left.Technical {
		r.Left.Technical[i] = TechnicalGapResource{Gap: t.Gap.ID, On: state.DocRef(t.On.Kind, t.On.ID)}
	}
	for _, id := range c.Rules {
		if rule := p.Rule(id); rule != nil {
			r.RuleStandings[id] = string(derive.RuleStandingOf(c, rule))
		}
	}
	if p.Rubric != nil {
		for qi := range p.Rubric.Qualities {
			for _, o := range derive.OutcomesOf(&p.Rubric.Qualities[qi]) {
				s := derive.OutcomeStandingOf(p, c, o)
				r.Outcomes = append(r.Outcomes, OutcomeStandingResource{
					Outcome:   o.ID,
					Standing:  string(s.Standing),
					Gaps:      gapIDs(s.Gaps),
					Tradeoffs: ids(s.Tradeoffs, func(t *combine.Tradeoff) string { return t.ID }),
					Decisions: newDecisionResources(s.Decisions),
					By:        ids(s.By, func(t *combine.Technical) string { return state.DocRef(t.Kind, t.ID) }),
				})
			}
		}
	}
	return r
}

func newRuleResource(p *combine.Product, rule *combine.Rule) RuleResource {
	r := RuleResource{
		DocResource:  newDocResource(rule.Doc),
		Capabilities: list(rule.Capabilities),
		Concepts:     list(rule.Concepts),
		Gaps:         list(rule.Gaps),
		Evidence:     newEvidenceResource(rule.Evidence),
		Standings:    map[string]string{},
	}
	for _, c := range derive.CapabilitiesByID(p, rule.Capabilities) {
		r.Standings[c.ID] = string(derive.RuleStandingOf(c, rule))
	}
	return r
}

func newConceptResource(c *combine.Concept) ConceptResource {
	return ConceptResource{
		DocResource:  newDocResource(c.Doc),
		Capabilities: list(c.Capabilities),
		Rules:        list(c.Rules),
	}
}

func newPersonaResource(p *combine.Product, persona *combine.Persona) PersonaResource {
	caps := derive.PersonaCapabilities(p, persona)
	readiness := derive.ReadinessOf(p, caps)
	return PersonaResource{
		DocResource:  newDocResource(persona.Doc),
		Role:         persona.Role,
		Title:        persona.Title,
		Image:        persona.Image,
		Capabilities: list(persona.Capabilities),
		Features:     list(persona.Features),
		Initiatives:  list(persona.Initiatives),
		Maturity:     newMaturityResource(derive.CapabilitiesMaturity(caps)),
		Readiness:    newReadinessResource(readiness),
		Exposure:     newExposureResource(readiness.Exposure),
	}
}

func newInitiativeResource(p *combine.Product, i *combine.Initiative) InitiativeResource {
	caps := derive.CapabilitiesByID(p, i.Capabilities)
	readiness := derive.ReadinessOf(p, caps)
	return InitiativeResource{
		DocResource:  newDocResource(i.Doc),
		Capabilities: list(i.Capabilities),
		Features:     list(i.Features),
		Personas:     list(i.Personas),
		Maturity:     newMaturityResource(derive.CapabilitiesMaturity(caps)),
		Readiness:    newReadinessResource(readiness),
		Exposure:     newExposureResource(readiness.Exposure),
	}
}

func newTechnicalResource(p *combine.Product, t *combine.Technical) TechnicalResource {
	var gaps []*combine.Gap
	for _, id := range t.Gaps {
		if g := p.Gap(id); g != nil {
			gaps = append(gaps, g)
		}
	}
	return TechnicalResource{
		DocResource:  newDocResource(t.Doc),
		Kind:         t.Kind,
		Applies:      t.Applies,
		Capabilities: list(t.Capabilities),
		Meets:        list(t.Meets),
		Gaps:         list(t.Gaps),
		Tradeoffs:    list(t.Tradeoffs),
		Evidence:     newEvidenceResource(t.Evidence),
		Risk:         newRiskSummaryResource(derive.RiskAcross(p, gaps, nil)),
	}
}

// subjectOf is the doc a gap or tradeoff is on, as a reference: its ID
// before #.
func subjectOf(id string) string {
	subject, _, _ := strings.Cut(id, "#")
	return subject
}

func newAffectedResources(p *combine.Product, affects []string) []AffectedResource {
	found := derive.AffectedBy(p, affects)
	out := make([]AffectedResource, len(found))
	for i, a := range found {
		r := AffectedResource{Kind: a.Kind}
		switch a.Kind {
		case derive.AffectsOutcome:
			r.Ref, r.Quality = a.Outcome.ID, &a.Quality.ID
		case derive.AffectsRule:
			r.Ref = state.DocRef(state.TypeRule, a.Rule.ID)
		case derive.AffectsGap:
			r.Ref = a.Gap.ID
		case derive.AffectsTradeoff:
			r.Ref = a.Tradeoff.ID
		}
		out[i] = r
	}
	return out
}

// newGapResource is a gap, with within its score among the capabilities a
// ?for= names, or nil without one.
func newGapResource(p *combine.Product, g *combine.Gap, within *derive.Scored) GapResource {
	risk := derive.RiskOf(p, g)
	r := GapResource{
		ID:          g.ID,
		Subject:     subjectOf(g.ID),
		Project:     g.Project,
		Domain:      g.Domain,
		Affects:     list(g.Affects),
		Impact:      g.Impact,
		Likelihood:  g.Likelihood,
		Reach:       g.Reach,
		Name:        g.Name,
		Description: g.Description,
		Places:      newPlaceResources(g.Places),
		Risk: RiskResource{
			Score:        risk.Score,
			Verdict:      string(risk.Verdict),
			Claim:        risk.Claim,
			Capabilities: risk.Capabilities,
			Spread:       make([]SpreadResource, len(risk.Spread)),
			On:           make([]RiskOnResource, len(risk.On)),
		},
		Affected:  newAffectedResources(p, g.Affects),
		Decisions: newHeldDecisionResources(derive.DecisionsAffecting(p, g.ID)),
	}
	for i, s := range risk.Spread {
		r.Risk.Spread[i] = SpreadResource{Score: s.Score, Capabilities: s.Capabilities}
	}
	for i, o := range risk.On {
		r.Risk.On[i] = RiskOnResource{
			Capability:  o.Capability.ID,
			Impact:      o.Impact,
			Likelihood:  o.Likelihood,
			Reach:       o.Reach,
			Weight:      o.Weight,
			Claim:       o.Claim,
			ClaimFactor: o.ClaimFactor,
			Raw:         o.Raw,
			Score:       o.Score,
		}
	}
	if within != nil {
		s := newScoredGapResource(*within)
		r.Within = &s
	}
	return r
}

func newTradeoffResource(p *combine.Product, t *combine.Tradeoff) TradeoffResource {
	return TradeoffResource{
		ID:          t.ID,
		Subject:     subjectOf(t.ID),
		Project:     t.Project,
		Domain:      t.Domain,
		Affects:     list(t.Affects),
		Name:        t.Name,
		Description: t.Description,
		Benefit:     t.Benefit,
		Drawback:    t.Drawback,
		Places:      newPlaceResources(t.Places),
		Affected:    newAffectedResources(p, t.Affects),
		Decisions:   newHeldDecisionResources(derive.DecisionsAffecting(p, t.ID)),
	}
}

func newProblemResource(pr state.Problem) ProblemResource {
	return ProblemResource{
		Type:         pr.Type,
		Subject:      pr.Subject,
		Capabilities: list(pr.Capabilities),
		Message:      pr.Message,
		Domain:       pr.Domain,
		File:         pr.File,
		Line:         pr.Line,
	}
}

func newSearchResultResource(s services.SearchResult) SearchResultResource {
	return SearchResultResource{Kind: s.Kind, ID: s.ID, Name: s.Name, Description: s.Description, Match: s.Match}
}
