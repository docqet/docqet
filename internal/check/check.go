// Package check finds the findings a project's state shows on its own, such
// as a link to a doc that doesn't exist or a rule no capability follows. It
// reads only the state, never files, so the CLI and the server run the same
// check: index runs it on what it reads, and the server runs it again on
// every state it's sent.
//
// Findings only files show, such as frontmatter that isn't YAML, an
// annotation naming nothing, or a broken link in a body, are found by index,
// and have no subject: see Recheckable.
package check

import (
	"fmt"
	"slices"
	"strings"

	"github.com/docqet/docqet/internal/state"
)

// Recheckable reports whether p is a finding Check finds, and so one the
// server works out again rather than taking from what it's sent. Every
// finding about a doc is; those found reading files aren't about one.
func Recheckable(p state.Finding) bool {
	return p.Subject != ""
}

// Check returns every finding st shows on its own, in the order of its docs.
// docqet:implements capability:checking component:check
func Check(st *state.State) []state.Finding {
	c := newChecker(st)
	c.areas()
	c.features()
	c.capabilities()
	c.rules()
	c.concepts()
	c.personas()
	c.problems()
	c.constraints()
	c.initiatives()
	c.mechanisms()
	c.components()
	c.archetypes()
	c.gaps()
	c.tradeoffs()
	c.duplicates()
	return c.findings
}

type checker struct {
	st       *state.State
	findings []state.Finding
	outcome  map[string]bool
}

func newChecker(st *state.State) *checker {
	c := &checker{st: st, outcome: map[string]bool{}}
	for _, q := range st.Rubric.Qualities {
		for _, l := range q.Levels {
			for _, o := range l.Outcomes {
				c.outcome[o.ID] = true
			}
		}
	}
	return c
}

// subject is what a finding is about.
type subject struct {
	ref, file    string
	capabilities []string
}

func (c *checker) add(typ string, s subject, format string, args ...any) {
	caps := s.capabilities
	if caps == nil {
		caps = []string{}
	}
	c.findings = append(c.findings, state.Finding{
		Type: typ, Subject: s.ref, Capabilities: caps, Message: fmt.Sprintf(format, args...),
		File: s.file,
	})
}

func (c *checker) areas() {
	for _, a := range c.st.Areas {
		s := subject{ref: state.DocRef(state.TypeArea, a.ID), file: a.File}
		c.common(s, a.ID, a.Name, a.Description, true)
		c.decisions(s, a.Decisions)
	}
}

func (c *checker) features() {
	for _, f := range c.st.Features {
		s := subject{ref: state.DocRef(state.TypeFeature, f.ID), file: f.File}
		c.common(s, f.ID, f.Name, f.Description, true)
		c.link(s, "within", f.Area, state.TypeArea)
		c.decisions(s, f.Decisions)
	}
}

func (c *checker) capabilities() {
	for _, cp := range c.st.Capabilities {
		ref := state.DocRef(state.TypeCapability, cp.ID)
		s := subject{ref: ref, file: cp.File, capabilities: []string{ref}}
		c.common(s, cp.ID, cp.Name, cp.Description, true)
		switch cp.Stability {
		case "draft", "prototype", "alpha", "beta", "ga":
		case "":
			c.add(state.InvalidFrontmatter, s, "A capability has a stability: draft, prototype, alpha, beta or ga.")
		default:
			c.add(state.InvalidFrontmatter, s, "stability is %q: it's draft, prototype, alpha, beta or ga.", cp.Stability)
		}
		c.link(s, "within", cp.Feature, state.TypeFeature)
		c.links(s, "solves", cp.Solves, state.TypeProblem)
		c.links(s, "included-in", cp.Initiatives, state.TypeInitiative)
		c.links(s, "follows", cp.Rules, state.TypeRule)
		c.links(s, "uses", cp.Concepts, state.TypeConcept)
		c.decisions(s, cp.Decisions)
	}

	// Why a capability exists is the problems it solves.
	for _, cp := range c.st.Capabilities {
		if len(cp.Solves) > 0 {
			continue
		}
		ref := state.DocRef(state.TypeCapability, cp.ID)
		c.add(state.SolvesNoProblem, subject{ref: ref, file: cp.File, capabilities: []string{ref}},
			"It solves no problem yet: link the problems it solves with solves.")
	}
}

