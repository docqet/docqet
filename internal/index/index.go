// Package index reads a project's docs and annotations and works out its
// state: every doc's entry, evidence, reverse links and problems, as the
// spec's Index output describes. It reads only what it's given, so the
// working tree and any commit are indexed the same way.
package index

import (
	"errors"
	"fmt"
	"io/fs"
	"net/url"
	"path"
	"regexp"
	"slices"
	"strings"

	"github.com/exalynt/docket/internal/check"
	"github.com/exalynt/docket/internal/project"
	"github.com/exalynt/docket/internal/state"
)

// Index reads the project rooted at fsys, the folder with its docket.yaml,
// and returns its state. The commit and the time it was indexed are the
// caller's to fill in. Problems in the docs are in the state; an error means
// the project couldn't be read at all, such as having no docket.yaml.
// docket:implements capability:indexing component:index rule:docs-with-problems-still-index@authoring
func Index(fsys fs.FS) (*state.State, error) {
	cfg, err := project.ReadConfig(fsys)
	if err != nil {
		return nil, err
	}
	rubric, err := Rubric()
	if err != nil {
		return nil, err
	}

	st := &state.State{
		Docket:       state.Version,
		Project:      state.Ident{ID: cfg.Project.ID, Name: cfg.Project.Name},
		Domains:      []state.Domain{},
		Features:     []state.Feature{},
		Personas:     []state.Persona{},
		Initiatives:  []state.Initiative{},
		Capabilities: []state.Capability{},
		Rules:        []state.Rule{},
		Concepts:     []state.Concept{},
		Mechanisms:   []state.Mechanism{},
		Components:   []state.Component{},
		Gaps:         []state.Gap{},
		Tradeoffs:    []state.Tradeoff{},
		Problems:     []state.Problem{},
		Rubric:       rubric,
	}
	if cfg.Product != nil {
		st.Product = &state.Ident{ID: cfg.Product.ID, Name: cfg.Product.Name}
	}

	ig, err := readIgnore(fsys)
	if err != nil {
		return nil, err
	}
	var (
		docs        []*doc
		annotations []annotation
		problems    []state.Problem
	)
	err = fs.WalkDir(fsys, ".", func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			if p != "." && (skipDir(fsys, p) || ig.ignored(p, true)) {
				return fs.SkipDir
			}
			return nil
		}
		if p == "docket.yaml" || ig.ignored(p, false) {
			return nil
		}
		data, err := fs.ReadFile(fsys, p)
		if err != nil {
			return err
		}
		if strings.HasSuffix(p, ".md") {
			doc, isDoc, found := readDoc(p, data)
			problems = append(problems, found...)
			if isDoc {
				if doc != nil {
					docs = append(docs, doc)
					problems = append(problems, brokenLinks(fsys, p, data)...)
				}
				return nil
			}
		}
		annotations = append(annotations, scanAnnotations(p, data)...)
		return nil
	})
	if err != nil {
		return nil, err
	}

	for _, d := range docs {
		addEntry(st, d)
	}
	problems = append(problems, attachAnnotations(st, annotations)...)
	linkBack(st)

	st.Problems = append(list(problems), check.Check(st)...)
	st.Summary = summarize(st)
	return st, nil
}

// skipDir reports whether a folder isn't part of the project: git's and
// docket's own, and any with a docket.yaml of its own, which is another
// project.
// docket:implements rule:nested-projects-are-separate@authoring
func skipDir(fsys fs.FS, p string) bool {
	switch path.Base(p) {
	case ".git", ".docket":
		return true
	}
	_, err := fs.Stat(fsys, path.Join(p, "docket.yaml"))
	return err == nil
}

