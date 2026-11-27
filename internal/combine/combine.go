package combine

import (
	"fmt"
	"slices"
	"strings"

	"github.com/docqet/docqet/internal/state"
)

// Combine puts the states of a product's projects together, in the order
// they're given, as the product concept's Combining section says:
//
//   - Every doc is one across everything, so contributions with the same ID
//     are put together, their links combined. A capability keeps its level
//     in each project that writes it.
//   - Gaps and tradeoffs are their project's, keyed <id>@<project>.
//
// Then reverse links are worked out again across everything, and
// contradictions between contributions, and gaps or tradeoffs two projects
// both declare, become findings. It never changes the states it's given.
// docqet:implements capability:product-view rule:contradictions-shown
func Combine(states []*state.State) *Product {
	c := newCombiner()
	for _, st := range states {
		c.add(st)
	}
	c.resolveLinks()
	c.reverseLinks()
	c.resolveGaps()
	c.featuresOfCapabilities()
	c.areasOfFeatures()
	c.solvedProblems()
	c.respectedConstraints()
	c.componentStructure()
	c.personasAndInitiatives()
	c.contradictions()
	c.duplicates()

	p := c.p
	if len(states) > 0 {
		first := states[0]
		id := first.Project
		if first.Product != nil {
			id = *first.Product
		}
		p.ID, p.Name = id.ID, id.Name
	}
	for _, st := range states {
		if len(st.Rubric.Kinds) > 0 || len(st.Rubric.Qualities) > 0 {
			rubric := st.Rubric
			p.Rubric = &rubric
			break
		}
	}
	return p
}

// placed is a doc naming a more general one, such as a capability its
// feature, in one project.
type placed struct {
	general, project string
}

// acrossProduct is a mechanism that applies across a product.
type acrossProduct struct {
	doc     *Technical
	product string
}

type combiner struct {
	p *Product

	areas        map[string]*Area
	features     map[string]*Feature
	capabilities map[string]*Capability
	rules        map[string]*Rule
	concepts     map[string]*Concept
	personas     map[string]*Persona
	problems     map[string]*Problem
	constraints  map[string]*Constraint
	initiatives  map[string]*Initiative
	mechanisms   map[string]*Technical
	components   map[string]*Technical
	archetypes   map[string]*Archetype

	featureOf map[string][]placed // a capability's feature, by capability
	areaOf    map[string][]placed // a feature's area, by feature
	// serves is what each product's projects serve, by product, as a
	// mechanism's capabilities are worked out: what they declare, other than
	// drafts, and what their components list.
	serves map[string][]string
	across []acrossProduct
}

func newCombiner() *combiner {
	return &combiner{
		p: &Product{
			Projects:     []Project{},
			Areas:        []*Area{},
			Features:     []*Feature{},
			Capabilities: []*Capability{},
			Rules:        []*Rule{},
			Concepts:     []*Concept{},
			Personas:     []*Persona{},
			Problems:     []*Problem{},
			Constraints:  []*Constraint{},
			Initiatives:  []*Initiative{},
			Mechanisms:   []*Technical{},
			Components:   []*Technical{},
			Archetypes:   []*Archetype{},
			Gaps:         []*Gap{},
			Tradeoffs:    []*Tradeoff{},
			Findings:     []state.Finding{},
		},
		areas:        map[string]*Area{},
		features:     map[string]*Feature{},
		capabilities: map[string]*Capability{},
		rules:        map[string]*Rule{},
		concepts:     map[string]*Concept{},
		personas:     map[string]*Persona{},
		problems:     map[string]*Problem{},
		constraints:  map[string]*Constraint{},
		initiatives:  map[string]*Initiative{},
		mechanisms:   map[string]*Technical{},
		components:   map[string]*Technical{},
		archetypes:   map[string]*Archetype{},
		featureOf:    map[string][]placed{},
		areaOf:       map[string][]placed{},
		serves:       map[string][]string{},
	}
}

