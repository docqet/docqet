package combine

import (
	"fmt"
	"slices"
	"strings"

	"github.com/exalynt/docket/internal/state"
)

// Combine puts the states of a product's projects together, in the order
// they're given, as the product concept's Combining section says:
//
//   - Domains, features and capabilities are one across everything, so
//     contributions with the same ID are put together, their links combined.
//     Features and capabilities span domains: each domain that writes one has
//     a part in it, and a capability keeps its level in each.
//   - Rules and concepts are their domain's, keyed <id>@<domain>, so the same
//     ID in two domains is two definitions. A link to one means the domain it
//     names, else its own domain's.
//   - Gaps and tradeoffs are their project's, keyed <id>@<project>.
//
// Then reverse links and parts are worked out again across everything, and
// contradictions between contributions, and gaps or tradeoffs two projects
// both declare, become problems. It never changes the states it's given.
// docket:implements capability:product-view rule:contradictions-shown@reporting
func Combine(states []*state.State) *Product {
	c := newCombiner()
	for _, st := range states {
		c.add(st)
	}
	c.placeholderDomains()
	c.resolveLinks()
	c.reverseLinks()
	c.resolveGaps()
	c.featuresOfCapabilities()
	c.parts()
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

// pending is a doc's rule and concept links as declared, to resolve once
// every domain is in. Rules is nil for a rule, which links none.
type pending struct {
	domain          string
	rules, concepts *[]string
	linkedRules     []string
	linkedConcepts  []string
}

// listing is a feature listing a capability, in one project.
type listing struct {
	feature, project string
}

// featureList is the capabilities one domain lists in its doc of a feature.
type featureList struct {
	domain       string
	capabilities []string
}

// acrossProduct is a mechanism that applies across a product.
type acrossProduct struct {
	doc     *Technical
	product string
}

type combiner struct {
	p *Product

	domains      map[string]*Domain
	features     map[string]*Feature
	capabilities map[string]*Capability
	rules        map[string]*Rule
	concepts     map[string]*Concept
	personas     map[string]*Persona
	initiatives  map[string]*Initiative
	mechanisms   map[string]*Technical
	components   map[string]*Technical

	pending      []pending
	listings     map[string][]listing     // by capability
	featureLists map[string][]featureList // by feature
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
			Domains:      []*Domain{},
			Features:     []*Feature{},
			Capabilities: []*Capability{},
			Rules:        []*Rule{},
			Concepts:     []*Concept{},
			Personas:     []*Persona{},
			Initiatives:  []*Initiative{},
			Mechanisms:   []*Technical{},
			Components:   []*Technical{},
			Gaps:         []*Gap{},
			Tradeoffs:    []*Tradeoff{},
			Problems:     []state.Problem{},
		},
		domains:      map[string]*Domain{},
		features:     map[string]*Feature{},
		capabilities: map[string]*Capability{},
		rules:        map[string]*Rule{},
		concepts:     map[string]*Concept{},
		personas:     map[string]*Persona{},
		initiatives:  map[string]*Initiative{},
		mechanisms:   map[string]*Technical{},
		components:   map[string]*Technical{},
		listings:     map[string][]listing{},
		featureLists: map[string][]featureList{},
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

	for _, d := range st.Domains {
		from := contribution(project, d.ID, d.File, d.Name, d.Description, d.Body)
		from.Decisions = decisions(d.Decisions, project)
		contribute(&c.p.Domains, c.domains, d.ID, from, newDomain)
	}

	for _, f := range st.Features {
		from := contribution(project, f.Domain, f.File, f.Name, f.Description, f.Body)
		from.Decisions = decisions(f.Decisions, project)
		feature := contribute(&c.p.Features, c.features, f.ID, from, func(base Doc) *Feature {
			return &Feature{Doc: base, Capabilities: []string{}, Tradeoffs: []string{}, Parts: []Part{}}
		})
		caps := ids(f.Capabilities)
		feature.Capabilities = union(feature.Capabilities, caps...)
		feature.Tradeoffs = union(feature.Tradeoffs, own(f.Tradeoffs)...)
		for _, id := range caps {
			c.listings[id] = append(c.listings[id], listing{feature: f.ID, project: project})
		}
		c.featureLists[f.ID] = append(c.featureLists[f.ID], featureList{domain: f.Domain, capabilities: caps})
	}

	for _, cp := range st.Capabilities {
		from := contribution(project, cp.Domain, cp.File, cp.Name, cp.Description, cp.Body)
		from.Decisions = decisions(cp.Decisions, project)
		capability := contribute(&c.p.Capabilities, c.capabilities, cp.ID, from, func(base Doc) *Capability {
			return &Capability{
				Doc:         base,
				Personas:    []string{},
				Initiatives: []string{},
				Stability:   cp.Stability,
				Levels:      []LevelIn{},
				Rules:       []string{},
				Concepts:    []string{},
				Gaps:        []string{},
				Tradeoffs:   []string{},
				BuiltBy:     []string{},
				Evidence:    newEvidence(),
			}
		})
		addEvidence(&capability.Evidence, cp.Evidence, project)
		capability.Levels = append(capability.Levels, LevelIn{Project: project, Domain: cp.Domain, Level: cp.Stability})
		capability.Personas = union(capability.Personas, ids(cp.Personas)...)
		capability.Initiatives = union(capability.Initiatives, ids(cp.Initiatives)...)
		capability.Gaps = union(capability.Gaps, own(cp.Gaps)...)
		capability.Tradeoffs = union(capability.Tradeoffs, own(cp.Tradeoffs)...)
		c.pending = append(c.pending, pending{
			domain: cp.Domain, rules: &capability.Rules, concepts: &capability.Concepts,
			linkedRules: ids(cp.Rules), linkedConcepts: ids(cp.Concepts),
		})
	}

	for _, r := range st.Rules {
		from := contribution(project, r.Domain, r.File, r.Name, "", r.Body)
		from.Why = r.Why
		rule := contribute(&c.p.Rules, c.rules, r.ID+"@"+r.Domain, from, func(base Doc) *Rule {
			return &Rule{Doc: base, Capabilities: []string{}, Concepts: []string{}, Gaps: []string{}, Evidence: newEvidence()}
		})
		addEvidence(&rule.Evidence, r.Evidence, project)
		c.pending = append(c.pending, pending{domain: r.Domain, concepts: &rule.Concepts, linkedConcepts: ids(r.Concepts)})
	}

	for _, cn := range st.Concepts {
		from := contribution(project, cn.Domain, cn.File, cn.Name, cn.Description, cn.Body)
		from.ConfusedWith = make([]state.Confusion, 0, len(cn.ConfusedWith))
		for _, w := range cn.ConfusedWith {
			if w.Concept != nil {
				id := idOf(*w.Concept)
				w.Concept = &id
			}
			from.ConfusedWith = append(from.ConfusedWith, w)
		}
		contribute(&c.p.Concepts, c.concepts, cn.ID+"@"+cn.Domain, from, func(base Doc) *Concept {
			return &Concept{Doc: base, Capabilities: []string{}, Rules: []string{}}
		})
	}

	// A persona is in no domain; its contributions are told apart by project.
	for _, pr := range st.Personas {
		from := contribution(project, "", pr.File, pr.Name, pr.Description, pr.Body)
		from.Role, from.Title = pr.Role, pr.Title
		persona := contribute(&c.p.Personas, c.personas, pr.ID, from, func(base Doc) *Persona {
			return &Persona{
				Doc: base, Role: pr.Role, Title: pr.Title, Image: pr.Image,
				Capabilities: []string{}, Features: []string{}, Initiatives: []string{},
			}
		})
		persona.Initiatives = union(persona.Initiatives, ids(pr.Initiatives)...)
	}

	// An initiative is in no domain either.
	for _, i := range st.Initiatives {
		from := contribution(project, "", i.File, i.Name, i.Description, i.Body)
		contribute(&c.p.Initiatives, c.initiatives, i.ID, from, func(base Doc) *Initiative {
			return &Initiative{Doc: base, Capabilities: []string{}, Features: []string{}, Personas: []string{}}
		})
	}

	// Mechanisms and components are in no domain either.
	for _, m := range st.Mechanisms {
		doc := c.technical(&c.p.Mechanisms, c.mechanisms, KindMechanism, project, m.ID, m.File, m.Name, m.Description, m.Body,
			m.Decisions, m.Capabilities, m.Meets, own(m.Gaps), own(m.Tradeoffs), m.Evidence)
		if m.Applies == "product" {
			doc.Applies = "product"
			c.across = append(c.across, acrossProduct{doc: doc, product: product.ID})
		}
	}
	for _, m := range st.Components {
		c.technical(&c.p.Components, c.components, KindComponent, project, m.ID, m.File, m.Name, m.Description, m.Body,
			m.Decisions, m.Capabilities, m.Meets, own(m.Gaps), own(m.Tradeoffs), m.Evidence)
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
			ID: g.ID + "@" + project, Project: project, Domain: g.Domain,
			Affects: append([]string{}, g.Affects...),
			Impact:  g.Impact, Likelihood: g.Likelihood, Reach: g.Reach,
			Name: g.Name, Description: g.Description, Places: placed(g.Places),
		})
	}
	for _, t := range st.Tradeoffs {
		c.p.Tradeoffs = append(c.p.Tradeoffs, &Tradeoff{
			ID: t.ID + "@" + project, Project: project, Domain: t.Domain,
			Affects: append([]string{}, t.Affects...),
			Name:    t.Name, Description: t.Description, Benefit: t.Benefit, Drawback: t.Drawback,
			Places: placed(t.Places),
		})
	}

	// A rule or concept a problem names is its domain's.
	for _, pr := range st.Problems {
		typ, _, _ := strings.Cut(pr.Subject, ":")
		if (typ == state.TypeRule || typ == state.TypeConcept) && pr.Domain != "" {
			pr.Subject += "@" + pr.Domain
		}
		pr.Capabilities = ids(pr.Capabilities)
		c.p.Problems = append(c.p.Problems, pr)
	}
}