func (c *checker) rules() {
	for _, r := range c.st.Rules {
		ref := state.DocRef(state.TypeRule, r.ID)
		followers := c.followers(r)
		s := subject{ref: ref, file: r.File, capabilities: followers}
		c.common(s, r.ID, r.Name, "", false)
		c.links(s, "uses", r.Concepts, state.TypeConcept)
		c.links(s, "respects", r.Respects, state.TypeConstraint)
		if len(followers) == 0 {
			c.add(state.UnlinkedRule, s, "No capability follows this rule.")
		}
	}
}

// followers is the capabilities that follow r.
func (c *checker) followers(r state.Rule) []string {
	var out []string
	for _, cp := range c.st.Capabilities {
		for _, raw := range cp.Rules {
			ref, ok := state.ParseRef(raw)
			if !ok || ref.Type != state.TypeRule || ref.ID != r.ID {
				continue
			}
			if !slices.Contains(out, state.DocRef(state.TypeCapability, cp.ID)) {
				out = append(out, state.DocRef(state.TypeCapability, cp.ID))
			}
		}
	}
	return out
}

func (c *checker) concepts() {
	for _, cn := range c.st.Concepts {
		s := subject{ref: state.DocRef(state.TypeConcept, cn.ID), file: cn.File}
		c.common(s, cn.ID, cn.Name, cn.Description, true)
		for _, cw := range cn.ConfusedWith {
			switch {
			case (cw.Concept == nil) == (cw.Term == nil):
				c.add(state.InvalidFrontmatter, s, "Each confused-with names either a concept or a term.")
			case cw.Concept != nil:
				c.links(s, "confused-with", []string{*cw.Concept}, state.TypeConcept)
			}
			if cw.Summary == "" {
				c.add(state.InvalidFrontmatter, s, "Each confused-with has a summary saying how they differ.")
			}
		}
	}
}

func (c *checker) personas() {
	for _, p := range c.st.Personas {
		s := subject{ref: state.DocRef(state.TypePersona, p.ID), file: p.File}
		c.common(s, p.ID, p.Name, p.Description, true)
	}
}

func (c *checker) problems() {
	for _, pr := range c.st.Problems {
		s := subject{ref: state.DocRef(state.TypeProblem, pr.ID), file: pr.File}
		c.common(s, pr.ID, pr.Name, pr.Description, true)
		if len(pr.Personas) == 0 {
			c.add(state.InvalidFrontmatter, s, "A problem names the personas who have it.")
		}
		c.links(s, "felt-by", pr.Personas, state.TypePersona)
	}
}

// constraints checks each constraint, and reports one nothing respects:
// why it was written down is a rule or mechanism keeping to it.
func (c *checker) constraints() {
	for _, cn := range c.st.Constraints {
		ref := state.DocRef(state.TypeConstraint, cn.ID)
		s := subject{ref: ref, file: cn.File}
		c.common(s, cn.ID, cn.Name, cn.Description, true)
		if len(cn.Rules) == 0 && len(cn.Mechanisms) == 0 {
			c.add(state.RespectedByNothing, s, "No rule or mechanism respects it yet: link it from those that do with respects.")
		}
	}
}

func (c *checker) initiatives() {
	for _, in := range c.st.Initiatives {
		s := subject{ref: state.DocRef(state.TypeInitiative, in.ID), file: in.File}
		c.common(s, in.ID, in.Name, in.Description, true)
		c.links(s, "for", in.Personas, state.TypePersona)
	}
}

func (c *checker) mechanisms() {
	for _, m := range c.st.Mechanisms {
		s := subject{ref: state.DocRef(state.TypeMechanism, m.ID), file: m.File}
		c.common(s, m.ID, m.Name, m.Description, true)
		c.links(s, "respects", m.Respects, state.TypeConstraint)
		if m.Applies != "project" && m.Applies != "product" {
			c.add(state.InvalidFrontmatter, s, "applies is %q: it's project or product.", m.Applies)
		}
		c.outcomes(s, "meets", m.Meets)
		c.decisions(s, m.Decisions)
	}
}

func (c *checker) components() {
	for _, cp := range c.st.Components {
		s := subject{ref: state.DocRef(state.TypeComponent, cp.ID), file: cp.File}
		c.common(s, cp.ID, cp.Name, cp.Description, true)
		c.link(s, "within", cp.Within, state.TypeComponent)
		c.link(s, "is", cp.Is, state.TypeArchetype)
		c.links(s, "serves", cp.Capabilities, state.TypeCapability)
		c.outcomes(s, "meets", cp.Meets)
		c.decisions(s, cp.Decisions)
		if c.withinItself(cp.ID) {
			c.add(state.InvalidFrontmatter, s, "It's within itself, through within: a component is within one bigger component, and never its own parts.")
		}
	}
}