// add puts one project's state in.
func (c *combiner) add(st *state.State) {
	project := st.Project.ID
	product := st.Project
	if st.Product != nil {
		product = *st.Product
	}
	c.p.Projects = append(c.p.Projects, Project{
		ID: st.Project.ID, Name: st.Project.Name, Product: product, Commit: st.Commit, IndexedAt: st.IndexedAt,
	})

	serves := c.serves[product.ID]
	for _, cp := range st.Capabilities {
		if cp.Stability != Draft {
			serves = union(serves, cp.ID)
		}
	}
	for _, comp := range st.Components {
		serves = union(serves, ids(comp.Capabilities)...)
	}
	c.serves[product.ID] = serves

	// A gap's or tradeoff's ID is its project's, as the docs' lists of them
	// name them.
	own := func(refs []string) []string {
		out := make([]string, 0, len(refs))
		for _, r := range refs {
			out = append(out, r+"@"+project)
		}
		return out
	}

	for _, a := range st.Areas {
		from := contribution(project, a.File, a.Name, a.Description, a.Body)
		from.Decisions = decisions(a.Decisions, project)
		contribute(&c.p.Areas, c.areas, a.ID, from, func(base Doc) *Area {
			return &Area{Doc: base, Features: []string{}}
		})
	}

	for _, f := range st.Features {
		from := contribution(project, f.File, f.Name, f.Description, f.Body)
		from.Decisions = decisions(f.Decisions, project)
		feature := contribute(&c.p.Features, c.features, f.ID, from, func(base Doc) *Feature {
			return &Feature{Doc: base, Capabilities: []string{}, Tradeoffs: []string{}}
		})
		feature.Tradeoffs = union(feature.Tradeoffs, own(f.Tradeoffs)...)
		if f.Area != nil {
			c.areaOf[f.ID] = append(c.areaOf[f.ID], placed{general: idOf(*f.Area), project: project})
		}
	}

	for _, cp := range st.Capabilities {
		from := contribution(project, cp.File, cp.Name, cp.Description, cp.Body)
		from.Decisions = decisions(cp.Decisions, project)
		capability := contribute(&c.p.Capabilities, c.capabilities, cp.ID, from, func(base Doc) *Capability {
			return &Capability{
				Doc:         base,
				Solves:      []string{},
				Personas:    []string{},
				Initiatives: []string{},
				Stability:   cp.Stability,
				Levels:      []LevelIn{},
				Rules:       []string{},
				Concepts:    []string{},
				Gaps:        []string{},
				Tradeoffs:   []string{},
				BuiltBy:     []string{}, Archetypes: []string{},
				Evidence: newEvidence(),
			}
		})
		addEvidence(&capability.Evidence, cp.Evidence, project)
		capability.Levels = append(capability.Levels, LevelIn{Project: project, Level: cp.Stability})
		if cp.Feature != nil {
			c.featureOf[cp.ID] = append(c.featureOf[cp.ID], placed{general: idOf(*cp.Feature), project: project})
		}
		capability.Solves = union(capability.Solves, ids(cp.Solves)...)
		capability.Initiatives = union(capability.Initiatives, ids(cp.Initiatives)...)
		capability.Gaps = union(capability.Gaps, own(cp.Gaps)...)
		capability.Tradeoffs = union(capability.Tradeoffs, own(cp.Tradeoffs)...)
		capability.Rules = union(capability.Rules, ids(cp.Rules)...)
		capability.Concepts = union(capability.Concepts, ids(cp.Concepts)...)
	}

	for _, r := range st.Rules {
		from := contribution(project, r.File, r.Name, "", r.Body)
		from.Why = r.Why
		rule := contribute(&c.p.Rules, c.rules, r.ID, from, func(base Doc) *Rule {
			return &Rule{Doc: base, Capabilities: []string{}, Concepts: []string{}, Respects: []string{}, Gaps: []string{}, Evidence: newEvidence()}
		})
		rule.Respects = union(rule.Respects, ids(r.Respects)...)
		rule.Concepts = union(rule.Concepts, ids(r.Concepts)...)
		addEvidence(&rule.Evidence, r.Evidence, project)
	}

	for _, cn := range st.Concepts {
		from := contribution(project, cn.File, cn.Name, cn.Description, cn.Body)
		from.ConfusedWith = make([]state.Confusion, 0, len(cn.ConfusedWith))
		for _, w := range cn.ConfusedWith {
			if w.Concept != nil {
				id := idOf(*w.Concept)
				w.Concept = &id
			}
			from.ConfusedWith = append(from.ConfusedWith, w)
		}
		contribute(&c.p.Concepts, c.concepts, cn.ID, from, func(base Doc) *Concept {
			return &Concept{Doc: base, Capabilities: []string{}, Rules: []string{}}
		})
	}

	for _, pr := range st.Personas {
		from := contribution(project, pr.File, pr.Name, pr.Description, pr.Body)
		from.Role, from.Title = pr.Role, pr.Title
		contribute(&c.p.Personas, c.personas, pr.ID, from, func(base Doc) *Persona {
			return &Persona{
				Doc: base, Role: pr.Role, Title: pr.Title, Image: pr.Image,
				Problems: []string{}, Capabilities: []string{}, Features: []string{}, Initiatives: []string{},
			}
		})
	}

	for _, pr := range st.Problems {
		from := contribution(project, pr.File, pr.Name, pr.Description, pr.Body)
		from.Cost = pr.Cost
		problem := contribute(&c.p.Problems, c.problems, pr.ID, from, func(base Doc) *Problem {
			return &Problem{Doc: base, Cost: pr.Cost, Personas: []string{}, Capabilities: []string{}}
		})
		problem.Personas = union(problem.Personas, ids(pr.Personas)...)
	}

	for _, cn := range st.Constraints {
		from := contribution(project, cn.File, cn.Name, cn.Description, cn.Body)
		from.Source = cn.Source
		contribute(&c.p.Constraints, c.constraints, cn.ID, from, func(base Doc) *Constraint {
			return &Constraint{Doc: base, Source: cn.Source, Rules: []string{}, Mechanisms: []string{}}
		})
	}

	for _, i := range st.Initiatives {
		from := contribution(project, i.File, i.Name, i.Description, i.Body)
		initiative := contribute(&c.p.Initiatives, c.initiatives, i.ID, from, func(base Doc) *Initiative {
			return &Initiative{Doc: base, Capabilities: []string{}, Features: []string{}, Personas: []string{}}
		})
		initiative.Personas = union(initiative.Personas, ids(i.Personas)...)
	}

	for _, m := range st.Mechanisms {
		doc := c.technical(&c.p.Mechanisms, c.mechanisms, KindMechanism, project, m.ID, m.File, m.Name, m.Description, m.Body,
			m.Decisions, m.Capabilities, m.Meets, own(m.Gaps), own(m.Tradeoffs), m.Evidence)
		doc.Respects = union(doc.Respects, ids(m.Respects)...)
		if m.Applies == "product" {
			doc.Applies = "product"
			c.across = append(c.across, acrossProduct{doc: doc, product: product.ID})
		}
	}
	for _, m := range st.Components {
		doc := c.technical(&c.p.Components, c.components, KindComponent, project, m.ID, m.File, m.Name, m.Description, m.Body,
			m.Decisions, m.Capabilities, m.Meets, own(m.Gaps), own(m.Tradeoffs), m.Evidence)
		if doc.Within == "" && m.Within != nil {
			doc.Within = idOf(*m.Within)
		}
		if doc.Is == "" && m.Is != nil {
			doc.Is = idOf(*m.Is)
		}
	}
	for _, a := range st.Archetypes {
		contribute(&c.p.Archetypes, c.archetypes, a.ID, contribution(project, a.File, a.Name, a.Description, a.Body), func(base Doc) *Archetype {
			return &Archetype{Doc: base, Components: []string{}, Capabilities: []string{}}
		})
	}

	// Each place in the code a gap or tradeoff names says which project it's
	// in, as evidence does.
	placed := func(places []state.Place) []Place {
		out := make([]Place, 0, len(places))
		for _, pl := range places {
			out = append(out, Place{Project: project, Place: pl})
		}
		return out
	}
	for _, g := range st.Gaps {
		c.p.Gaps = append(c.p.Gaps, &Gap{
			ID: g.ID + "@" + project, Project: project,
			Affects: append([]string{}, g.Affects...),
			Impact:  g.Impact, Likelihood: g.Likelihood, Reach: g.Reach,
			Name: g.Name, Description: g.Description, Places: placed(g.Places),
		})
	}
	for _, t := range st.Tradeoffs {
		c.p.Tradeoffs = append(c.p.Tradeoffs, &Tradeoff{
			ID: t.ID + "@" + project, Project: project,
			Affects: append([]string{}, t.Affects...),
			Name:    t.Name, Description: t.Description, Benefit: t.Benefit, Drawback: t.Drawback,
			Places: placed(t.Places),
		})
	}

	for _, pr := range st.Findings {
		pr.Capabilities = ids(pr.Capabilities)
		c.p.Findings = append(c.p.Findings, pr)
	}
}

