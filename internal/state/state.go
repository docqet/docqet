// Package state holds the types of a project's state, state.json, as the
// spec's Index output describes them. It's docket's model: what index writes,
// what check validates, what apply sends, and what the server stores.
package state

// Version is the version of the state format this docket writes and reads.
const Version = "0.1"

// State is one project's state, indexed from its docs and annotations.
type State struct {
	Docket       string       `json:"docket"`
	Project      Ident        `json:"project"`
	Product      *Ident       `json:"product,omitempty"`
	Commit       string       `json:"commit"`
	IndexedAt    string       `json:"indexedAt"`
	Summary      Summary      `json:"summary"`
	Domains      []Domain     `json:"domains"`
	Features     []Feature    `json:"features"`
	Personas     []Persona    `json:"personas"`
	Initiatives  []Initiative `json:"initiatives"`
	Capabilities []Capability `json:"capabilities"`
	Rules        []Rule       `json:"rules"`
	Concepts     []Concept    `json:"concepts"`
	Mechanisms   []Mechanism  `json:"mechanisms"`
	Components   []Component  `json:"components"`
	Gaps         []Gap        `json:"gaps"`
	Tradeoffs    []Tradeoff   `json:"tradeoffs"`
	Problems     []Problem    `json:"problems"`
	Checklist    Checklist    `json:"checklist"`
}

// Ident is a project's or product's ID and name.
type Ident struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// Summary is the state at a glance.
type Summary struct {
	Domains      int             `json:"domains"`
	Features     int             `json:"features"`
	Personas     int             `json:"personas"`
	Initiatives  int             `json:"initiatives"`
	Capabilities CapabilityTally `json:"capabilities"`
	Rules        int             `json:"rules"`
	Gaps         int             `json:"gaps"`
	Problems     int             `json:"problems"`
	Tradeoffs    int             `json:"tradeoffs"`
	Mechanisms   int             `json:"mechanisms"`
	Components   int             `json:"components"`
}

// CapabilityTally is how many capabilities there are at each level, drafts
// among them.
type CapabilityTally struct {
	Draft     int `json:"draft"`
	Prototype int `json:"prototype"`
	Alpha     int `json:"alpha"`
	Beta      int `json:"beta"`
	GA        int `json:"ga"`
}

// Decision is an open question on a doc.
type Decision struct {
	Topic    *string  `json:"topic"`
	Question string   `json:"question"`
	Affects  []string `json:"affects"`
}

// Place is where an annotation is: its file, and the line it's on and that
// line's text.
type Place struct {
	File string `json:"file"`
	Line int    `json:"line"`
	Text string `json:"text"`
}

// Evidence is the places that verify or implement a doc.
type Evidence struct {
	Implements []Place `json:"implements"`
	Verifies   []Place `json:"verifies"`
}

// Domain is a domain doc.
type Domain struct {
	ID          string     `json:"id"`
	File        string     `json:"file"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Decisions   []Decision `json:"decisions"`
	Body        string     `json:"body"`
}

// Feature is a feature doc, in one domain.
type Feature struct {
	ID           string     `json:"id"`
	Domain       string     `json:"domain"`
	File         string     `json:"file"`
	Name         string     `json:"name"`
	Description  string     `json:"description"`
	Capabilities []string   `json:"capabilities"`
	Tradeoffs    []string   `json:"tradeoffs"`
	Decisions    []Decision `json:"decisions"`
	Body         string     `json:"body"`
}

// Capability is a capability doc, in one domain.
type Capability struct {
	ID          string     `json:"id"`
	Domain      string     `json:"domain"`
	File        string     `json:"file"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Stability   string     `json:"stability"`
	Feature     *string    `json:"feature"`
	Personas    []string   `json:"personas"`
	Initiatives []string   `json:"initiatives"`
	Rules       []string   `json:"rules"`
	Concepts    []string   `json:"concepts"`
	Gaps        []string   `json:"gaps"`
	Tradeoffs   []string   `json:"tradeoffs"`
	Decisions   []Decision `json:"decisions"`
	Evidence    Evidence   `json:"evidence"`
	Body        string     `json:"body"`
}

// Rule is a rule doc, in one domain.
type Rule struct {
	ID           string   `json:"id"`
	Domain       string   `json:"domain"`
	File         string   `json:"file"`
	Name         string   `json:"name"`
	Capabilities []string `json:"capabilities"`
	Concepts     []string `json:"concepts"`
	Why          *string  `json:"why"`
	Evidence     Evidence `json:"evidence"`
	Body         string   `json:"body"`
}

// Concept is a concept doc, in one domain.
type Concept struct {
	ID           string      `json:"id"`
	Domain       string      `json:"domain"`
	File         string      `json:"file"`
	Name         string      `json:"name"`
	Description  string      `json:"description"`
	Capabilities []string    `json:"capabilities"`
	Rules        []string    `json:"rules"`
	ConfusedWith []Confusion `json:"confusedWith"`
	Body         string      `json:"body"`
}

// Confusion is something a concept is easily mistaken for: another concept,
// or a term that isn't one.
type Confusion struct {
	Concept *string `json:"concept"`
	Term    *string `json:"term"`
	Summary string  `json:"summary"`
}