// withinItself reports whether following within from the component with id
// comes back to it.
func (c *checker) withinItself(id string) bool {
	parent := map[string]string{}
	for _, cp := range c.st.Components {
		if cp.Within == nil {
			continue
		}
		if ref, ok := state.ParseRef(*cp.Within); ok && ref.Type == state.TypeComponent {
			parent[cp.ID] = ref.ID
		}
	}
	seen := map[string]bool{}
	for at, ok := parent[id]; ok && !seen[at]; at, ok = parent[at] {
		if at == id {
			return true
		}
		seen[at] = true
	}
	return false
}

// archetypes checks each archetype. One no component is isn't a finding: a
// project can name its kinds of component before it writes their docs.
func (c *checker) archetypes() {
	for _, a := range c.st.Archetypes {
		c.common(subject{ref: state.DocRef(state.TypeArchetype, a.ID), file: a.File}, a.ID, a.Name, a.Description, true)
	}
}

func (c *checker) gaps() {
	for _, g := range c.st.Gaps {
		s := c.entrySubject(g.ID)
		if g.Name == "" {
			c.add(state.InvalidFrontmatter, s, "A gap has a name.")
		}
		if g.Description == "" {
			c.add(state.InvalidFrontmatter, s, "A gap has a description.")
		}
		c.oneOf(s, "impact", g.Impact, "negligible", "inconvenient", "blocking", "damaging")
		c.oneOf(s, "likelihood", g.Likelihood, "certain", "expected", "possible", "unlikely")
		c.oneOf(s, "reach", g.Reach, "all", "most", "some", "few")
		for _, raw := range g.Affects {
			if state.IsOutcomeRef(raw) {
				c.outcomes(s, "affects", []string{raw})
				continue
			}
			ref, ok := state.ParseRef(raw)
			if !ok || ref.Type != state.TypeRule || ref.Key != "" {
				c.add(state.InvalidFrontmatter, s, "A gap affects outcomes and rules, not %s.", raw)
				continue
			}
			c.links(s, "affects", []string{raw}, state.TypeRule)
		}
	}
}

func (c *checker) tradeoffs() {
	for _, t := range c.st.Tradeoffs {
		s := c.entrySubject(t.ID)
		if t.Name == "" {
			c.add(state.InvalidFrontmatter, s, "A tradeoff has a name.")
		}
		if t.Description == "" {
			c.add(state.InvalidFrontmatter, s, "A tradeoff has a description.")
		}
		if t.Drawback == "" {
			c.add(state.InvalidFrontmatter, s, "A tradeoff has a drawback.")
		}
		for _, raw := range t.Affects {
			if state.IsOutcomeRef(raw) {
				c.outcomes(s, "affects", []string{raw})
				continue
			}
			if ref, ok := state.ParseRef(raw); ok && ref.Type == state.TypeRule {
				c.add(state.InvalidFrontmatter, s, "A tradeoff can't affect a rule (%s): not holding one isn't a choice, so it's a gap.", raw)
				continue
			}
			c.add(state.InvalidFrontmatter, s, "A tradeoff affects outcomes, not %s.", raw)
		}
	}
}

// entrySubject is a gap or tradeoff as a finding's subject, with the doc it's
// on.
func (c *checker) entrySubject(id string) subject {
	s := subject{ref: id}
	doc, _, _ := strings.Cut(id, "#")
	if ref, ok := state.ParseRef(doc); ok {
		s.file = c.fileOf(ref.Type, ref.ID)
		if ref.Type == state.TypeCapability {
			s.capabilities = []string{doc}
		}
	}
	return s
}

func (c *checker) decisions(s subject, ds []state.Decision) {
	for _, d := range ds {
		if d.Question == "" {
			c.add(state.InvalidFrontmatter, s, "A decision has a question.")
		}
		c.decisionRatings(s, d)
		for _, raw := range d.Affects {
			if state.IsOutcomeRef(raw) {
				c.outcomes(s, "affects", []string{raw})
				continue
			}
			ref, ok := state.ParseRef(raw)
			if !ok || ref.Key == "" {
				c.add(state.InvalidFrontmatter, s, "A decision affects outcomes, gaps and tradeoffs, not %s.", raw)
				continue
			}
			id := state.DocRef(ref.Type, ref.ID) + "#" + ref.Key
			exists := slices.ContainsFunc(c.st.Gaps, func(g state.Gap) bool { return g.ID == id }) ||
				slices.ContainsFunc(c.st.Tradeoffs, func(t state.Tradeoff) bool { return t.ID == id })
			if !exists {
				c.add(state.UnknownID, s, "A decision affects %s, which doesn't exist.", raw)
			}
		}
	}
}