// technical adds one project's contribution to a mechanism or component.
func (c *combiner) technical(list *[]*Technical, index map[string]*Technical, kind, project, id, file, name, description, body string,
	ds []state.Decision, capabilities, meets, gaps, tradeoffs []string, ev state.Evidence,
) *Technical {
	from := contribution(project, file, name, description, body)
	from.Decisions = decisions(ds, project)
	doc := contribute(list, index, id, from, func(base Doc) *Technical {
		return &Technical{
			Doc: base, Kind: kind, Applies: "project", Respects: []string{}, Parts: []string{},
			Capabilities: []string{}, Meets: []string{}, Gaps: []string{}, Tradeoffs: []string{},
			Evidence: newEvidence(),
		}
	})
	doc.Capabilities = union(doc.Capabilities, ids(capabilities)...)
	doc.Meets = union(doc.Meets, meets...)
	doc.Gaps = union(doc.Gaps, gaps...)
	doc.Tradeoffs = union(doc.Tradeoffs, tradeoffs...)
	addEvidence(&doc.Evidence, ev, project)
	return doc
}

// resolveLinks leaves out links to rules and concepts no project defines.
// Then a mechanism that applies across its product gets what every project
// in it serves, which no one project's indexer can see.
func (c *combiner) resolveLinks() {
	known := func(index map[string]bool, list []string) []string {
		return slices.DeleteFunc(list, func(id string) bool { return !index[id] })
	}
	rules, concepts := map[string]bool{}, map[string]bool{}
	for id := range c.rules {
		rules[id] = true
	}
	for id := range c.concepts {
		concepts[id] = true
	}
	for _, cp := range c.p.Capabilities {
		cp.Rules = known(rules, cp.Rules)
		cp.Concepts = known(concepts, cp.Concepts)
	}
	for _, r := range c.p.Rules {
		r.Concepts = known(concepts, r.Concepts)
	}
	for _, a := range c.across {
		a.doc.Capabilities = union(a.doc.Capabilities, c.serves[a.product]...)
	}
}