// addEntry adds a doc's entry to the state, with its gaps and tradeoffs.
func addEntry(st *state.State, d *doc) {
	fm := d.fm
	ref := state.DocRef(fm.Docket, fm.ID)
	name, description := text(fm.Name), text(fm.Description)

	switch fm.Docket {
	case state.TypeDomain:
		st.Domains = append(st.Domains, state.Domain{
			ID: fm.ID, File: d.file, Name: name, Description: description,
			Decisions: decisions(fm.Decisions), Body: d.body,
		})
	case state.TypeFeature:
		st.Features = append(st.Features, state.Feature{
			ID: fm.ID, Domain: fm.Domain, File: d.file, Name: name, Description: description,
			Capabilities: list(fm.Capabilities), Tradeoffs: tradeoffRefs(ref, fm.Tradeoffs),
			Decisions: decisions(fm.Decisions), Body: d.body,
		})
		addTradeoffs(st, ref, fm.Domain, fm.Tradeoffs)
	case state.TypeCapability:
		st.Capabilities = append(st.Capabilities, state.Capability{
			ID: fm.ID, Domain: fm.Domain, File: d.file, Name: name, Description: description,
			Stability: fm.Stability, Personas: list(fm.Personas), Initiatives: list(fm.Initiatives),
			Rules: list(fm.Rules), Concepts: list(fm.Concepts),
			Gaps: gapRefs(ref, fm.Gaps), Tradeoffs: tradeoffRefs(ref, fm.Tradeoffs),
			Decisions: decisions(fm.Decisions), Evidence: evidence(), Body: d.body,
		})
		addGaps(st, ref, fm.Domain, fm.Gaps)
		addTradeoffs(st, ref, fm.Domain, fm.Tradeoffs)
	case state.TypeRule:
		st.Rules = append(st.Rules, state.Rule{
			ID: fm.ID, Domain: fm.Domain, File: d.file, Name: name,
			Capabilities: []string{}, Concepts: list(fm.Concepts), Why: textPtr(fm.Why),
			Evidence: evidence(), Body: d.body,
		})
	case state.TypeConcept:
		confusions := make([]state.Confusion, 0, len(fm.ConfusedWith))
		for _, c := range fm.ConfusedWith {
			confusions = append(confusions, state.Confusion{Concept: c.Concept, Term: c.Term, Summary: text(c.Summary)})
		}
		st.Concepts = append(st.Concepts, state.Concept{
			ID: fm.ID, Domain: fm.Domain, File: d.file, Name: name, Description: description,
			Capabilities: []string{}, Rules: []string{}, ConfusedWith: confusions, Body: d.body,
		})
	case state.TypePersona:
		st.Personas = append(st.Personas, state.Persona{
			ID: fm.ID, File: d.file, Name: name, Role: fm.Role, Title: fm.Title,
			Description: description, Image: fm.Image,
			Capabilities: []string{}, Features: []string{}, Initiatives: list(fm.Initiatives), Body: d.body,
		})
	case state.TypeInitiative:
		st.Initiatives = append(st.Initiatives, state.Initiative{
			ID: fm.ID, File: d.file, Name: name, Description: description,
			Capabilities: []string{}, Features: []string{}, Personas: []string{}, Body: d.body,
		})
	case state.TypeMechanism:
		applies := fm.Applies
		if applies == "" {
			applies = "project"
		}
		st.Mechanisms = append(st.Mechanisms, state.Mechanism{
			ID: fm.ID, File: d.file, Name: name, Description: description, Applies: applies,
			Capabilities: []string{}, Meets: list(fm.Meets),
			Gaps: gapRefs(ref, fm.Gaps), Tradeoffs: tradeoffRefs(ref, fm.Tradeoffs),
			Evidence: evidence(), Decisions: decisions(fm.Decisions), Body: d.body,
		})
		addGaps(st, ref, "", fm.Gaps)
		addTradeoffs(st, ref, "", fm.Tradeoffs)
	case state.TypeComponent:
		st.Components = append(st.Components, state.Component{
			ID: fm.ID, File: d.file, Name: name, Description: description,
			Capabilities: list(fm.Capabilities), Meets: list(fm.Meets),
			Gaps: gapRefs(ref, fm.Gaps), Tradeoffs: tradeoffRefs(ref, fm.Tradeoffs),
			Evidence: evidence(), Decisions: decisions(fm.Decisions), Body: d.body,
		})
		addGaps(st, ref, "", fm.Gaps)
		addTradeoffs(st, ref, "", fm.Tradeoffs)
	}
}

func addGaps(st *state.State, ref, domain string, gs []gap) {
	for _, g := range gs {
		st.Gaps = append(st.Gaps, state.Gap{
			ID: ref + "#" + g.ID, Domain: domain, Affects: list(g.Affects),
			Impact: g.Impact, Likelihood: g.Likelihood, Reach: g.Reach,
			Name: text(g.Name), Description: text(g.Description), Places: []state.Place{},
		})
	}
}

