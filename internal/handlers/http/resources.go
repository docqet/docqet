package http

import "github.com/docqet/docqet/internal/state"

// The resources the UI, and any other tool or agent, reads about a product:
// each doc put together across the product's projects, with the figures
// derive works out for it, so a reader works nothing out itself. IDs are as
// combine keys them: a rule or concept is <id>@<domain>, and a gap or
// tradeoff is its declared ID with @<project>.
//
// Every product route is under /api/v1/products/{product}, and takes
// ?project=a,b, to show only some of its projects, and ?initiative=, to show
// only what's part of one. Every list is a bare JSON array, paged with
// ?page= and ?size=, with Link and X-Total-Count headers.
//
//	GET /products                                   []ProductResource
//	GET /products/{product}                         ProductResource
//	GET /products/{product}/status?for=             StatusResource
//	GET /products/{product}/projects                []ProductProjectResource
//	GET /products/{product}/rubric                  state.Rubric
//	GET /products/{product}/domains                 []DomainResource
//	GET /products/{product}/domains/{id}            DomainResource
//	GET /products/{product}/features                []FeatureResource
//	GET /products/{product}/features/{id}           FeatureResource
//	GET /products/{product}/capabilities?stability=&for=        []CapabilityResource
//	GET /products/{product}/capabilities/{id}                   CapabilityResource
//	GET /products/{product}/capabilities/{id}/gaps/{key}        GapResource
//	GET /products/{product}/rules                               []RuleResource
//	GET /products/{product}/domains/{domain}/rules/{id}         RuleResource
//	GET /products/{product}/concepts                            []ConceptResource
//	GET /products/{product}/domains/{domain}/concepts/{id}      ConceptResource
//	GET /products/{product}/personas                []PersonaResource
//	GET /products/{product}/personas/{id}           PersonaResource
//	GET /products/{product}/initiatives             []InitiativeResource
//	GET /products/{product}/initiatives/{id}        InitiativeResource
//	GET /products/{product}/mechanisms              []TechnicalResource
//	GET /products/{product}/mechanisms/{id}         TechnicalResource
//	GET /products/{product}/mechanisms/{id}/gaps/{key}          GapResource
//	GET /products/{product}/components              []TechnicalResource
//	GET /products/{product}/components/{id}         TechnicalResource
//	GET /products/{product}/components/{id}/gaps/{key}          GapResource
//	GET /products/{product}/gaps?for=&impact=&sort=risk         []GapResource
//	GET /products/{product}/tradeoffs               []TradeoffResource
//	GET /products/{product}/decisions               []HeldDecisionResource
//	GET /products/{product}/problems                []ProblemResource
//	GET /products/{product}/search?q=               []SearchResultResource
//
// ?for= is a reference, such as persona:front-desk-clerk, to a project,
// persona, initiative, domain, feature or capability, as the CLI's --for, or
// several separated by commas, for the capabilities they all
// share: a list or status then counts only those capabilities, and a gap's
// Within says what it puts at stake there.

// MaturityResource is a maturity: a whole percentage, and the level its band
// is named for (prototype, alpha, beta or ga). Null where there's none.
type MaturityResource struct {
	Percent int    `json:"percent"`
	Band    string `json:"band"`
}

// ExposureResource is what the gaps and rated decisions open on some
// capabilities put at stake together. Percent is unrounded, and null with nothing started. Band is
// low, minor, moderate or high.
type ExposureResource struct {
	Percent      *float64 `json:"percent"`
	Capabilities int      `json:"capabilities"`
	Band         *string  `json:"band"`
	Unacceptable bool     `json:"unacceptable"`
}

// RiskSummaryResource is what's at stake across some gaps: the highest score
// and its verdict, null with no gaps, and how many fall in each verdict
// (unacceptable, tolerable, acceptable).
type RiskSummaryResource struct {
	Score   *int           `json:"score"`
	Verdict *string        `json:"verdict"`
	Counts  map[string]int `json:"counts"`
	// Gaps is each gap, riskiest first, with its score there.
	Gaps []ScoredGapResource `json:"gaps"`
}