// technical adds one project's contribution to a mechanism or component.
func (c *combiner) technical(list *[]*Technical, index map[string]*Technical, kind, project, id, file, name, description, body string,
	ds []state.Decision, capabilities, meets, gaps, tradeoffs []string, ev state.Evidence,
) *Technical {
	from := contribution(project, "", file, name, description, body)
	from.Decisions = decisions(ds, project)
	doc := contribute(list, index, id, from, func(base Doc) *Technical {
		return &Technical{
			Doc: base, Kind: kind, Applies: "project",
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

// placeholderDomains gives a domain docs are written in, with no domain doc,
// a place of its own, named by its ID.
func (c *combiner) placeholderDomains() {
	var froms [][]Contribution
	for _, f := range c.p.Features {
		froms = append(froms, f.From)
	}
	for _, cp := range c.p.Capabilities {
		froms = append(froms, cp.From)
	}
	for _, r := range c.p.Rules {
		froms = append(froms, r.From)
	}
	for _, cn := range c.p.Concepts {
		froms = append(froms, cn.From)
	}
	for _, from := range froms {
		for _, f := range from {
			if c.domains[f.Domain] != nil {
				continue
			}
			d := newDomain(Doc{ID: f.Domain, Project: f.Project, Domain: f.Domain, Name: f.Domain, From: []Contribution{}})
			c.p.Domains = append(c.p.Domains, d)
			c.domains[d.ID] = d
		}
	}
}

// resolveLinks resolves links to rules and concepts: to the domain named,
// else the linking doc's own. One to nothing is left out. Then a mechanism
// that applies across its product gets what every project in it serves,
// which no one project's indexer can see.
func (c *combiner) resolveLinks() {
	for _, p := range c.pending {
		if p.rules != nil {
			for _, link := range p.linkedRules {
				if key := inDomain(link, p.domain); c.rules[key] != nil {
					*p.rules = union(*p.rules, key)
				}
			}
		}
		for _, link := range p.linkedConcepts {
			if key := inDomain(link, p.domain); c.concepts[key] != nil {
				*p.concepts = union(*p.concepts, key)
			}
		}
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

// resolveGaps resolves a rule a gap affects to the domain it names, else the
// gap's own, as a capability's link to one is. One that isn't there is left
// out.
func (c *combiner) resolveGaps() {
	for _, g := range c.p.Gaps {
		affects := []string{}
		for _, ref := range g.Affects {
			if !strings.HasPrefix(ref, state.TypeRule+":") {
				affects = append(affects, ref)
				continue
			}
			r := c.rules[inDomain(idOf(ref), g.Domain)]
			if r == nil {
				continue
			}
			r.Gaps = union(r.Gaps, g.ID)
			affects = append(affects, state.TypeRule+":"+r.ID)
		}
		g.Affects = affects
	}
}

// featuresOfCapabilities gives each capability the first feature that lists
// it, with a problem when projects list it in different ones, and its level
// in short: the lowest of its levels.
func (c *combiner) featuresOfCapabilities() {
	for _, cp := range c.p.Capabilities {
		all := c.listings[cp.ID]
		var features, projects []string
		for _, l := range all {
			features = union(features, l.feature)
			projects = union(projects, l.project)
		}
		if len(features) > 1 && len(projects) > 1 {
			where := make([]string, 0, len(all))
			for _, l := range all {
				where = append(where, l.feature+" in "+c.projectName(l.project))
			}
			c.p.Problems = append(c.p.Problems, state.Problem{
				Type:         state.InTwoFeatures,
				Subject:      state.DocRef(state.TypeCapability, cp.ID),
				Capabilities: []string{cp.ID},
				Message:      fmt.Sprintf("Listed in %d features: %s.", len(features), strings.Join(where, ", ")),
			})
		}
		if len(features) > 0 {
			f := features[0]
			cp.Feature = &f
		}
		cp.Stability = cp.Levels[0].Level
		for _, l := range cp.Levels {
			if Rank(l.Level) < Rank(cp.Stability) {
				cp.Stability = l.Level
			}
		}
	}
}

// parts works out each feature's part in each domain: the capabilities that
// domain builds, or lists in its own doc of the feature. Each domain gets the
// features it has a part in, and the capabilities in no feature it builds.
func (c *combiner) parts() {
	builds := func(id, domain string) bool {
		cp := c.capabilities[id]
		if cp == nil {
			return false
		}
		return slices.ContainsFunc(cp.Levels, func(l LevelIn) bool { return domain == "" || l.Domain == domain })
	}
	for _, f := range c.p.Features {
		var domains []string
		for _, l := range c.featureLists[f.ID] {
			domains = union(domains, l.domain)
		}
		for _, id := range f.Capabilities {
			if cp := c.capabilities[id]; cp != nil {
				for _, l := range cp.Levels {
					domains = union(domains, l.Domain)
				}
			}
		}
		for _, domain := range domains {
			var listedThere []string
			for _, l := range c.featureLists[f.ID] {
				if l.domain == domain {
					listedThere = append(listedThere, l.capabilities...)
				}
			}
			capabilities := []string{}
			for _, id := range f.Capabilities {
				if slices.Contains(listedThere, id) || builds(id, domain) {
					capabilities = append(capabilities, id)
				}
			}
			f.Parts = append(f.Parts, Part{Domain: domain, Capabilities: capabilities})
			if d := c.domains[domain]; d != nil {
				d.Features = union(d.Features, f.ID)
			}
		}
	}
	for _, cp := range c.p.Capabilities {
		if cp.Feature != nil {
			continue
		}
		for _, l := range cp.Levels {
			if d := c.domains[l.Domain]; d != nil {
				d.Capabilities = union(d.Capabilities, cp.ID)
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
	for _, p := range c.p.Personas {
		for _, id := range p.Initiatives {
			if i := c.initiatives[id]; i != nil {
				i.Personas = union(i.Personas, p.ID)
			}
		}
	}
	for _, i := range c.p.Initiatives {
		i.Features = union(i.Features, featuresOf(i.Capabilities)...)
	}
}

// contradictions adds a problem for each doc whose contributions say
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
				said = union(said, strings.Join([]string{f.Name, deref(f.Role), deref(f.Title), f.Description, body}, "\n"))
			}
			if len(said) < 2 {
				continue
			}
			capabilities := []string{}
			if typ == state.TypeCapability {
				capabilities = []string{d.ID}
			}
			c.p.Problems = append(c.p.Problems, state.Problem{
				Type:         state.Contradiction,
				Subject:      state.DocRef(typ, d.ID),
				Capabilities: capabilities,
				Message:      fmt.Sprintf("%s describe %s differently.", c.names(projectsOf(d)), d.Name),
			})
		}
	}
	differing(state.TypeDomain, docs(c.p.Domains))
	differing(state.TypeFeature, docs(c.p.Features))
	differing(state.TypeCapability, docs(c.p.Capabilities))
	differing(state.TypeRule, docs(c.p.Rules))
	differing(state.TypeConcept, docs(c.p.Concepts))
	differing(state.TypePersona, docs(c.p.Personas))
	differing(state.TypeInitiative, docs(c.p.Initiatives))
	differing(state.TypeMechanism, docs(c.p.Mechanisms))
	differing(state.TypeComponent, docs(c.p.Components))
}

// duplicates adds a problem for each gap or tradeoff ID two projects both
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
		c.p.Problems = append(c.p.Problems, state.Problem{
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
			ID: id, Project: from.Project, Domain: from.Domain, File: from.File,
			Name: from.Name, Description: from.Description, Body: from.Body, From: []Contribution{},
		})
		*list = append(*list, t)
		index[id] = t
	}
	d := t.doc()
	d.From = append(d.From, from)
	return t
}

func contribution(project, domain, file, name, description, body string) Contribution {
	return Contribution{Project: project, Domain: domain, File: file, Name: name, Description: description, Body: body}
}

func newDomain(base Doc) *Domain {
	return &Domain{Doc: base, Features: []string{}, Capabilities: []string{}}
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
		out = append(out, state.Decision{Topic: d.Topic, Question: d.Question, Affects: affects})
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

// idOf is a reference's ID, keeping any @<domain>: rule:no-double-booking is
// no-double-booking.
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

// inDomain is the rule or concept a link from a doc in domain means, keyed
// <id>@<domain>: the domain it names, else domain.
func inDomain(link, domain string) string {
	if strings.Contains(link, "@") {
		return link
	}
	return link + "@" + domain
}

func deref(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