func addTradeoffs(st *state.State, ref, domain string, ts []tradeoff) {
	for _, t := range ts {
		st.Tradeoffs = append(st.Tradeoffs, state.Tradeoff{
			ID: ref + "#" + t.ID, Domain: domain, Affects: list(t.Affects),
			Name: text(t.Name), Description: text(t.Description),
			Benefit: textPtr(t.Benefit), Drawback: text(t.Drawback), Places: []state.Place{},
		})
	}
}

// attachAnnotations adds each annotation to what it names: evidence on a
// rule, capability, mechanism or component, or a place on a gap or tradeoff.
// It returns the problems with the annotations themselves.
// docket:implements capability:annotations rule:annotations-name-a-rules-domain@authoring
func attachAnnotations(st *state.State, annotations []annotation) []state.Problem {
	var problems []state.Problem
	for _, a := range annotations {
		for _, raw := range a.refs {
			ref, _ := state.ParseRef(raw)
			bad := func(typ, msg string) {
				problems = append(problems, fileProblem(typ, a.file, a.line, msg))
			}
			switch a.verb {
			case verbVerifies, verbImplements:
				if ref.Key != "" {
					bad(state.InvalidAnnotation, fmt.Sprintf("docket:%s names %s, a gap or tradeoff: it names a rule, capability, mechanism or component.", a.verb, raw))
					continue
				}
				found, err := addEvidence(st, ref, a.verb, a.place)
				switch {
				case err != nil:
					bad(state.InvalidAnnotation, fmt.Sprintf("docket:%s names %s: %s", a.verb, raw, err))
				case !found:
					bad(state.UnknownID, fmt.Sprintf("docket:%s names %s, which doesn't exist.", a.verb, raw))
				}
			case verbGap, verbTradeoff:
				if ref.Key == "" {
					bad(state.InvalidAnnotation, fmt.Sprintf("docket:%s names %s, which isn't a %s's ID: it's <doc>#<key>.", a.verb, raw, a.verb))
					continue
				}
				id := state.DocRef(ref.Type, ref.ID) + "#" + ref.Key
				if !addPlace(st, a.verb, id, a.place) {
					bad(state.UnknownID, fmt.Sprintf("docket:%s names %s, which doesn't exist.", a.verb, raw))
				}
			}
		}
	}
	return problems
}

// addEvidence adds place to the evidence of every entry ref names. found is
// false when nothing has that ID.
func addEvidence(st *state.State, ref state.Ref, verb string, place state.Place) (found bool, err error) {
	add := func(e *state.Evidence) {
		found = true
		if verb == verbVerifies {
			e.Verifies = append(e.Verifies, place)
		} else {
			e.Implements = append(e.Implements, place)
		}
	}
	switch ref.Type {
	case state.TypeRule:
		if ref.Domain == "" {
			return false, errors.New("a rule in an annotation names its domain, as rule:<id>@<domain>, since code is in no domain")
		}
		for i := range st.Rules {
			if st.Rules[i].ID == ref.ID && st.Rules[i].Domain == ref.Domain {
				add(&st.Rules[i].Evidence)
			}
		}
	case state.TypeCapability:
		for i := range st.Capabilities {
			if st.Capabilities[i].ID == ref.ID {
				add(&st.Capabilities[i].Evidence)
			}
		}
	case state.TypeMechanism:
		for i := range st.Mechanisms {
			if st.Mechanisms[i].ID == ref.ID {
				add(&st.Mechanisms[i].Evidence)
			}
		}
	case state.TypeComponent:
		for i := range st.Components {
			if st.Components[i].ID == ref.ID {
				add(&st.Components[i].Evidence)
			}
		}
	default:
		return false, fmt.Errorf("it names a rule, capability, mechanism or component, not a %s", ref.Type)
	}
	return found, nil
}

func addPlace(st *state.State, verb, id string, place state.Place) bool {
	found := false
	if verb == verbGap {
		for i := range st.Gaps {
			if st.Gaps[i].ID == id {
				st.Gaps[i].Places = append(st.Gaps[i].Places, place)
				found = true
			}
		}
		return found
	}
	for i := range st.Tradeoffs {
		if st.Tradeoffs[i].ID == id {
			st.Tradeoffs[i].Places = append(st.Tradeoffs[i].Places, place)
			found = true
		}
	}
	return found
}

