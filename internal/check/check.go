// Package check finds the problems a project's state shows on its own, such
// as a link to a doc that doesn't exist or a rule no capability follows. It
// reads only the state, never files, so the CLI and the server run the same
// check: index runs it on what it reads, and the server runs it again on
// every state it's sent.
//
// Problems only files show, such as frontmatter that isn't YAML, an
// annotation naming nothing, or a broken link in a body, are found by index,
// and have no subject: see Recheckable.
package check

import (
	"fmt"
	"slices"
	"strings"

	"github.com/docqet/docqet/internal/state"
)

// Recheckable reports whether p is a problem Check finds, and so one the
// server works out again rather than taking from what it's sent. Every
// problem about a doc is; those found reading files aren't about one.
func Recheckable(p state.Problem) bool {
	return p.Subject != ""
}

// Check returns every problem st shows on its own, in the order of its docs.
// docqet:implements capability:checking component:check
func Check(st *state.State) []state.Problem {
	c := newChecker(st)
	c.domains()
	c.features()
	c.capabilities()
	c.rules()
	c.concepts()
	c.personas()
	c.initiatives()
	c.mechanisms()
	c.components()
	c.gaps()
	c.tradeoffs()
	c.duplicates()
	return c.problems
}

type checker struct {
	st       *state.State
	problems []state.Problem
	domain   map[string]bool
	outcome  map[string]bool
}

func newChecker(st *state.State) *checker {
	c := &checker{st: st, domain: map[string]bool{}, outcome: map[string]bool{}}
	for _, d := range st.Domains {
		c.domain[d.ID] = true
	}
	for _, q := range st.Rubric.Qualities {
		for _, l := range q.Levels {
			for _, o := range l.Outcomes {
				c.outcome[o.ID] = true
			}
		}
	}
	return c
}

// subject is what a problem is about.
type subject struct {
	ref, domain, file string
	capabilities      []string
}

func (c *checker) add(typ string, s subject, format string, args ...any) {
	caps := s.capabilities
	if caps == nil {
		caps = []string{}
	}
	c.problems = append(c.problems, state.Problem{
		Type: typ, Subject: s.ref, Capabilities: caps, Message: fmt.Sprintf(format, args...),
		Domain: s.domain, File: s.file,
	})
}

func (c *checker) domains() {
	for _, d := range c.st.Domains {
		s := subject{ref: state.DocRef(state.TypeDomain, d.ID), file: d.File}
		c.common(s, d.ID, d.Name, d.Description, true)
		c.decisions(s, d.Decisions)
	}
}

func (c *checker) features() {
	for _, f := range c.st.Features {
		s := subject{ref: state.DocRef(state.TypeFeature, f.ID), domain: f.Domain, file: f.File}
		c.common(s, f.ID, f.Name, f.Description, true)
		c.inDomain(s, f.Domain)
		if len(f.Capabilities) == 0 {
			c.add(state.InvalidFrontmatter, s, "A feature lists its capabilities.")
		}
		c.links(s, "capabilities", f.Capabilities, state.TypeCapability, f.Domain)
		c.decisions(s, f.Decisions)
	}

	// A capability is in at most one feature, however many domains write it.
	in := map[string][]string{}
	var order []string
	for _, f := range c.st.Features {
		for _, raw := range f.Capabilities {
			ref, ok := state.ParseRef(raw)
			if !ok || ref.Type != state.TypeCapability {
				continue
			}
			feature := state.DocRef(state.TypeFeature, f.ID)
			if _, seen := in[ref.ID]; !seen {
				order = append(order, ref.ID)
			}
			if !slices.Contains(in[ref.ID], feature) {
				in[ref.ID] = append(in[ref.ID], feature)
			}
		}
	}
	for _, id := range order {
		if features := in[id]; len(features) > 1 {
			ref := state.DocRef(state.TypeCapability, id)
			c.add(state.InTwoFeatures, subject{ref: ref, file: c.capabilityFile(id), capabilities: []string{ref}},
				"More than one feature lists it: %s.", strings.Join(features, ", "))
		}
	}
}

func (c *checker) capabilities() {
	for _, cp := range c.st.Capabilities {
		ref := state.DocRef(state.TypeCapability, cp.ID)
		s := subject{ref: ref, domain: cp.Domain, file: cp.File, capabilities: []string{ref}}
		c.common(s, cp.ID, cp.Name, cp.Description, true)
		c.inDomain(s, cp.Domain)
		switch cp.Stability {
		case "draft", "prototype", "alpha", "beta", "ga":
		case "":
			c.add(state.InvalidFrontmatter, s, "A capability has a stability: draft, prototype, alpha, beta or ga.")
		default:
			c.add(state.InvalidFrontmatter, s, "stability is %q: it's draft, prototype, alpha, beta or ga.", cp.Stability)
		}
		c.links(s, "personas", cp.Personas, state.TypePersona, cp.Domain)
		c.links(s, "initiatives", cp.Initiatives, state.TypeInitiative, cp.Domain)
		c.links(s, "rules", cp.Rules, state.TypeRule, cp.Domain)
		c.links(s, "concepts", cp.Concepts, state.TypeConcept, cp.Domain)
		c.decisions(s, cp.Decisions)
	}
}