// ScoredGapResource is a gap's score among some capabilities: where it
// scores highest there, null where it doesn't show, and that score and
// verdict, 0 where it doesn't show.
type ScoredGapResource struct {
	Gap        string  `json:"gap"`
	Capability *string `json:"capability"`
	Score      int     `json:"score"`
	Verdict    string  `json:"verdict"`
}

// ReadinessResource is how ready people can rely on some capabilities being,
// with its improvements: what would raise it, most first. Percent is
// rounded and Band is Unready, Partial, Viable or Ready, both null with
// nothing started. Maturity is the capabilities' own, unrounded, weighted by
// level. Started is how many it's worked out from, and NotStarted the
// drafts, which never count.
type ReadinessResource struct {
	Percent      *int                  `json:"percent"`
	Band         *string               `json:"band"`
	Maturity     *float64              `json:"maturity"`
	Exposure     ExposureResource      `json:"exposure"`
	Levels       []string              `json:"levels"`
	Gaps         RiskSummaryResource   `json:"gaps"`
	Started      int                   `json:"started"`
	NotStarted   []string              `json:"notStarted"`
	Improvements []ImprovementResource `json:"improvements"`
}

// ImprovementResource is something that would raise a readiness: promoting
// a capability to its next level (Kind promote, with Capability, From and
// To), closing a gap (close, with Gap) or answering a rated decision
// (answer, with Decision). Capabilities is where it changes something among
// those counted. Readiness, Maturity and Exposure are what they'd be after
// it, unrounded, and Gain how much readiness it adds. Band is the quarter
// readiness would move into, null when it stays in the same one.
type ImprovementResource struct {
	Kind         string                `json:"kind"`
	Capability   *string               `json:"capability"`
	From         *string               `json:"from"`
	To           *string               `json:"to"`
	Gap          *string               `json:"gap"`
	Decision     *HeldDecisionResource `json:"decision"`
	Capabilities []string              `json:"capabilities"`
	Readiness    float64               `json:"readiness"`
	Maturity     float64               `json:"maturity"`
	Exposure     float64               `json:"exposure"`
	Gain         float64               `json:"gain"`
	Band         *string               `json:"band"`
}

// DecisionResource is an open decision. Impact, Likelihood and Reach rate
// what its answer could change, all null when it isn't rated.
type DecisionResource struct {
	Topic      *string  `json:"topic"`
	Question   string   `json:"question"`
	Affects    []string `json:"affects"`
	Impact     *string  `json:"impact"`
	Likelihood *string  `json:"likelihood"`
	Reach      *string  `json:"reach"`
}

// HeldDecisionResource is an open decision with the doc it's on, and its
// risk, scored on each capability it counts on: null when it isn't rated.
type HeldDecisionResource struct {
	DecisionResource
	// On is the doc it's on, as a reference: domain:, feature:, capability:,
	// mechanism: or component:.
	On   string        `json:"on"`
	Risk *RiskResource `json:"risk"`
}

// ConfusionResource is what a concept is easily mistaken for.
type ConfusionResource struct {
	Concept *string `json:"concept"`
	Term    *string `json:"term"`
	Summary string  `json:"summary"`
}

// ContributionResource is what one project says about a doc, in one domain.
type ContributionResource struct {
	Project      string              `json:"project"`
	Domain       string              `json:"domain"`
	File         string              `json:"file"`
	Name         string              `json:"name"`
	Description  string              `json:"description"`
	Body         string              `json:"body"`
	Role         *string             `json:"role,omitempty"`
	Title        *string             `json:"title,omitempty"`
	Decisions    []DecisionResource  `json:"decisions,omitempty"`
	Why          *string             `json:"why,omitempty"`
	ConfusedWith []ConfusionResource `json:"confusedWith,omitempty"`
}