// linkBack works out each link's other direction: which feature each
// capability is in, which capabilities follow each rule, which serve each
// persona, and the rest, and each mechanism's capabilities.
func linkBack(st *state.State) {
	for _, f := range st.Features {
		for _, raw := range f.Capabilities {
			ref, ok := state.ParseRef(raw)
			if !ok || ref.Type != state.TypeCapability {
				continue
			}
			for i := range st.Capabilities {
				if st.Capabilities[i].ID == ref.ID && st.Capabilities[i].Feature == nil {
					feature := state.DocRef(state.TypeFeature, f.ID)
					st.Capabilities[i].Feature = &feature
				}
			}
		}
	}

	// A draft claims nothing, so it's left out of what follows a rule or uses
	// a concept, though it still shows for its personas and initiatives.
	for _, c := range st.Capabilities {
		if c.Stability == "draft" {
			continue
		}
		capRef := state.DocRef(state.TypeCapability, c.ID)
		for _, raw := range c.Rules {
			for i := range st.Rules {
				if resolves(raw, state.TypeRule, c.Domain, st.Rules[i].ID, st.Rules[i].Domain) {
					st.Rules[i].Capabilities = appendNew(st.Rules[i].Capabilities, capRef)
				}
			}
		}
		for _, raw := range c.Concepts {
			for i := range st.Concepts {
				if resolves(raw, state.TypeConcept, c.Domain, st.Concepts[i].ID, st.Concepts[i].Domain) {
					st.Concepts[i].Capabilities = appendNew(st.Concepts[i].Capabilities, capRef)
				}
			}
		}
	}
	for _, r := range st.Rules {
		for _, raw := range r.Concepts {
			for i := range st.Concepts {
				if resolves(raw, state.TypeConcept, r.Domain, st.Concepts[i].ID, st.Concepts[i].Domain) {
					st.Concepts[i].Rules = appendNew(st.Concepts[i].Rules, scopedRef(state.TypeRule, r.ID, r.Domain, st.Concepts[i].Domain))
				}
			}
		}
	}

	featureOf := func(c state.Capability) string {
		if c.Feature == nil {
			return ""
		}
		return *c.Feature
	}
	for i := range st.Personas {
		p := &st.Personas[i]
		for _, c := range st.Capabilities {
			if names(c.Personas, state.TypePersona, p.ID) {
				p.Capabilities = appendNew(p.Capabilities, state.DocRef(state.TypeCapability, c.ID))
				if f := featureOf(c); f != "" {
					p.Features = appendNew(p.Features, f)
				}
			}
		}
	}
	for i := range st.Initiatives {
		in := &st.Initiatives[i]
		for _, c := range st.Capabilities {
			if names(c.Initiatives, state.TypeInitiative, in.ID) {
				in.Capabilities = appendNew(in.Capabilities, state.DocRef(state.TypeCapability, c.ID))
				if f := featureOf(c); f != "" {
					in.Features = appendNew(in.Features, f)
				}
			}
		}
		for _, p := range st.Personas {
			if names(p.Initiatives, state.TypeInitiative, in.ID) {
				in.Personas = appendNew(in.Personas, state.DocRef(state.TypePersona, p.ID))
			}
		}
	}

	// A mechanism applies to every capability the project serves: each it
	// declares, but for drafts, then each its components list.
	var served []string
	for _, c := range st.Capabilities {
		if c.Stability != "draft" {
			served = appendNew(served, state.DocRef(state.TypeCapability, c.ID))
		}
	}
	for _, comp := range st.Components {
		for _, raw := range comp.Capabilities {
			if ref, ok := state.ParseRef(raw); ok && ref.Type == state.TypeCapability {
				served = appendNew(served, state.DocRef(state.TypeCapability, ref.ID))
			}
		}
	}
	for i := range st.Mechanisms {
		st.Mechanisms[i].Capabilities = append([]string{}, served...)
	}
}