// reverseLinks works out what links to rules, concepts and capabilities
// again, across everything.
func (c *combiner) reverseLinks() {
	for _, cp := range c.p.Capabilities {
		for _, key := range cp.Rules {
			if r := c.rules[key]; r != nil {
				r.Capabilities = union(r.Capabilities, cp.ID)
			}
		}
		for _, key := range cp.Concepts {
			if cn := c.concepts[key]; cn != nil {
				cn.Capabilities = union(cn.Capabilities, cp.ID)
			}
		}
	}
	for _, r := range c.p.Rules {
		for _, key := range r.Concepts {
			if cn := c.concepts[key]; cn != nil {
				cn.Rules = union(cn.Rules, r.ID)
			}
		}
	}
	for _, t := range slices.Concat(c.p.Mechanisms, c.p.Components) {
		for _, id := range t.Capabilities {
			if cp := c.capabilities[id]; cp != nil {
				cp.BuiltBy = union(cp.BuiltBy, t.Kind+":"+t.ID)
			}
		}
	}
}

// resolveGaps links each rule a gap affects back to the gap. One that isn't
// there is left out.
func (c *combiner) resolveGaps() {
	for _, g := range c.p.Gaps {
		affects := []string{}
		for _, ref := range g.Affects {
			if !strings.HasPrefix(ref, state.TypeRule+":") {
				affects = append(affects, ref)
				continue
			}
			r := c.rules[idOf(ref)]
			if r == nil {
				continue
			}
			r.Gaps = union(r.Gaps, g.ID)
			affects = append(affects, state.TypeRule+":"+r.ID)
		}
		g.Affects = affects
	}
}