// PlaceResource is where an annotation is, in which project's files.
type PlaceResource struct {
	Project string `json:"project"`
	File    string `json:"file"`
	Line    int    `json:"line"`
	Text    string `json:"text"`
}

// EvidenceResource is the places that implement or verify a doc.
type EvidenceResource struct {
	Implements []PlaceResource `json:"implements"`
	Verifies   []PlaceResource `json:"verifies"`
}

// DocResource is what every doc has: what its first contribution says, and
// every contribution.
type DocResource struct {
	ID          string                 `json:"id"`
	Project     string                 `json:"project"`
	Domain      string                 `json:"domain"`
	File        string                 `json:"file"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Body        string                 `json:"body"`
	From        []ContributionResource `json:"from"`
}

// ProductProjectResource is one of a product's projects, from its state,
// with its maturity from its own features alone.
type ProductProjectResource struct {
	ID        string            `json:"id"`
	Name      string            `json:"name"`
	Product   state.Ident       `json:"product"`
	Commit    string            `json:"commit"`
	IndexedAt string            `json:"indexedAt"`
	Maturity  *MaturityResource `json:"maturity"`
}

// ProductResource is a product: its projects, and the maturity of what's
// showing.
type ProductResource struct {
	ID       string                   `json:"id"`
	Name     string                   `json:"name"`
	Projects []ProductProjectResource `json:"projects"`
	Maturity *MaturityResource        `json:"maturity"`
}

// CountsResource is how many of each there are, showing.
type CountsResource struct {
	Domains      int            `json:"domains"`
	Features     int            `json:"features"`
	Capabilities map[string]int `json:"capabilities"` // by level: draft, prototype, alpha, beta, ga
	Rules        int            `json:"rules"`
	Concepts     int            `json:"concepts"`
	Personas     int            `json:"personas"`
	Initiatives  int            `json:"initiatives"`
	Mechanisms   int            `json:"mechanisms"`
	Components   int            `json:"components"`
	Gaps         int            `json:"gaps"`
	Tradeoffs    int            `json:"tradeoffs"`
	Decisions    int            `json:"decisions"`
	Problems     int            `json:"problems"`
}

// StatusResource is the product at a glance, or what serves a ?for=:
// maturity (the product's, band-weighted, or with ?for= that of its
// capabilities), readiness and exposure, every gap's risk there, and counts,
// which are always the product's, as shown, whatever ?for= names.
type StatusResource struct {
	Maturity  *MaturityResource   `json:"maturity"`
	Readiness ReadinessResource   `json:"readiness"`
	Exposure  ExposureResource    `json:"exposure"`
	Risk      RiskSummaryResource `json:"risk"`
	Counts    CountsResource      `json:"counts"`
}

// DomainResource is a domain, with its maturity from its parts of features,
// and the readiness and exposure of every capability with a part in it.
type DomainResource struct {
	DocResource
	Features     []string          `json:"features"`
	Capabilities []string          `json:"capabilities"`
	Maturity     *MaturityResource `json:"maturity"`
	Readiness    ReadinessResource `json:"readiness"`
	Exposure     ExposureResource  `json:"exposure"`
}

// PartResource is one domain's part of a feature.
type PartResource struct {
	Domain       string            `json:"domain"`
	Capabilities []string          `json:"capabilities"`
	Maturity     *MaturityResource `json:"maturity"`
}

// FeatureResource is a feature, with its parts and figures.
type FeatureResource struct {
	DocResource
	Capabilities []string          `json:"capabilities"`
	Tradeoffs    []string          `json:"tradeoffs"`
	Parts        []PartResource    `json:"parts"`
	Maturity     *MaturityResource `json:"maturity"`
	Readiness    ReadinessResource `json:"readiness"`
	Exposure     ExposureResource  `json:"exposure"`
}

// LevelResource is a capability's level in one domain that builds it.
type LevelResource struct {
	Project string `json:"project"`
	Domain  string `json:"domain"`
	Level   string `json:"level"`
}

// TechnicalGapResource is a gap on a mechanism or component a capability is
// built on.
type TechnicalGapResource struct {
	Gap string `json:"gap"`
	On  string `json:"on"` // mechanism:<id> or component:<id>
}

// OpenResource is what's open on a capability: its open decisions, its own
// gaps, and the gaps on what it's built on.
type OpenResource struct {
	Decisions []DecisionResource     `json:"decisions"`
	Gaps      []string               `json:"gaps"`
	Technical []TechnicalGapResource `json:"technical"`
}

// OutcomeStandingResource is how a capability stands on one of the rubric's
// expected outcomes: not-expected, gap, tradeoff, open, evidence or trust,
// with what says so.
type OutcomeStandingResource struct {
	Outcome   string             `json:"outcome"`
	Standing  string             `json:"standing"`
	Gaps      []string           `json:"gaps"`
	Tradeoffs []string           `json:"tradeoffs"`
	Decisions []DecisionResource `json:"decisions"`
	By        []string           `json:"by"` // the mechanisms and components that meet it
}

// CapabilityResource is a capability, with its figures, what's open on it,
// and how it stands on each rule it follows and each expected outcome.
type CapabilityResource struct {
	DocResource
	Personas    []string         `json:"personas"`
	Initiatives []string         `json:"initiatives"`
	Stability   string           `json:"stability"` // its level in short, or draft
	Levels      []LevelResource  `json:"levels"`
	Feature     *string          `json:"feature"`
	Rules       []string         `json:"rules"`
	Concepts    []string         `json:"concepts"`
	Gaps        []string         `json:"gaps"`
	Tradeoffs   []string         `json:"tradeoffs"`
	BuiltBy     []string         `json:"builtBy"`
	Evidence    EvidenceResource `json:"evidence"`

	Readiness ReadinessResource `json:"readiness"`
	Exposure  ExposureResource  `json:"exposure"`
	// Risk is across its gaps, its own and those of what it's built on.
	Risk RiskSummaryResource `json:"risk"`
	Open OpenResource        `json:"open"`
	// RuleStandings is how it stands on each rule it follows: gap, evidence
	// or trust, by the rule's ID.
	RuleStandings map[string]string         `json:"ruleStandings"`
	Outcomes      []OutcomeStandingResource `json:"outcomes"`
}

// RuleResource is a rule, with how each capability that follows it stands
// on it.
type RuleResource struct {
	DocResource
	Capabilities []string          `json:"capabilities"`
	Concepts     []string          `json:"concepts"`
	Gaps         []string          `json:"gaps"`
	Evidence     EvidenceResource  `json:"evidence"`
	Standings    map[string]string `json:"standings"` // by capability ID
}

// ConceptResource is a concept.
type ConceptResource struct {
	DocResource
	Capabilities []string `json:"capabilities"`
	Rules        []string `json:"rules"`
}

// PersonaResource is a persona, with the figures of what serves them.
type PersonaResource struct {
	DocResource
	Role         *string           `json:"role"`
	Title        *string           `json:"title"`
	Image        *string           `json:"image"`
	Capabilities []string          `json:"capabilities"`
	Features     []string          `json:"features"`
	Initiatives  []string          `json:"initiatives"`
	Maturity     *MaturityResource `json:"maturity"`
	Readiness    ReadinessResource `json:"readiness"`
	Exposure     ExposureResource  `json:"exposure"`
}

// InitiativeResource is an initiative, with the figures of its
// capabilities.
type InitiativeResource struct {
	DocResource
	Capabilities []string          `json:"capabilities"`
	Features     []string          `json:"features"`
	Personas     []string          `json:"personas"`
	Maturity     *MaturityResource `json:"maturity"`
	Readiness    ReadinessResource `json:"readiness"`
	Exposure     ExposureResource  `json:"exposure"`
}

// TechnicalResource is a mechanism or a component, with what's at stake in
// its gaps.
type TechnicalResource struct {
	DocResource
	Kind         string              `json:"kind"`    // mechanism or component
	Applies      string              `json:"applies"` // project or product
	Capabilities []string            `json:"capabilities"`
	Meets        []string            `json:"meets"`
	Gaps         []string            `json:"gaps"`
	Tradeoffs    []string            `json:"tradeoffs"`
	Evidence     EvidenceResource    `json:"evidence"`
	Risk         RiskSummaryResource `json:"risk"`
}

// RiskOnResource is how a gap scores on one capability, and why.
type RiskOnResource struct {
	Capability  string  `json:"capability"`
	Impact      float64 `json:"impact"`
	Likelihood  float64 `json:"likelihood"`
	Reach       float64 `json:"reach"`
	Weight      float64 `json:"weight"`
	Claim       bool    `json:"claim"`
	ClaimFactor float64 `json:"claimFactor"`
	Raw         float64 `json:"raw"`
	Score       int     `json:"score"`
}

// SpreadResource is how many capabilities a gap has one score on.
type SpreadResource struct {
	Score        int `json:"score"`
	Capabilities int `json:"capabilities"`
}

// RiskResource is what's at stake in leaving a gap, or a rated decision,
// open, on every capability it shows on. Score is 0 where it shows on none.
type RiskResource struct {
	Score        int              `json:"score"`
	Verdict      string           `json:"verdict"`
	Claim        bool             `json:"claim"`
	Capabilities int              `json:"capabilities"`
	Spread       []SpreadResource `json:"spread"`
	On           []RiskOnResource `json:"on"`
}

// AffectedResource is one thing a gap, tradeoff or decision affects: an
// expected outcome (with its quality), a rule, a gap or a tradeoff, by Kind,
// by reference.
type AffectedResource struct {
	Kind    string  `json:"kind"`
	Ref     string  `json:"ref"`
	Quality *string `json:"quality,omitempty"`
}

// GapResource is a gap, with its risk, what it affects, and the open
// decisions that affect it. Subject is the doc it's on, as a reference.
type GapResource struct {
	ID          string                 `json:"id"`
	Subject     string                 `json:"subject"`
	Project     string                 `json:"project"`
	Domain      string                 `json:"domain"`
	Affects     []string               `json:"affects"`
	Impact      string                 `json:"impact"`
	Likelihood  string                 `json:"likelihood"`
	Reach       string                 `json:"reach"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Places      []PlaceResource        `json:"places"`
	Risk        RiskResource           `json:"risk"`
	Affected    []AffectedResource     `json:"affected"`
	Decisions   []HeldDecisionResource `json:"decisions"`
	// Within is its score among the capabilities ?for= names, on a list read
	// with one, and null otherwise.
	Within *ScoredGapResource `json:"within"`
}