// decisionRatings checks a decision is rated with all three of impact,
// likelihood and reach, each one of a gap's values, or with none.
func (c *checker) decisionRatings(s subject, d state.Decision) {
	ratings := []struct {
		field   string
		value   *string
		allowed []string
	}{
		{"impact", d.Impact, []string{"negligible", "inconvenient", "blocking", "damaging"}},
		{"likelihood", d.Likelihood, []string{"certain", "expected", "possible", "unlikely"}},
		{"reach", d.Reach, []string{"all", "most", "some", "few"}},
	}
	var missing []string
	for _, r := range ratings {
		switch {
		case r.value == nil:
			missing = append(missing, r.field)
		case !slices.Contains(r.allowed, *r.value):
			c.add(state.InvalidFrontmatter, s, "A decision's %s is %q: it's %s.", r.field, *r.value, strings.Join(r.allowed, ", "))
		}
	}
	if len(missing) > 0 && len(missing) < len(ratings) {
		c.add(state.InvalidFrontmatter, s, "A decision is rated with all of impact, likelihood and reach, or none: this one has no %s.", strings.Join(missing, " or "))
	}
}

// common checks what every doc has: a kebab-case ID, a name and, but for a
// rule, a description.
func (c *checker) common(s subject, id, name, description string, wantsDescription bool) {
	if !state.IsKebab(id) {
		c.add(state.InvalidFrontmatter, s, "id is %q: IDs are kebab case, lowercase words joined by hyphens.", id)
	}
	if name == "" {
		c.add(state.InvalidFrontmatter, s, "A doc has a name.")
	}
	if wantsDescription && description == "" {
		c.add(state.InvalidFrontmatter, s, "A doc has a description.")
	}
}

// link checks a single link, such as a capability's feature, as links does.
func (c *checker) link(s subject, field string, ref *string, typ string) {
	if ref != nil {
		c.links(s, field, []string{*ref}, typ)
	}
}

// links checks each link in field is a reference to a doc of type typ that
// exists. Every doc's ID is one across the project, rules and concepts too,
// so a link names no domain.
// docqet:implements rule:product-never-names-implementation
func (c *checker) links(s subject, field string, refs []string, typ string) {
	for _, raw := range refs {
		ref, ok := state.ParseRef(raw)
		if !ok || ref.Key != "" {
			c.add(state.InvalidFrontmatter, s, "%s lists %q, which isn't a reference to a %s: it's %s:<id>.", field, raw, typ, typ)
			continue
		}
		if ref.Type != typ {
			c.add(state.InvalidFrontmatter, s, "%s lists %s, which is a %s: it lists %ss.", field, raw, ref.Type, typ)
			continue
		}
		if ref.Domain != "" {
			c.add(state.InvalidFrontmatter, s, "%s lists %s: rules and concepts have no domain now: write %s.", field, raw, state.DocRef(ref.Type, ref.ID))
			continue
		}
		if !c.exists(typ, ref.ID) {
			msg := "%s lists %s, which doesn't exist."
			if c.st.Product != nil {
				msg = "%s lists %s, which this project doesn't define. It may be defined in another project in the product."
			}
			c.add(state.UnknownID, s, msg, field, raw)
		}
	}
}

func (c *checker) outcomes(s subject, field string, refs []string) {
	for _, raw := range refs {
		if !state.IsOutcomeRef(raw) {
			c.add(state.InvalidFrontmatter, s, "%s lists %s, which isn't an outcome: it's outcome:<quality>/<level>/<id>.", field, raw)
			continue
		}
		if !c.outcome[raw] {
			c.add(state.UnknownOutcome, s, "%s lists %s, which isn't an outcome in the rubric.", field, raw)
		}
	}
}

// oneOf checks a field every gap has is one of allowed.
func (c *checker) oneOf(s subject, field, value string, allowed ...string) {
	switch {
	case value == "":
		c.add(state.InvalidFrontmatter, s, "A gap needs %s: it's %s.", field, strings.Join(allowed, ", "))
	case !slices.Contains(allowed, value):
		c.add(state.InvalidFrontmatter, s, "%s is %q: it's %s.", field, value, strings.Join(allowed, ", "))
	}
}

// exists reports whether the project has a doc of type typ with id.
func (c *checker) exists(typ, id string) bool {
	return c.fileOf(typ, id) != ""
}

