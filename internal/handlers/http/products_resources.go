package http

import (
	"slices"
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
	return DecisionResource{
		Topic: d.Topic, Question: d.Question, Affects: list(d.Affects),
		Impact: d.Impact, Likelihood: d.Likelihood, Reach: d.Reach,
	}
}

func newDecisionResources(ds []state.Decision) []DecisionResource {
	out := make([]DecisionResource, len(ds))
	for i, d := range ds {
		out[i] = newDecisionResource(d)
	}
	return out
}

func newHeldDecisionResource(p *combine.Product, h derive.HeldDecision) HeldDecisionResource {
	r := HeldDecisionResource{DecisionResource: newDecisionResource(h.Decision), On: state.DocRef(h.Kind, h.Doc.ID)}
	if risk := derive.DecisionRiskOf(p, h); risk != nil {
		res := newRiskResource(*risk)
		r.Risk = &res
	}
	return r
}

func newHeldDecisionResources(p *combine.Product, hs []derive.HeldDecision) []HeldDecisionResource {
	out := make([]HeldDecisionResource, len(hs))
	for i, h := range hs {
		out[i] = newHeldDecisionResource(p, h)
	}
	return out
}

func newReadinessResource(p *combine.Product, r derive.Readiness) ReadinessResource {
	res := ReadinessResource{
		Percent:      r.Percent,
		Maturity:     r.Maturity,
		Exposure:     newExposureResource(r.Exposure),
		Levels:       list(r.Levels),
		Gaps:         newRiskSummaryResource(r.Gaps),
		Started:      r.Started,
		NotStarted:   capabilityIDs(r.NotStarted),
		Improvements: make([]ImprovementResource, len(r.Improvements)),
		Parts:        make([]PartResource, len(r.Parts)),
	}
	if b := r.Band(); b != nil {
		res.Band = &b.Name
	}
	for i, im := range r.Improvements {
		res.Improvements[i] = newImprovementResource(p, im)
	}
	for i, a := range r.Parts {
		res.Parts[i] = newPartResource(p, a)
	}
	return res
}

func newPartResource(p *combine.Product, a derive.Part) PartResource {
	r := PartResource{Kind: string(a.Kind), Capabilities: capabilityIDs(a.Capabilities), Potential: a.Potential}
	if a.Area != nil {
		r.Area = &a.Area.ID
	}
	if a.Feature != nil {
		r.Feature = &a.Feature.ID
	}
	if a.Capability != nil {
		r.Capability = &a.Capability.ID
	}
	if a.Next != nil {
		next := newImprovementResource(p, *a.Next)
		r.Next = &next
	}
	return r
}