// resolves reports whether the link raw, written in a doc in domain from,
// means the doc of type typ with id in domain: the one in the domain it
// names, or naming none, the one in its own.
func resolves(raw, typ, from, id, domain string) bool {
	ref, ok := state.ParseRef(raw)
	if !ok || ref.Type != typ || ref.ID != id {
		return false
	}
	if ref.Domain == "" {
		return domain == from
	}
	return ref.Domain == domain
}

// names reports whether refs links the doc of type typ with id.
func names(refs []string, typ, id string) bool {
	return slices.ContainsFunc(refs, func(raw string) bool {
		ref, ok := state.ParseRef(raw)
		return ok && ref.Type == typ && ref.ID == id
	})
}

// scopedRef is a rule's or concept's reference as written from domain from:
// with its domain when it's another.
func scopedRef(typ, id, domain, from string) string {
	if domain == from {
		return state.DocRef(typ, id)
	}
	return state.DocRef(typ, id) + "@" + domain
}

func appendNew(l []string, s string) []string {
	if slices.Contains(l, s) {
		return l
	}
	return append(l, s)
}

var markdownLink = regexp.MustCompile(`\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)`)

// codeSpan is inline code, whose links are examples.
var codeSpan = regexp.MustCompile("`[^`]*`")

// brokenLinks finds the relative links in a doc, in its frontmatter's text
// values and its body, that don't resolve from its file. A link out of the
// project's folder can't be checked, so it's left alone.
func brokenLinks(fsys fs.FS, file string, data []byte) []state.Problem {
	var problems []state.Problem
	inFence := false
	for i, line := range strings.Split(string(data), "\n") {
		// A link in a code block or a code span is an example, not a link.
		if trimmed := strings.TrimSpace(line); strings.HasPrefix(trimmed, "```") || strings.HasPrefix(trimmed, "~~~") {
			inFence = !inFence
			continue
		}
		if inFence {
			continue
		}
		line = codeSpan.ReplaceAllString(line, "")
		for _, m := range markdownLink.FindAllStringSubmatch(line, -1) {
			target := m[1]
			if strings.Contains(target, "://") || strings.HasPrefix(target, "mailto:") || strings.HasPrefix(target, "#") {
				continue
			}
			target, _, _ = strings.Cut(target, "#")
			target, _, _ = strings.Cut(target, "?")
			if unescaped, err := url.PathUnescape(target); err == nil {
				target = unescaped
			}
			resolved := path.Clean(path.Join(path.Dir(file), target))
			if target == "" || resolved == ".." || strings.HasPrefix(resolved, "../") || path.IsAbs(target) {
				continue
			}
			if _, err := fs.Stat(fsys, resolved); err != nil {
				problems = append(problems, fileProblem(state.BrokenLink, file, i+1, fmt.Sprintf("The link to %s doesn't resolve.", m[1])))
			}
		}
	}
	return problems
}

// summarize counts the state at a glance.
func summarize(st *state.State) state.Summary {
	s := state.Summary{
		Domains:     len(st.Domains),
		Features:    distinct(len(st.Features), func(i int) string { return st.Features[i].ID }),
		Personas:    len(st.Personas),
		Initiatives: len(st.Initiatives),
		Rules:       len(st.Rules),
		Gaps:        len(st.Gaps),
		Problems:    len(st.Problems),
		Tradeoffs:   len(st.Tradeoffs),
		Mechanisms:  len(st.Mechanisms),
		Components:  len(st.Components),
	}
	for _, c := range st.Capabilities {
		switch c.Stability {
		case "draft":
			s.Capabilities.Draft++
		case "prototype":
			s.Capabilities.Prototype++
		case "alpha":
			s.Capabilities.Alpha++
		case "beta":
			s.Capabilities.Beta++
		case "ga":
			s.Capabilities.GA++
		}
	}
	return s
}

// distinct is how many different IDs n entries have: a feature written in
// several domains is one feature.
func distinct(n int, id func(int) string) int {
	seen := map[string]bool{}
	for i := range n {
		seen[id(i)] = true
	}
	return len(seen)
}

// text is a text value as state holds it, without the line break YAML's |
// leaves at its end.
func text(s string) string {
	return strings.TrimSpace(s)
}

func textPtr(s *string) *string {
	if s == nil {
		return nil
	}
	t := text(*s)
	return &t
}