// featuresOfCapabilities gives each capability the feature it names, with a
// finding when projects name different ones, each feature its capabilities,
// by name, and each capability its level in short: the lowest of its levels.
func (c *combiner) featuresOfCapabilities() {
	for _, cp := range c.p.Capabilities {
		if f := c.general(state.TypeCapability, cp.ID, c.featureOf[cp.ID], state.InTwoFeatures, "Named in %d features: %s."); f != "" {
			cp.Feature = &f
			if feature := c.features[f]; feature != nil {
				feature.Capabilities = union(feature.Capabilities, cp.ID)
			}
		}
		cp.Stability = cp.Levels[0].Level
		for _, l := range cp.Levels {
			if Rank(l.Level) < Rank(cp.Stability) {
				cp.Stability = l.Level
			}
		}
	}
	for _, f := range c.p.Features {
		c.byName(f.Capabilities, func(id string) string {
			if cp := c.capabilities[id]; cp != nil {
				return cp.Name
			}
			return id
		})
	}
}

// areasOfFeatures gives each feature the area it names, with a finding when
// projects name different ones, and each area its features, by name.
func (c *combiner) areasOfFeatures() {
	for _, f := range c.p.Features {
		if a := c.general(state.TypeFeature, f.ID, c.areaOf[f.ID], state.Contradiction, "Named in %d areas: %s."); a != "" {
			f.Area = &a
			if area := c.areas[a]; area != nil {
				area.Features = union(area.Features, f.ID)
			}
		}
	}
	for _, a := range c.p.Areas {
		c.byName(a.Features, func(id string) string {
			if f := c.features[id]; f != nil {
				return f.Name
			}
			return id
		})
	}
}

// general is the more general doc one doc names, such as a capability's
// feature: the first project's, with a finding of type typ when projects
// name different ones, or "" when none names one.
func (c *combiner) general(typ, id string, all []placed, findingType, message string) string {
	var generals []string
	for _, p := range all {
		generals = union(generals, p.general)
	}
	if len(generals) == 0 {
		return ""
	}
	if len(generals) > 1 {
		where := make([]string, 0, len(all))
		for _, p := range all {
			where = append(where, p.general+" in "+c.projectName(p.project))
		}
		capabilities := []string{}
		if typ == state.TypeCapability {
			capabilities = []string{id}
		}
		c.p.Findings = append(c.p.Findings, state.Finding{
			Type:         findingType,
			Subject:      state.DocRef(typ, id),
			Capabilities: capabilities,
			Message:      fmt.Sprintf(message, len(generals), strings.Join(where, ", ")),
		})
	}
	return generals[0]
}