// TradeoffResource is a tradeoff, with what it affects and the open
// decisions that affect it.
type TradeoffResource struct {
	ID          string                 `json:"id"`
	Subject     string                 `json:"subject"`
	Project     string                 `json:"project"`
	Domain      string                 `json:"domain"`
	Affects     []string               `json:"affects"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Benefit     *string                `json:"benefit"`
	Drawback    string                 `json:"drawback"`
	Places      []PlaceResource        `json:"places"`
	Affected    []AffectedResource     `json:"affected"`
	Decisions   []HeldDecisionResource `json:"decisions"`
}

// ProblemResource is something wrong in the docs, as state's problems are,
// with combining's added.
type ProblemResource struct {
	Type         string   `json:"type"`
	Subject      string   `json:"subject"`
	Capabilities []string `json:"capabilities"`
	Message      string   `json:"message"`
	Domain       string   `json:"domain,omitempty"`
	File         string   `json:"file,omitempty"`
	Line         int      `json:"line,omitempty"`
}

// SearchResultResource is a doc that matches a search, best first: its kind
// (project, domain, feature, capability, rule, concept, persona or
// initiative), ID and name, and where it matched.
type SearchResultResource struct {
	Kind        string `json:"kind"`
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	// Match is where it matched: name, description or body.
	Match string `json:"match"`
}
