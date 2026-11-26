// Package combine puts the states of a product's projects together as one
// picture, as the product concept's Combining section describes: each doc
// once, with every project's contribution to it, links resolved across
// projects, reverse links worked out again, and the problems only the
// product shows. It's pure: what it returns depends only on the states it's
// given. What's derived from the result, such as maturity and risk, is
// derive's.
package combine

import "github.com/exalynt/docket/internal/state"

// Draft is the level a draft capability has: declared, not started. It ranks
// below every stability level.
const Draft = "draft"

// Product is the states of the projects being shown, put together. IDs are
// as the UI's combining keys them: a domain, feature, capability, persona,
// initiative, mechanism or component keeps its own ID; a rule or concept is
// <id>@<domain>; a gap or tradeoff is its declared ID with @<project>, such as
// capability:room-booking#no-waitlist@hotel-bookings, since its key is its
// project's.
type Product struct {
	ID       string
	Name     string
	Projects []Project

	Domains      []*Domain
	Features     []*Feature
	Capabilities []*Capability
	Rules        []*Rule
	Concepts     []*Concept
	Personas     []*Persona
	Initiatives  []*Initiative
	Mechanisms   []*Technical
	Components   []*Technical
	Gaps         []*Gap
	Tradeoffs    []*Tradeoff
	Problems     []state.Problem

	// Rubric is the first project's, the same for every project, or nil with
	// none.
	Rubric *state.Rubric
}

// Project is a project being shown, from its state's header.
type Project struct {
	ID        string
	Name      string
	Product   state.Ident // the product it declares, or else one of its own, named for it
	Commit    string
	IndexedAt string
}

// Contribution is what one project says about a doc, in one domain. A
// persona, initiative, mechanism or component is in no domain, so its
// contributions' Domain is "".
type Contribution struct {
	Project     string
	Domain      string
	File        string
	Name        string
	Description string
	Body        string

	Role  *string // a persona's
	Title *string // a persona's

	// Decisions are the doc's open decisions as this project declares them.
	// What each affects, other than an outcome, has @<project> added, as gap
	// and tradeoff IDs do.
	Decisions    []state.Decision
	Why          *string           // a rule's
	ConfusedWith []state.Confusion // a concept's, with each concept link as an ID
}

// Doc is what every combined doc has: its ID, what its first contribution
// says, and every contribution in the order the projects were given.
type Doc struct {
	ID          string
	Project     string // the first contribution's
	Domain      string // the first contribution's
	File        string
	Name        string
	Description string
	Body        string
	From        []Contribution
}

// Place is where an annotation is, in which project's files.
type Place struct {
	Project string
	state.Place
}

// Evidence is the places that implement or verify a doc, across projects.
type Evidence struct {
	Implements []Place
	Verifies   []Place
}

// Domain is a part of the business. One that docs are written in, with no
// domain doc of its own, has no contributions and is named by its ID.
type Domain struct {
	Doc
	Features     []string // the features it has a part in, in the order they come up
	Capabilities []string // the capabilities in no feature that it builds part of
}

// Part is one domain's part of a feature: the capabilities that domain builds
// or lists in its own doc of the feature.
type Part struct {
	Domain       string
	Capabilities []string
}

// Feature is a job the product does, with its part in each domain.
type Feature struct {
	Doc
	Capabilities []string
	Tradeoffs    []string
	Parts        []Part
}

// LevelIn is a capability's level in one domain that builds it, and the
// project that says so. Level is a stability level, or Draft.
type LevelIn struct {
	Project string
	Domain  string
	Level   string
}

// Capability is something the product can do, built in one or more domains.
type Capability struct {
	Doc
	Personas    []string
	Initiatives []string
	// Stability is its level in short: the lowest of Levels, Draft lowest of
	// all.
	Stability string
	Levels    []LevelIn
	Feature   *string  // the first feature that lists it, or nil
	Rules     []string // as <id>@<domain>
	Concepts  []string // as <id>@<domain>
	Gaps      []string
	Tradeoffs []string
	// BuiltBy is the mechanisms that apply to it and the components that list
	// it, as mechanism:<id> or component:<id>.
	BuiltBy  []string
	Evidence Evidence
}