// byName sorts IDs by the name of the doc each is, readers' order for what's
// worked out rather than listed.
func (c *combiner) byName(list []string, name func(string) string) {
	slices.SortStableFunc(list, func(a, b string) int { return strings.Compare(name(a), name(b)) })
}

// solvedProblems works out each problem's capabilities, and each persona's
// problems. A capability has the personas of the problems it solves, across
// every project, and isn't reported as solving none by a project that leaves
// its problems to another.
func (c *combiner) solvedProblems() {
	for _, pr := range c.p.Problems {
		for _, id := range pr.Personas {
			if p := c.personas[id]; p != nil {
				p.Problems = union(p.Problems, pr.ID)
			}
		}
	}
	solves := map[string]bool{}
	for _, cp := range c.p.Capabilities {
		if len(cp.Solves) == 0 {
			continue
		}
		solves[cp.ID] = true
		personas := []string{}
		for _, id := range cp.Solves {
			if pr := c.problems[id]; pr != nil {
				pr.Capabilities = union(pr.Capabilities, cp.ID)
				personas = union(personas, pr.Personas...)
			}
		}
		cp.Personas = personas
	}
	c.p.Findings = slices.DeleteFunc(c.p.Findings, func(f state.Finding) bool {
		return f.Type == state.SolvesNoProblem && solves[idOf(f.Subject)]
	})
}

// respectedConstraints works out the rules and mechanisms that respect each
// constraint, across every project, so a constraint one project declares and
// another respects isn't reported as respected by nothing.
func (c *combiner) respectedConstraints() {
	for _, r := range c.p.Rules {
		for _, id := range r.Respects {
			if cn := c.constraints[id]; cn != nil {
				cn.Rules = union(cn.Rules, r.ID)
			}
		}
	}
	for _, m := range c.p.Mechanisms {
		for _, id := range m.Respects {
			if cn := c.constraints[id]; cn != nil {
				cn.Mechanisms = union(cn.Mechanisms, m.ID)
			}
		}
	}
	c.p.Findings = slices.DeleteFunc(c.p.Findings, func(f state.Finding) bool {
		if f.Type != state.RespectedByNothing {
			return false
		}
		cn := c.constraints[idOf(f.Subject)]
		return cn != nil && (len(cn.Rules) > 0 || len(cn.Mechanisms) > 0)
	})
}

// componentStructure works out, across every project, each component's
// parts and archetype, each archetype's components and the capabilities they
// serve, and each capability's archetypes. A component's archetype is its
// own, or else the nearest bigger component's, so a part of the server is a
// service unless it says otherwise.
func (c *combiner) componentStructure() {
	for _, t := range c.p.Components {
		if parent := c.components[t.Within]; parent != nil && parent != t {
			parent.Parts = union(parent.Parts, t.ID)
		}
		seen := map[*Technical]bool{}
		for at := t; at != nil && !seen[at]; at = c.components[at.Within] {
			seen[at] = true
			if at.Is != "" {
				t.Archetype = at.Is
				break
			}
		}
		a := c.archetypes[t.Archetype]
		if a == nil {
			t.Archetype = ""
			continue
		}
		a.Components = union(a.Components, t.ID)
		a.Capabilities = union(a.Capabilities, t.Capabilities...)
		for _, id := range t.Capabilities {
			if cp := c.capabilities[id]; cp != nil {
				cp.Archetypes = union(cp.Archetypes, a.ID)
			}
		}
	}
}