// Persona is a persona doc. Personas are in no domain.
type Persona struct {
	ID           string   `json:"id"`
	File         string   `json:"file"`
	Name         string   `json:"name"`
	Role         *string  `json:"role"`
	Title        *string  `json:"title"`
	Description  string   `json:"description"`
	Image        *string  `json:"image"`
	Capabilities []string `json:"capabilities"`
	Features     []string `json:"features"`
	Initiatives  []string `json:"initiatives"`
	Body         string   `json:"body"`
}

// Initiative is an initiative doc. Initiatives are in no domain.
type Initiative struct {
	ID           string   `json:"id"`
	File         string   `json:"file"`
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	Capabilities []string `json:"capabilities"`
	Features     []string `json:"features"`
	Personas     []string `json:"personas"`
	Body         string   `json:"body"`
}

// Mechanism is a mechanism doc. Its capabilities are worked out, not
// declared.
type Mechanism struct {
	ID           string     `json:"id"`
	File         string     `json:"file"`
	Name         string     `json:"name"`
	Description  string     `json:"description"`
	Applies      string     `json:"applies"`
	Capabilities []string   `json:"capabilities"`
	Meets        []string   `json:"meets"`
	Gaps         []string   `json:"gaps"`
	Tradeoffs    []string   `json:"tradeoffs"`
	Evidence     Evidence   `json:"evidence"`
	Decisions    []Decision `json:"decisions"`
	Body         string     `json:"body"`
}

// Component is a component doc.
type Component struct {
	ID           string     `json:"id"`
	File         string     `json:"file"`
	Name         string     `json:"name"`
	Description  string     `json:"description"`
	Capabilities []string   `json:"capabilities"`
	Meets        []string   `json:"meets"`
	Gaps         []string   `json:"gaps"`
	Tradeoffs    []string   `json:"tradeoffs"`
	Evidence     Evidence   `json:"evidence"`
	Decisions    []Decision `json:"decisions"`
	Body         string     `json:"body"`
}

// Gap is a gap declared on a capability, mechanism or component. Its ID is
// its doc's reference and its key: capability:room-booking#needs-a-mouse.
type Gap struct {
	ID          string   `json:"id"`
	Domain      string   `json:"domain,omitempty"`
	Affects     []string `json:"affects"`
	Impact      *string  `json:"impact"`
	Likelihood  *string  `json:"likelihood"`
	Reach       *string  `json:"reach"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Places      []Place  `json:"places"`
}

// Tradeoff is a tradeoff declared on a feature, capability, mechanism or
// component.
type Tradeoff struct {
	ID          string   `json:"id"`
	Domain      string   `json:"domain,omitempty"`
	Affects     []string `json:"affects"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Benefit     *string  `json:"benefit"`
	Drawback    string   `json:"drawback"`
	Places      []Place  `json:"places"`
}

// Problem is something wrong in the docs or annotations. A problem about a
// doc names it as its subject, with its domain. One found reading files, such
// as an annotation naming nothing, or frontmatter that isn't valid YAML, has
// no subject, and says where it is with File and Line instead.
type Problem struct {
	Type         string   `json:"type"`
	Subject      string   `json:"subject"`
	Capabilities []string `json:"capabilities"`
	Message      string   `json:"message"`
	Domain       string   `json:"domain,omitempty"`
	File         string   `json:"file,omitempty"`
	Line         int      `json:"line,omitempty"`
}

// The types of problem the spec defines.
const (
	UnknownID          = "unknown-id"
	InvalidFrontmatter = "invalid-frontmatter"
	DuplicateID        = "duplicate-id"
	BrokenLink         = "broken-link"
	UnlinkedRule       = "unlinked-rule"
	InTwoFeatures      = "in-two-features"
	Contradiction      = "contradiction"
	InvalidAnnotation  = "invalid-annotation"
	UnknownOutcome     = "unknown-outcome"
)

// Checklist is the stability checklist the project was indexed against.
type Checklist struct {
	Kinds     []Kind    `json:"kinds"`
	Qualities []Quality `json:"qualities"`
}

// Kind is a kind of software a checklist example can suit.
type Kind struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// Quality is one of the checklist's qualities, with its levels in order.
type Quality struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Question string  `json:"question"`
	Why      string  `json:"why"`
	Levels   []Level `json:"levels"`
}

// Level is what a quality expects at one stability level.
type Level struct {
	Level           string    `json:"level"`
	Summary         *string   `json:"summary"`
	Outcomes        []Outcome `json:"outcomes"`
	Implementation  []Example `json:"implementation"`
	Overengineering []Example `json:"overengineering"`
}

// Outcome is something that should be true of the work at a level. Its ID is
// its reference: outcome:<quality>/<level>/<id>.
type Outcome struct {
	ID              string    `json:"id"`
	Level           string    `json:"level"`
	Text            string    `json:"text"`
	Until           *string   `json:"until"`
	Implementation  []Example `json:"implementation"`
	Overengineering []Example `json:"overengineering"`
}

// Example illustrates meeting an outcome, or overengineering it.
type Example struct {
	Text  string   `json:"text"`
	Kinds []string `json:"kinds"`
}