// docqet:implements capability:improvements
func newImprovementResource(p *combine.Product, im derive.Improvement) ImprovementResource {
	r := ImprovementResource{
		Kind:         string(im.Kind),
		Capabilities: capabilityIDs(im.Capabilities),
		Readiness:    im.Readiness,
		Maturity:     im.Maturity,
		Exposure:     im.Exposure,
		Gain:         im.Gain,
	}
	if im.Capability != nil {
		r.Capability, r.From, r.To = &im.Capability.ID, &im.Capability.Stability, ptr(im.To)
	}
	if im.Feature != nil {
		r.Feature = &im.Feature.ID
	}
	if im.Area != nil {
		r.Area = &im.Area.ID
	}
	if im.Gap != nil {
		r.Gap = &im.Gap.ID
	}
	if im.Decision != nil {
		d := newHeldDecisionResource(p, *im.Decision)
		r.Decision = &d
	}
	if im.Band != nil {
		r.Band = &im.Band.Name
	}
	return r
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
		File:        d.File,
		Name:        d.Name,
		Description: d.Description,
		Body:        d.Body,
		From:        make([]ContributionResource, len(d.From)),
	}
	for i, f := range d.From {
		c := ContributionResource{
			Project:     f.Project,
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
// the figures of the capabilities a ?for= names, with its readiness's areas
// grouped by by. Counts are always what's showing in the product.
func newStatusResource(v *services.View, within []*combine.Capability, by derive.Grouping) StatusResource {
	p := v.Product
	maturity := derive.ProductMaturity(p)
	capabilities := p.Capabilities
	if within != nil {
		maturity = derive.CapabilitiesMaturity(within)
		capabilities = within
	}
	readiness := derive.ReadinessOf(p, capabilities, by)
	listed := v.ListGaps(within, nil, false)
	gaps := make([]*combine.Gap, len(listed))
	for i, l := range listed {
		gaps[i] = l.Gap
	}

	counts := CountsResource{
		Areas:        len(p.Areas),
		Features:     len(p.Features),
		Capabilities: map[string]int{combine.Draft: 0},
		Rules:        len(p.Rules),
		Concepts:     len(p.Concepts),
		Personas:     len(p.Personas),
		Problems:     len(p.Problems),
		Constraints:  len(p.Constraints),
		Initiatives:  len(p.Initiatives),
		Mechanisms:   len(p.Mechanisms),
		Components:   len(p.Components),
		Archetypes:   len(p.Archetypes),
		Gaps:         len(p.Gaps),
		Tradeoffs:    len(p.Tradeoffs),
		Decisions:    len(v.ListDecisions()),
		Findings:     len(p.Findings),
	}
	for _, l := range state.Levels {
		counts.Capabilities[l] = 0
	}
	for _, c := range p.Capabilities {
		counts.Capabilities[c.Stability]++
	}

	return StatusResource{
		Maturity:  newMaturityResource(maturity),
		Readiness: newReadinessResource(p, readiness),
		Exposure:  newExposureResource(readiness.Exposure),
		Risk:      newRiskSummaryResource(derive.RiskAcross(p, gaps, within)),
		Counts:    counts,
	}
}

func newAreaResource(p *combine.Product, a *combine.Area) AreaResource {
	caps := derive.AreaCapabilities(p, a)
	readiness := derive.ReadinessOf(p, caps, derive.ByFeature)
	return AreaResource{
		DocResource:  newDocResource(a.Doc),
		Features:     list(a.Features),
		Capabilities: capabilityIDs(caps),
		Maturity:     newMaturityResource(derive.AreaMaturity(p, a)),
		Readiness:    newReadinessResource(p, readiness),
		Exposure:     newExposureResource(readiness.Exposure),
	}
}

func newFeatureResource(p *combine.Product, f *combine.Feature) FeatureResource {
	readiness := derive.ReadinessOf(p, derive.CapabilitiesByID(p, f.Capabilities), derive.ByCapability)
	return FeatureResource{
		DocResource:  newDocResource(f.Doc),
		Area:         f.Area,
		Capabilities: list(f.Capabilities),
		Tradeoffs:    list(f.Tradeoffs),
		Maturity:     newMaturityResource(derive.FeatureMaturity(p, f)),
		Readiness:    newReadinessResource(p, readiness),
		Exposure:     newExposureResource(readiness.Exposure),
	}
}

func newCapabilityResource(p *combine.Product, c *combine.Capability) CapabilityResource {
	one := []*combine.Capability{c}
	readiness := derive.ReadinessOf(p, one, derive.ByStep)
	open := derive.OpenIn(p, c, true)
	r := CapabilityResource{
		DocResource: newDocResource(c.Doc),
		Solves:      list(c.Solves),
		Personas:    list(c.Personas),
		Initiatives: list(c.Initiatives),
		Stability:   c.Stability,
		Levels:      make([]LevelResource, len(c.Levels)),
		Feature:     c.Feature,
		Rules:       list(c.Rules),
		Respects:    list(c.Respects),
		Concepts:    list(c.Concepts),
		Gaps:        list(c.Gaps),
		Tradeoffs:   list(c.Tradeoffs),
		BuiltBy:     list(c.BuiltBy),
		Archetypes:  list(c.Archetypes),
		Evidence:    newEvidenceResource(c.Evidence),
		Readiness:   newReadinessResource(p, readiness),
		Exposure:    newExposureResource(readiness.Exposure),
		Risk:        newRiskSummaryResource(derive.RiskAcross(p, derive.GapsOn(p, c), one)),
		Open: OpenResource{
			Decisions: newDecisionResources(open.Decisions),
			Gaps:      gapIDs(open.Gaps),
			Technical: make([]TechnicalGapResource, len(open.Technical)),
		},
		RuleStandings: map[string]string{},
		Outcomes:      []OutcomeStandingResource{},
	}
	for i, l := range c.Levels {
		r.Levels[i] = LevelResource{Project: l.Project, Level: l.Level}
	}
	for i, t := range open.Technical {
		r.Open.Technical[i] = TechnicalGapResource{Gap: t.Gap.ID, On: state.DocRef(t.On.Kind, t.On.ID)}
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
		Respects:     list(rule.Respects),
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
	readiness := derive.ReadinessOf(p, caps, derive.ByFeature)
	return PersonaResource{
		DocResource:  newDocResource(persona.Doc),
		Role:         persona.Role,
		Title:        persona.Title,
		Image:        persona.Image,
		Problems:     list(persona.Problems),
		Capabilities: list(persona.Capabilities),
		Features:     list(persona.Features),
		Initiatives:  list(persona.Initiatives),
		Maturity:     newMaturityResource(derive.CapabilitiesMaturity(caps)),
		Readiness:    newReadinessResource(p, readiness),
		Exposure:     newExposureResource(readiness.Exposure),
	}
}

func newProblemResource(p *combine.Product, problem *combine.Problem) ProblemResource {
	caps := derive.ProblemCapabilities(p, problem)
	readiness := derive.ReadinessOf(p, caps, derive.ByFeature)
	return ProblemResource{
		DocResource:  newDocResource(problem.Doc),
		Cost:         problem.Cost,
		Personas:     list(problem.Personas),
		Capabilities: list(problem.Capabilities),
		Constraints:  constraintsOn(p, problem),
		Maturity:     newMaturityResource(derive.CapabilitiesMaturity(caps)),
		Readiness:    newReadinessResource(p, readiness),
		Exposure:     newExposureResource(readiness.Exposure),
	}
}

func constraintsOn(p *combine.Product, problem *combine.Problem) []ConstraintOnResource {
	out := []ConstraintOnResource{}
	for _, on := range derive.ProblemConstraints(p, problem) {
		out = append(out, ConstraintOnResource{Constraint: on.Constraint.ID, Broad: on.Broad, RespectedBy: on.RespectedBy, Unaddressed: on.Unaddressed()})
	}
	return out
}

func newConstraintResource(p *combine.Product, cn *combine.Constraint) ConstraintResource {
	caps := derive.ConstraintCapabilities(p, cn)
	readiness := derive.ReadinessOf(p, caps, derive.ByFeature)
	ids := make([]string, 0, len(caps))
	for _, c := range caps {
		ids = append(ids, c.ID)
	}
	return ConstraintResource{
		DocResource: newDocResource(cn.Doc),
		Source:      cn.Source,
		Applies:     idPtr(cn.Applies),
		Problems:    list(cn.Problems),
		RespectedBy: slices.Concat(prefixed(state.TypeRule, cn.Rules), prefixed(state.TypeCapability, cn.Capabilities),
			prefixed(state.TypeMechanism, cn.Mechanisms), prefixed(state.TypeComponent, cn.Components)),
		Gaps:         list(cn.Gaps),
		Evidence:     newEvidenceResource(cn.Evidence),
		Rules:        list(cn.Rules),
		Mechanisms:   list(cn.Mechanisms),
		Capabilities: ids,
		Maturity:     newMaturityResource(derive.CapabilitiesMaturity(caps)),
		Readiness:    newReadinessResource(p, readiness),
		Exposure:     newExposureResource(readiness.Exposure),
	}
}

func newInitiativeResource(p *combine.Product, i *combine.Initiative) InitiativeResource {
	caps := derive.CapabilitiesByID(p, i.Capabilities)
	readiness := derive.ReadinessOf(p, caps, derive.ByFeature)
	return InitiativeResource{
		DocResource:  newDocResource(i.Doc),
		Capabilities: list(i.Capabilities),
		Features:     list(i.Features),
		Personas:     list(i.Personas),
		Maturity:     newMaturityResource(derive.CapabilitiesMaturity(caps)),
		Readiness:    newReadinessResource(p, readiness),
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
		Respects:     list(t.Respects),
		Within:       idPtr(t.Within),
		Is:           idPtr(t.Is),
		Archetype:    idPtr(t.Archetype),
		Parts:        list(t.Parts),
		Capabilities: list(t.Capabilities),
		Meets:        list(t.Meets),
		Gaps:         list(t.Gaps),
		Tradeoffs:    list(t.Tradeoffs),
		Evidence:     newEvidenceResource(t.Evidence),
		Risk:         newRiskSummaryResource(derive.RiskAcross(p, gaps, nil)),
	}
}

// idPtr is an ID, or nil for none.
func idPtr(id string) *string {
	if id == "" {
		return nil
	}
	return &id
}

func newArchetypeResource(a *combine.Archetype) ArchetypeResource {
	return ArchetypeResource{DocResource: newDocResource(a.Doc), Components: list(a.Components), Capabilities: list(a.Capabilities)}
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
		Affects:     list(g.Affects),
		Impact:      g.Impact,
		Likelihood:  g.Likelihood,
		Reach:       g.Reach,
		Name:        g.Name,
		Description: g.Description,
		Places:      newPlaceResources(g.Places),
		Risk:        newRiskResource(risk),
		Affected:    newAffectedResources(p, g.Affects),
		Decisions:   newHeldDecisionResources(p, derive.DecisionsAffecting(p, g.ID)),
	}
	if within != nil {
		s := newScoredGapResource(*within)
		r.Within = &s
	}
	return r
}

func newRiskResource(risk derive.Risk) RiskResource {
	r := RiskResource{
		Score:        risk.Score,
		Verdict:      string(risk.Verdict),
		Claim:        risk.Claim,
		Capabilities: risk.Capabilities,
		Spread:       make([]SpreadResource, len(risk.Spread)),
		On:           make([]RiskOnResource, len(risk.On)),
	}
	for i, s := range risk.Spread {
		r.Spread[i] = SpreadResource{Score: s.Score, Capabilities: s.Capabilities}
	}
	for i, o := range risk.On {
		r.On[i] = RiskOnResource{
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
	return r
}

func newTradeoffResource(p *combine.Product, t *combine.Tradeoff) TradeoffResource {
	return TradeoffResource{
		ID:          t.ID,
		Subject:     subjectOf(t.ID),
		Project:     t.Project,
		Affects:     list(t.Affects),
		Name:        t.Name,
		Description: t.Description,
		Benefit:     t.Benefit,
		Drawback:    t.Drawback,
		Places:      newPlaceResources(t.Places),
		Affected:    newAffectedResources(p, t.Affects),
		Decisions:   newHeldDecisionResources(p, derive.DecisionsAffecting(p, t.ID)),
	}
}

func newFindingResource(pr state.Finding) FindingResource {
	return FindingResource{
		Type:         pr.Type,
		Subject:      pr.Subject,
		Capabilities: list(pr.Capabilities),
		Message:      pr.Message,
		File:         pr.File,
		Line:         pr.Line,
		Advisory:     state.Advisory(pr.Type),
	}
}

func newSearchResultResource(s services.SearchResult) SearchResultResource {
	return SearchResultResource{Kind: s.Kind, ID: s.ID, Name: s.Name, Description: s.Description, Match: s.Match}
}

// prefixed is each ID as a reference to a doc of type typ.
func prefixed(typ string, ids []string) []string {
	out := make([]string, 0, len(ids))
	for _, id := range ids {
		out = append(out, state.DocRef(typ, id))
	}
	return out
}