// Rule is a rule of a domain.
type Rule struct {
	Doc
	Capabilities []string // every capability that follows it
	Concepts     []string // as <id>@<domain>
	Gaps         []string // the gaps that affect it
	Evidence     Evidence
}

// Concept is a word of a domain's language.
type Concept struct {
	Doc
	Capabilities []string
	Rules        []string // as <id>@<domain>
}

// Persona is a type of person the product serves.
type Persona struct {
	Doc
	Role         *string
	Title        *string
	Image        *string
	Capabilities []string // every capability that lists it
	Features     []string // the features those are in
	Initiatives  []string
}

// Initiative is a body of work.
type Initiative struct {
	Doc
	Capabilities []string // every capability that lists it
	Features     []string // the features those are in
	Personas     []string // every persona that lists it
}

// The kinds of technical doc.
const (
	KindMechanism = "mechanism"
	KindComponent = "component"
)

// Technical is a mechanism or a component.
type Technical struct {
	Doc
	Kind string
	// Applies is "project" or "product": what a mechanism applies to. A
	// component's is always "project".
	Applies      string
	Capabilities []string
	Meets        []string
	Gaps         []string
	Tradeoffs    []string
	Evidence     Evidence
}

// Gap is a known gap, with the project that declares it. A rule it affects
// is resolved to rule:<id>@<domain>, and one that isn't there is left out.
type Gap struct {
	ID          string
	Project     string
	Domain      string // a product gap's; a technical gap has none
	Affects     []string
	Impact      *string
	Likelihood  *string
	Reach       *string
	Name        string
	Description string
	Places      []Place
}

// Tradeoff is a tradeoff, with the project that declares it.
type Tradeoff struct {
	ID          string
	Project     string
	Domain      string
	Affects     []string
	Name        string
	Description string
	Benefit     *string
	Drawback    string
	Places      []Place
}

func find[T any](list []*T, id string, idOf func(*T) string) *T {
	for _, x := range list {
		if idOf(x) == id {
			return x
		}
	}
	return nil
}

// Domain returns the domain with id, or nil.
func (p *Product) Domain(id string) *Domain {
	return find(p.Domains, id, func(d *Domain) string { return d.ID })
}

// Feature returns the feature with id, or nil.
func (p *Product) Feature(id string) *Feature {
	return find(p.Features, id, func(f *Feature) string { return f.ID })
}

// Capability returns the capability with id, or nil.
func (p *Product) Capability(id string) *Capability {
	return find(p.Capabilities, id, func(c *Capability) string { return c.ID })
}

// Rule returns the rule with key, <id>@<domain>, or nil.
func (p *Product) Rule(key string) *Rule {
	return find(p.Rules, key, func(r *Rule) string { return r.ID })
}

// Concept returns the concept with key, <id>@<domain>, or nil.
func (p *Product) Concept(key string) *Concept {
	return find(p.Concepts, key, func(c *Concept) string { return c.ID })
}

// Persona returns the persona with id, or nil.
func (p *Product) Persona(id string) *Persona {
	return find(p.Personas, id, func(x *Persona) string { return x.ID })
}

// Initiative returns the initiative with id, or nil.
func (p *Product) Initiative(id string) *Initiative {
	return find(p.Initiatives, id, func(i *Initiative) string { return i.ID })
}

// Technical returns the mechanism or component a reference names, such as
// mechanism:deployment, or nil.
func (p *Product) Technical(ref string) *Technical {
	for _, t := range append(append([]*Technical{}, p.Mechanisms...), p.Components...) {
		if t.Kind+":"+t.ID == ref {
			return t
		}
	}
	return nil
}

// Gap returns the gap with id, or nil.
func (p *Product) Gap(id string) *Gap {
	return find(p.Gaps, id, func(g *Gap) string { return g.ID })
}

// Tradeoff returns the tradeoff with id, or nil.
func (p *Product) Tradeoff(id string) *Tradeoff {
	return find(p.Tradeoffs, id, func(t *Tradeoff) string { return t.ID })
}

// Rank is a level's place in order: Draft is 0, Prototype 1, up to GA 4. An
// unknown level is -1.
func Rank(level string) int {
	if level == Draft {
		return 0
	}
	for i, l := range state.Levels {
		if l == level {
			return i + 1
		}
	}
	return -1
}