// personasAndInitiatives works out each persona's capabilities and the
// features those are in, and each initiative's capabilities, personas and
// features.
func (c *combiner) personasAndInitiatives() {
	featuresOf := func(capabilities []string) []string {
		out := []string{}
		for _, f := range c.p.Features {
			if slices.ContainsFunc(capabilities, func(id string) bool { return slices.Contains(f.Capabilities, id) }) {
				out = append(out, f.ID)
			}
		}
		return out
	}
	for _, cp := range c.p.Capabilities {
		for _, id := range cp.Personas {
			if p := c.personas[id]; p != nil {
				p.Capabilities = union(p.Capabilities, cp.ID)
			}
		}
	}
	for _, p := range c.p.Personas {
		p.Features = union(p.Features, featuresOf(p.Capabilities)...)
	}
	for _, cp := range c.p.Capabilities {
		for _, id := range cp.Initiatives {
			if i := c.initiatives[id]; i != nil {
				i.Capabilities = union(i.Capabilities, cp.ID)
			}
		}
	}
	for _, i := range c.p.Initiatives {
		for _, id := range i.Personas {
			if p := c.personas[id]; p != nil {
				p.Initiatives = union(p.Initiatives, i.ID)
			}
		}
	}
	for _, i := range c.p.Initiatives {
		i.Features = union(i.Features, featuresOf(i.Capabilities)...)
	}
}

// contradictions adds a finding for each doc whose contributions say
// different things: its name, a persona's role or title, or its description,
// and a rule's body too.
func (c *combiner) contradictions() {
	differing := func(typ string, docs []*Doc) {
		for _, d := range docs {
			var said []string
			for _, f := range d.From {
				body := ""
				if typ == state.TypeRule {
					body = f.Body
				}
				said = union(said, strings.Join([]string{f.Name, deref(f.Role), deref(f.Title), deref(f.Cost), deref(f.Source), f.Description, body}, "\n"))
			}
			if len(said) < 2 {
				continue
			}
			capabilities := []string{}
			if typ == state.TypeCapability {
				capabilities = []string{d.ID}
			}
			c.p.Findings = append(c.p.Findings, state.Finding{
				Type:         state.Contradiction,
				Subject:      state.DocRef(typ, d.ID),
				Capabilities: capabilities,
				Message:      fmt.Sprintf("%s describe %s differently.", c.names(projectsOf(d)), d.Name),
			})
		}
	}
	differing(state.TypeArea, docs(c.p.Areas))
	differing(state.TypeFeature, docs(c.p.Features))
	differing(state.TypeCapability, docs(c.p.Capabilities))
	differing(state.TypeRule, docs(c.p.Rules))
	differing(state.TypeConcept, docs(c.p.Concepts))
	differing(state.TypePersona, docs(c.p.Personas))
	differing(state.TypeProblem, docs(c.p.Problems))
	differing(state.TypeConstraint, docs(c.p.Constraints))
	differing(state.TypeInitiative, docs(c.p.Initiatives))
	differing(state.TypeMechanism, docs(c.p.Mechanisms))
	differing(state.TypeComponent, docs(c.p.Components))
	differing(state.TypeArchetype, docs(c.p.Archetypes))
}

// duplicates adds a finding for each gap or tradeoff ID two projects both
// declare. Within a project, its own check reports it.
func (c *combiner) duplicates() {
	var refs []string
	by := map[string][]string{}
	add := func(id, project string) {
		ref := id[:strings.LastIndex(id, "@")]
		if _, ok := by[ref]; !ok {
			refs = append(refs, ref)
		}
		by[ref] = union(by[ref], project)
	}
	for _, g := range c.p.Gaps {
		add(g.ID, g.Project)
	}
	for _, t := range c.p.Tradeoffs {
		add(t.ID, t.Project)
	}
	for _, ref := range refs {
		if len(by[ref]) < 2 {
			continue
		}
		doc, _, _ := strings.Cut(ref, "#")
		capabilities := []string{}
		if id, ok := strings.CutPrefix(doc, state.TypeCapability+":"); ok {
			capabilities = []string{id}
		}
		c.p.Findings = append(c.p.Findings, state.Finding{
			Type:         state.DuplicateID,
			Subject:      doc,
			Capabilities: capabilities,
			Message:      fmt.Sprintf("%s each declare %s. Give one of them another key.", c.names(by[ref]), ref),
		})
	}
}

