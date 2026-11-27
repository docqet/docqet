// Package combine puts the states of a product's projects together as one
// picture, as the product concept's Combining section describes: each doc
// once, with every project's contribution to it, links resolved across
// projects, reverse links worked out again, and the findings only the
// product shows. It's pure: what it returns depends only on the states it's
// given. What's derived from the result, such as maturity and risk, is
// derive's.
package combine

import "github.com/docqet/docqet/internal/state"

// Draft is the level a draft capability has: declared, not started. It ranks
// below every stability level.
const Draft = "draft"

// Product is the states of the projects being shown, put together. IDs are
// as the UI's combining keys them: every doc keeps its own ID, one across the
// product; a gap or tradeoff is its declared ID with @<project>, such as
// capability:room-booking#no-waitlist@hotel-bookings, since its key is its
// project's.
type Product struct {
	ID       string
	Name     string
	Projects []Project

	Areas        []*Area
	Features     []*Feature
	Capabilities []*Capability
	Rules        []*Rule
	Concepts     []*Concept
	Personas     []*Persona
	Problems     []*Problem
	Constraints  []*Constraint
	Initiatives  []*Initiative
	Mechanisms   []*Technical
	Components   []*Technical
	Archetypes   []*Archetype
	Gaps         []*Gap
	Tradeoffs    []*Tradeoff
	Findings     []state.Finding

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

// Contribution is what one project says about a doc.
type Contribution struct {
	Project     string
	File        string
	Name        string
	Description string
	Body        string

	Role   *string // a persona's
	Title  *string // a persona's
	Cost   *string // a problem's
	Source *string // a constraint's

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

// Area is a grouping of features. Its features are those that name it, by
// name.
type Area struct {
	Doc
	Features []string
}

// Feature is a part of what the product offers. Area is the area it names,
// the first project's where projects differ. Its capabilities are those that
// name it, by name.
type Feature struct {
	Doc
	Area         *string
	Capabilities []string
	Tradeoffs    []string
}

// LevelIn is a capability's level in one project that writes it. Level is a
// stability level, or Draft.
type LevelIn struct {
	Project string
	Level   string
}

// Capability is something the product can do, written in one or more
// projects. Its personas are those of the problems it solves.
type Capability struct {
	Doc
	Solves      []string
	Personas    []string
	Initiatives []string
	// Stability is its level in short: the lowest of Levels, Draft lowest of
	// all.
	Stability string
	Levels    []LevelIn
	Feature   *string // the feature it names, the first project's where they differ, or nil
	Rules     []string
	Respects  []string // the constraints it respects itself
	Concepts  []string
	Gaps      []string
	Tradeoffs []string
	// BuiltBy is the mechanisms that apply to it and the components that list
	// it, as mechanism:<id> or component:<id>.
	BuiltBy []string
	// Archetypes is the archetypes of the components that list it: what
	// kinds of thing build it, such as a CLI and a service.
	Archetypes []string
	Evidence   Evidence
}

// Rule is something the software promises always or never holds.
type Rule struct {
	Doc
	Capabilities []string // every capability that follows it
	Concepts     []string
	Respects     []string // the constraints it respects
	Gaps         []string // the gaps that affect it
	Evidence     Evidence
}

// Concept is what a word means.
type Concept struct {
	Doc
	Capabilities []string
	Rules        []string
}

// Persona is a type of person the product serves.
type Persona struct {
	Doc
	Role         *string
	Title        *string
	Image        *string
	Problems     []string // every problem that names it
	Capabilities []string // every capability that serves it
	Features     []string // the features those are in
	Initiatives  []string // every initiative that names them
}

// Problem is a pain point the personas it names share.
type Problem struct {
	Doc
	Cost         *string
	Personas     []string
	SubjectTo    []string // the constraints it names as bounding it
	Capabilities []string // every capability that solves it
}

// Constraint is something imposed from outside that any solution must
// respect.
type Constraint struct {
	Doc
	Source *string
	// Applies is "product" or "project" when it applies to every problem in
	// its product, or in the projects in AppliesIn, and "" when it applies to
	// the problems subject to it.
	Applies   string
	AppliesIn []string
	Problems  []string // every problem subject to it
	// What respects it: rules, mechanisms, capabilities and components.
	Rules        []string
	Mechanisms   []string
	Capabilities []string
	Components   []string
	Gaps         []string // the gaps that affect it
	Evidence     Evidence // places that verify it
}

// Initiative is a body of work.
type Initiative struct {
	Doc
	Capabilities []string // every capability that lists it
	Features     []string // the features those are in
	Personas     []string // the personas it names
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
	Applies  string
	Respects []string // the constraints it respects
	// Within, Is and Archetype are a component's: the bigger component it's
	// within, the archetype it says it is, and the archetype it is, its own
	// or else the nearest bigger component's. Each is an ID, or "". Parts is
	// the components within it.
	Within       string
	Is           string
	Archetype    string
	Parts        []string
	Capabilities []string
	Meets        []string
	Gaps         []string
	Tradeoffs    []string
	Evidence     Evidence
}

// Archetype is a kind of thing components are, as the product defines it.
type Archetype struct {
	Doc
	Components   []string // every component that is it, through a bigger one too
	Capabilities []string // every capability those components serve
}

// Gap is a known gap, with the project that declares it. A rule it affects
// that isn't there is left out.
type Gap struct {
	ID          string
	Project     string
	Affects     []string
	Impact      string
	Likelihood  string
	Reach       string
	Name        string
	Description string
	Places      []Place
}

// Tradeoff is a tradeoff, with the project that declares it.
type Tradeoff struct {
	ID          string
	Project     string
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

// Area returns the area with id, or nil.
func (p *Product) Area(id string) *Area {
	return find(p.Areas, id, func(a *Area) string { return a.ID })
}

// Feature returns the feature with id, or nil.
func (p *Product) Feature(id string) *Feature {
	return find(p.Features, id, func(f *Feature) string { return f.ID })
}

// Capability returns the capability with id, or nil.
func (p *Product) Capability(id string) *Capability {
	return find(p.Capabilities, id, func(c *Capability) string { return c.ID })
}

// Problem returns the problem with id, or nil.
func (p *Product) Problem(id string) *Problem {
	return find(p.Problems, id, func(pr *Problem) string { return pr.ID })
}

// Constraint returns the constraint with id, or nil.
func (p *Product) Constraint(id string) *Constraint {
	return find(p.Constraints, id, func(cn *Constraint) string { return cn.ID })
}

// Rule returns the rule with id, or nil.
func (p *Product) Rule(key string) *Rule {
	return find(p.Rules, key, func(r *Rule) string { return r.ID })
}

// Concept returns the concept with id, or nil.
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

// Archetype returns the archetype with id, or nil.
func (p *Product) Archetype(id string) *Archetype {
	return find(p.Archetypes, id, func(a *Archetype) string { return a.ID })
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