// fileOf is the file of the doc of type typ with id, or "" when there's none.
func (c *checker) fileOf(typ, id string) string {
	st := c.st
	find := func(n int, at func(int) (string, string)) string {
		for i := range n {
			if gotID, file := at(i); gotID == id {
				return file
			}
		}
		return ""
	}
	switch typ {
	case state.TypeArea:
		return find(len(st.Areas), func(i int) (string, string) { return st.Areas[i].ID, st.Areas[i].File })
	case state.TypeFeature:
		return find(len(st.Features), func(i int) (string, string) { return st.Features[i].ID, st.Features[i].File })
	case state.TypeCapability:
		return c.capabilityFile(id)
	case state.TypeRule:
		return find(len(st.Rules), func(i int) (string, string) { return st.Rules[i].ID, st.Rules[i].File })
	case state.TypeConcept:
		return find(len(st.Concepts), func(i int) (string, string) { return st.Concepts[i].ID, st.Concepts[i].File })
	case state.TypePersona:
		return find(len(st.Personas), func(i int) (string, string) { return st.Personas[i].ID, st.Personas[i].File })
	case state.TypeProblem:
		return find(len(st.Problems), func(i int) (string, string) { return st.Problems[i].ID, st.Problems[i].File })
	case state.TypeConstraint:
		return find(len(st.Constraints), func(i int) (string, string) { return st.Constraints[i].ID, st.Constraints[i].File })
	case state.TypeInitiative:
		return find(len(st.Initiatives), func(i int) (string, string) { return st.Initiatives[i].ID, st.Initiatives[i].File })
	case state.TypeMechanism:
		return find(len(st.Mechanisms), func(i int) (string, string) { return st.Mechanisms[i].ID, st.Mechanisms[i].File })
	case state.TypeComponent:
		return find(len(st.Components), func(i int) (string, string) { return st.Components[i].ID, st.Components[i].File })
	case state.TypeArchetype:
		return find(len(st.Archetypes), func(i int) (string, string) { return st.Archetypes[i].ID, st.Archetypes[i].File })
	}
	return ""
}

func (c *checker) capabilityFile(id string) string {
	for _, cp := range c.st.Capabilities {
		if cp.ID == id {
			return cp.File
		}
	}
	return ""
}

// duplicates finds two docs of one type with one ID, and two gaps or
// tradeoffs with one key on a doc.
func (c *checker) duplicates() {
	type key struct{ typ, id string }
	seen := map[key]string{}
	check := func(typ, id, file string) {
		k := key{typ, id}
		if first, ok := seen[k]; ok {
			s := subject{ref: state.DocRef(typ, id), file: file}
			if typ == state.TypeCapability {
				s.capabilities = []string{s.ref}
			}
			c.add(state.DuplicateID, s, "It's declared twice: in %s and %s.", first, file)
			return
		}
		seen[k] = file
	}
	for _, a := range c.st.Areas {
		check(state.TypeArea, a.ID, a.File)
	}
	for _, f := range c.st.Features {
		check(state.TypeFeature, f.ID, f.File)
	}
	for _, cp := range c.st.Capabilities {
		check(state.TypeCapability, cp.ID, cp.File)
	}
	for _, r := range c.st.Rules {
		check(state.TypeRule, r.ID, r.File)
	}
	for _, cn := range c.st.Concepts {
		check(state.TypeConcept, cn.ID, cn.File)
	}
	for _, p := range c.st.Personas {
		check(state.TypePersona, p.ID, p.File)
	}
	for _, pr := range c.st.Problems {
		check(state.TypeProblem, pr.ID, pr.File)
	}
	for _, cn := range c.st.Constraints {
		check(state.TypeConstraint, cn.ID, cn.File)
	}
	for _, in := range c.st.Initiatives {
		check(state.TypeInitiative, in.ID, in.File)
	}
	for _, m := range c.st.Mechanisms {
		check(state.TypeMechanism, m.ID, m.File)
	}
	for _, cp := range c.st.Components {
		check(state.TypeComponent, cp.ID, cp.File)
	}
	for _, a := range c.st.Archetypes {
		check(state.TypeArchetype, a.ID, a.File)
	}

	// A doc's gaps and tradeoffs share their keys.
	entries := map[string]bool{}
	entry := func(id string) {
		if entries[id] {
			c.add(state.DuplicateID, c.entrySubject(id), "Its key is used twice among its doc's gaps and tradeoffs.")
			return
		}
		entries[id] = true
	}
	for _, g := range c.st.Gaps {
		entry(g.ID)
	}
	for _, t := range c.st.Tradeoffs {
		entry(t.ID)
	}
}