// projectName is a project's name, or its ID if it isn't one being shown.
func (c *combiner) projectName(id string) string {
	for _, p := range c.p.Projects {
		if p.ID == id {
			return p.Name
		}
	}
	return id
}

// names lists projects by name: "A", "A and B", "A, B and C".
func (c *combiner) names(projects []string) string {
	names := make([]string, 0, len(projects))
	for _, p := range projects {
		names = append(names, c.projectName(p))
	}
	if len(names) < 2 {
		return strings.Join(names, "")
	}
	return strings.Join(names[:len(names)-1], ", ") + " and " + names[len(names)-1]
}

// projectsOf is the projects that contribute to a doc, each once, in order.
func projectsOf(d *Doc) []string {
	var out []string
	for _, f := range d.From {
		out = union(out, f.Project)
	}
	return out
}

// docOf is what every combined doc type has: its Doc.
type docOf interface{ doc() *Doc }

func (d *Doc) doc() *Doc { return d }

func docs[T docOf](list []T) []*Doc {
	out := make([]*Doc, 0, len(list))
	for _, t := range list {
		out = append(out, t.doc())
	}
	return out
}

// contribute adds a contribution to the doc with id, making the doc first if
// it's the first contribution to it. A new doc says what its first
// contribution does.
func contribute[T docOf](list *[]T, index map[string]T, id string, from Contribution, newDoc func(Doc) T) T {
	t, ok := index[id]
	if !ok {
		t = newDoc(Doc{
			ID: id, Project: from.Project, File: from.File,
			Name: from.Name, Description: from.Description, Body: from.Body, From: []Contribution{},
		})
		*list = append(*list, t)
		index[id] = t
	}
	d := t.doc()
	d.From = append(d.From, from)
	return t
}

func contribution(project, file, name, description, body string) Contribution {
	return Contribution{Project: project, File: file, Name: name, Description: description, Body: body}
}

func newEvidence() Evidence {
	return Evidence{Implements: []Place{}, Verifies: []Place{}}
}

// decisions is a contribution's open decisions, with what each affects,
// other than an outcome, made its project's.
func decisions(ds []state.Decision, project string) []state.Decision {
	out := make([]state.Decision, 0, len(ds))
	for _, d := range ds {
		affects := make([]string, 0, len(d.Affects))
		for _, ref := range d.Affects {
			if !state.IsOutcomeRef(ref) {
				ref += "@" + project
			}
			affects = append(affects, ref)
		}
		d.Affects = affects
		out = append(out, d)
	}
	return out
}

// addEvidence adds one project's evidence, without repeating a place the
// doc's other contributions from it already added.
func addEvidence(into *Evidence, from state.Evidence, project string) {
	add := func(list []Place, places []state.Place) []Place {
		for _, pl := range places {
			if !slices.ContainsFunc(list, func(x Place) bool {
				return x.Project == project && x.File == pl.File && x.Line == pl.Line
			}) {
				list = append(list, Place{Project: project, Place: pl})
			}
		}
		return list
	}
	into.Implements = add(into.Implements, from.Implements)
	into.Verifies = add(into.Verifies, from.Verifies)
}

// union adds the IDs list doesn't have yet, keeping the order.
func union(list []string, ids ...string) []string {
	for _, id := range ids {
		if !slices.Contains(list, id) {
			list = append(list, id)
		}
	}
	return list
}

// idOf is a reference's ID: rule:no-double-booking is no-double-booking.
func idOf(ref string) string {
	return ref[strings.Index(ref, ":")+1:]
}

// ids is each reference's ID, never nil.
func ids(refs []string) []string {
	out := make([]string, 0, len(refs))
	for _, r := range refs {
		out = append(out, idOf(r))
	}
	return out
}

func deref(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