func (c *checker) rules() {
	for _, r := range c.st.Rules {
		ref := state.DocRef(state.TypeRule, r.ID)
		followers := c.followers(r)
		s := subject{ref: ref, domain: r.Domain, file: r.File, capabilities: followers}
		c.common(s, r.ID, r.Name, "", false)
		c.inDomain(s, r.Domain)
		c.links(s, "concepts", r.Concepts, state.TypeConcept, r.Domain)
		if len(followers) == 0 {
			c.add(state.UnlinkedRule, s, "No capability follows this rule.")
		}
	}
}

// followers is the capabilities whose rules mean r.
func (c *checker) followers(r state.Rule) []string {
	var out []string
	for _, cp := range c.st.Capabilities {
		for _, raw := range cp.Rules {
			ref, ok := state.ParseRef(raw)
			if !ok || ref.Type != state.TypeRule || ref.ID != r.ID {
				continue
			}
			domain := ref.Domain
			if domain == "" {
				domain = cp.Domain
			}
			if domain == r.Domain && !slices.Contains(out, state.DocRef(state.TypeCapability, cp.ID)) {
				out = append(out, state.DocRef(state.TypeCapability, cp.ID))
			}
		}
	}
	return out
}

func (c *checker) concepts() {
	for _, cn := range c.st.Concepts {
		s := subject{ref: state.DocRef(state.TypeConcept, cn.ID), domain: cn.Domain, file: cn.File}
		c.common(s, cn.ID, cn.Name, cn.Description, true)
		c.inDomain(s, cn.Domain)
		for _, cw := range cn.ConfusedWith {
			switch {
			case (cw.Concept == nil) == (cw.Term == nil):
				c.add(state.InvalidFrontmatter, s, "Each confused-with names either a concept or a term.")
			case cw.Concept != nil:
				c.links(s, "confused-with", []string{*cw.Concept}, state.TypeConcept, cn.Domain)
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
		c.links(s, "initiatives", p.Initiatives, state.TypeInitiative, "")
	}
}

func (c *checker) initiatives() {
	for _, in := range c.st.Initiatives {
		c.common(subject{ref: state.DocRef(state.TypeInitiative, in.ID), file: in.File}, in.ID, in.Name, in.Description, true)
	}
}

func (c *checker) mechanisms() {
	for _, m := range c.st.Mechanisms {
		s := subject{ref: state.DocRef(state.TypeMechanism, m.ID), file: m.File}
		c.common(s, m.ID, m.Name, m.Description, true)
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
		c.links(s, "capabilities", cp.Capabilities, state.TypeCapability, "")
		c.outcomes(s, "meets", cp.Meets)
		c.decisions(s, cp.Decisions)
	}
}

func (c *checker) gaps() {
	for _, g := range c.st.Gaps {
		s := c.entrySubject(g.ID, g.Domain)
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
			c.links(s, "affects", []string{raw}, state.TypeRule, g.Domain)
		}
	}
}

func (c *checker) tradeoffs() {
	for _, t := range c.st.Tradeoffs {
		s := c.entrySubject(t.ID, t.Domain)
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

// entrySubject is a gap or tradeoff as a problem's subject, with the doc it's
// on.
func (c *checker) entrySubject(id, domain string) subject {
	s := subject{ref: id, domain: domain}
	doc, _, _ := strings.Cut(id, "#")
	if ref, ok := state.ParseRef(doc); ok {
		s.file = c.fileOf(ref.Type, ref.ID, domain)
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

// inDomain checks a doc written in a domain names one the project has.
func (c *checker) inDomain(s subject, domain string) {
	switch {
	case domain == "":
		c.add(state.InvalidFrontmatter, s, "A %s is written in a domain, so it has one.", strings.SplitN(s.ref, ":", 2)[0])
	case !c.domain[domain]:
		c.add(state.UnknownID, s, "domain is %s, which the project has no domain doc for.", domain)
	}
}

// links checks each link in field is a reference to a doc of type typ that
// exists. A rule or concept is looked for in the domain it names, or naming
// none, in from, the domain of the doc it's in.
func (c *checker) links(s subject, field string, refs []string, typ, from string) {
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
		domain := ref.Domain
		if domain == "" {
			domain = from
		}
		if !c.exists(typ, ref.ID, domain) {
			msg := "%s lists %s, which doesn't exist."
			switch {
			case (typ == state.TypeRule || typ == state.TypeConcept) && ref.Domain == "" && domain == "":
				msg = "%s lists %s without its domain, and the doc it's in has none: write it as " + typ + ":<id>@<domain>."
			case c.st.Product != nil:
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

// exists reports whether the project has a doc of type typ with id, in
// domain for a rule or concept.
func (c *checker) exists(typ, id, domain string) bool {
	return c.fileOf(typ, id, domain) != ""
}

// fileOf is the file of the doc of type typ with id, in domain for a rule or
// concept, or "" when there's none.
func (c *checker) fileOf(typ, id, domain string) string {
	st := c.st
	// Every type but a rule or concept is one across every domain.
	find := func(n int, at func(int) (string, string)) string {
		for i := range n {
			if gotID, file := at(i); gotID == id {
				return file
			}
		}
		return ""
	}
	switch typ {
	case state.TypeDomain:
		return find(len(st.Domains), func(i int) (string, string) { return st.Domains[i].ID, st.Domains[i].File })
	case state.TypeFeature:
		return find(len(st.Features), func(i int) (string, string) { return st.Features[i].ID, st.Features[i].File })
	case state.TypeCapability:
		return c.capabilityFile(id)
	case state.TypeRule:
		for _, r := range st.Rules {
			if r.ID == id && r.Domain == domain {
				return r.File
			}
		}
	case state.TypeConcept:
		for _, cn := range st.Concepts {
			if cn.ID == id && cn.Domain == domain {
				return cn.File
			}
		}
	case state.TypePersona:
		return find(len(st.Personas), func(i int) (string, string) { return st.Personas[i].ID, st.Personas[i].File })
	case state.TypeInitiative:
		return find(len(st.Initiatives), func(i int) (string, string) { return st.Initiatives[i].ID, st.Initiatives[i].File })
	case state.TypeMechanism:
		return find(len(st.Mechanisms), func(i int) (string, string) { return st.Mechanisms[i].ID, st.Mechanisms[i].File })
	case state.TypeComponent:
		return find(len(st.Components), func(i int) (string, string) { return st.Components[i].ID, st.Components[i].File })
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

// duplicates finds two docs of one type with one ID where there may be only
// one: in one domain for a doc written in one, and in all for the rest, and
// two gaps or tradeoffs with one key on a doc.
func (c *checker) duplicates() {
	type key struct{ typ, id, domain string }
	seen := map[key]string{}
	check := func(typ, id, domain, file string) {
		k := key{typ, id, domain}
		if first, ok := seen[k]; ok {
			s := subject{ref: state.DocRef(typ, id), domain: domain, file: file}
			if typ == state.TypeCapability {
				s.capabilities = []string{s.ref}
			}
			c.add(state.DuplicateID, s, "It's declared twice: in %s and %s.", first, file)
			return
		}
		seen[k] = file
	}
	for _, d := range c.st.Domains {
		check(state.TypeDomain, d.ID, "", d.File)
	}
	for _, f := range c.st.Features {
		check(state.TypeFeature, f.ID, f.Domain, f.File)
	}
	for _, cp := range c.st.Capabilities {
		check(state.TypeCapability, cp.ID, cp.Domain, cp.File)
	}
	for _, r := range c.st.Rules {
		check(state.TypeRule, r.ID, r.Domain, r.File)
	}
	for _, cn := range c.st.Concepts {
		check(state.TypeConcept, cn.ID, cn.Domain, cn.File)
	}
	for _, p := range c.st.Personas {
		check(state.TypePersona, p.ID, "", p.File)
	}
	for _, in := range c.st.Initiatives {
		check(state.TypeInitiative, in.ID, "", in.File)
	}
	for _, m := range c.st.Mechanisms {
		check(state.TypeMechanism, m.ID, "", m.File)
	}
	for _, cp := range c.st.Components {
		check(state.TypeComponent, cp.ID, "", cp.File)
	}

	// A doc's gaps and tradeoffs share their keys, across every domain that
	// writes it.
	entries := map[string]bool{}
	entry := func(id, domain string) {
		if entries[id] {
			c.add(state.DuplicateID, c.entrySubject(id, domain), "Its key is used twice among its doc's gaps and tradeoffs.")
			return
		}
		entries[id] = true
	}
	for _, g := range c.st.Gaps {
		entry(g.ID, g.Domain)
	}
	for _, t := range c.st.Tradeoffs {
		entry(t.ID, t.Domain)
	}
}
