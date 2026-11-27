// Package index reads a project's docs and annotations and works out its
// state: every doc's entry, evidence, reverse links and findings, as the
// spec's Index output describes. It reads only what it's given, so the
// working tree and any commit are indexed the same way.
package index

import (
	"fmt"
	"io/fs"
	"net/url"
	"path"
	"regexp"
	"slices"
	"strings"

	"github.com/docqet/docqet/internal/check"
	"github.com/docqet/docqet/internal/project"
	"github.com/docqet/docqet/internal/state"
)

// Index reads the project rooted at fsys, the folder with its docqet.yaml,
// and returns its state. The commit and the time it was indexed are the
// caller's to fill in. Findings in the docs are in the state; an error means
// the project couldn't be read at all, such as having no docqet.yaml.
// docqet:implements capability:indexing component:index rule:docs-with-findings-still-index
// docqet:implements rule:same-files-same-state
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
		Docqet:       state.Version,
		Project:      state.Ident{ID: cfg.Project.ID, Name: cfg.Project.Name},
		Areas:        []state.Area{},
		Features:     []state.Feature{},
		Personas:     []state.Persona{},
		Problems:     []state.Problem{},
		Constraints:  []state.Constraint{},
		Initiatives:  []state.Initiative{},
		Capabilities: []state.Capability{},
		Rules:        []state.Rule{},
		Concepts:     []state.Concept{},
		Mechanisms:   []state.Mechanism{},
		Components:   []state.Component{},
		Gaps:         []state.Gap{},
		Tradeoffs:    []state.Tradeoff{},
		Findings:     []state.Finding{},
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
		findings    []state.Finding
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
		if p == "docqet.yaml" || ig.ignored(p, false) {
			return nil
		}
		data, err := fs.ReadFile(fsys, p)
		if err != nil {
			return err
		}
		if strings.HasSuffix(p, ".md") {
			doc, isDoc, found := readDoc(p, data)
			findings = append(findings, found...)
			if isDoc {
				if doc != nil {
					docs = append(docs, doc)
					findings = append(findings, brokenLinks(fsys, p, data)...)
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
	findings = append(findings, attachAnnotations(st, annotations)...)
	linkBack(st)

	st.Findings = append(list(findings), check.Check(st)...)
	st.Summary = summarize(st)
	return st, nil
}

// skipDir reports whether a folder isn't part of the project: git's and
// docqet's own, and any with a docqet.yaml of its own, which is another
// project.
// docqet:implements rule:nested-projects-are-separate
func skipDir(fsys fs.FS, p string) bool {
	switch path.Base(p) {
	case ".git", ".docqet":
		return true
	}
	_, err := fs.Stat(fsys, path.Join(p, "docqet.yaml"))
	return err == nil
}

// addEntry adds a doc's entry to the state, with its gaps and tradeoffs.
func addEntry(st *state.State, d *doc) {
	fm := d.fm
	ref := state.DocRef(fm.Docqet, fm.ID)
	name, description := text(fm.Name), text(fm.Description)

	switch fm.Docqet {
	case state.TypeArea:
		st.Areas = append(st.Areas, state.Area{
			ID: fm.ID, File: d.file, Name: name, Description: description,
			Features: []string{}, Decisions: decisions(fm.Decisions), Body: d.body,
		})
	case state.TypeFeature:
		st.Features = append(st.Features, state.Feature{
			ID: fm.ID, File: d.file, Name: name, Description: description, Area: textPtr(fm.Within),
			Capabilities: []string{}, Tradeoffs: tradeoffRefs(ref, fm.Tradeoffs),
			Decisions: decisions(fm.Decisions), Body: d.body,
		})
		addTradeoffs(st, ref, fm.Tradeoffs)
	case state.TypeCapability:
		st.Capabilities = append(st.Capabilities, state.Capability{
			ID: fm.ID, File: d.file, Name: name, Description: description,
			Stability: fm.Stability, Feature: textPtr(fm.Within), Solves: list(fm.Solves), Personas: []string{}, Initiatives: list(fm.IncludedIn),
			Rules: list(fm.Follows), Concepts: list(fm.Uses),
			Gaps: gapRefs(ref, fm.Gaps), Tradeoffs: tradeoffRefs(ref, fm.Tradeoffs),
			Decisions: decisions(fm.Decisions), Evidence: evidence(), Body: d.body,
		})
		addGaps(st, ref, fm.Gaps)
		addTradeoffs(st, ref, fm.Tradeoffs)
	case state.TypeRule:
		st.Rules = append(st.Rules, state.Rule{
			ID: fm.ID, File: d.file, Name: name,
			Capabilities: []string{}, Concepts: list(fm.Uses), Respects: list(fm.Respects), Why: textPtr(fm.Why),
			Evidence: evidence(), Body: d.body,
		})
	case state.TypeConcept:
		confusions := make([]state.Confusion, 0, len(fm.ConfusedWith))
		for _, c := range fm.ConfusedWith {
			confusions = append(confusions, state.Confusion{Concept: c.Concept, Term: c.Term, Summary: text(c.Summary)})
		}
		st.Concepts = append(st.Concepts, state.Concept{
			ID: fm.ID, File: d.file, Name: name, Description: description,
			Capabilities: []string{}, Rules: []string{}, ConfusedWith: confusions, Body: d.body,
		})
	case state.TypePersona:
		st.Personas = append(st.Personas, state.Persona{
			ID: fm.ID, File: d.file, Name: name, Role: fm.Role, Title: fm.Title,
			Description: description, Image: fm.Image,
			Problems: []string{}, Capabilities: []string{}, Features: []string{}, Initiatives: []string{}, Body: d.body,
		})
	case state.TypeProblem:
		st.Problems = append(st.Problems, state.Problem{
			ID: fm.ID, File: d.file, Name: name, Description: description, Cost: textPtr(fm.Cost),
			Personas: list(fm.FeltBy), Capabilities: []string{}, Body: d.body,
		})
	case state.TypeConstraint:
		st.Constraints = append(st.Constraints, state.Constraint{
			ID: fm.ID, File: d.file, Name: name, Description: description, Source: textPtr(fm.Source),
			Rules: []string{}, Mechanisms: []string{}, Body: d.body,
		})
	case state.TypeInitiative:
		st.Initiatives = append(st.Initiatives, state.Initiative{
			ID: fm.ID, File: d.file, Name: name, Description: description,
			Capabilities: []string{}, Features: []string{}, Personas: list(fm.For), Body: d.body,
		})
	case state.TypeMechanism:
		applies := fm.Applies
		if applies == "" {
			applies = "project"
		}
		st.Mechanisms = append(st.Mechanisms, state.Mechanism{
			ID: fm.ID, File: d.file, Name: name, Description: description, Applies: applies, Respects: list(fm.Respects),
			Capabilities: []string{}, Meets: list(fm.Meets),
			Gaps: gapRefs(ref, fm.Gaps), Tradeoffs: tradeoffRefs(ref, fm.Tradeoffs),
			Evidence: evidence(), Decisions: decisions(fm.Decisions), Body: d.body,
		})
		addGaps(st, ref, fm.Gaps)
		addTradeoffs(st, ref, fm.Tradeoffs)
	case state.TypeComponent:
		st.Components = append(st.Components, state.Component{
			ID: fm.ID, File: d.file, Name: name, Description: description,
			Capabilities: list(fm.Serves), Meets: list(fm.Meets),
			Gaps: gapRefs(ref, fm.Gaps), Tradeoffs: tradeoffRefs(ref, fm.Tradeoffs),
			Evidence: evidence(), Decisions: decisions(fm.Decisions), Body: d.body,
		})
		addGaps(st, ref, fm.Gaps)
		addTradeoffs(st, ref, fm.Tradeoffs)
	}
}

func addGaps(st *state.State, ref string, gs []gap) {
	for _, g := range gs {
		st.Gaps = append(st.Gaps, state.Gap{
			ID: ref + "#" + g.ID, Affects: list(g.Affects),
			Impact: g.Impact, Likelihood: g.Likelihood, Reach: g.Reach,
			Name: text(g.Name), Description: text(g.Description), Places: []state.Place{},
		})
	}
}

func addTradeoffs(st *state.State, ref string, ts []tradeoff) {
	for _, t := range ts {
		st.Tradeoffs = append(st.Tradeoffs, state.Tradeoff{
			ID: ref + "#" + t.ID, Affects: list(t.Affects),
			Name: text(t.Name), Description: text(t.Description),
			Benefit: textPtr(t.Benefit), Drawback: text(t.Drawback), Places: []state.Place{},
		})
	}
}

// attachAnnotations adds each annotation to what it names: evidence on a
// rule, capability, mechanism or component, or a place on a gap or tradeoff.
// It returns the findings with the annotations themselves.
// docqet:implements capability:annotations
func attachAnnotations(st *state.State, annotations []annotation) []state.Finding {
	var findings []state.Finding
	for _, a := range annotations {
		for _, raw := range a.refs {
			ref, _ := state.ParseRef(raw)
			bad := func(typ, msg string) {
				findings = append(findings, fileFinding(typ, a.file, a.line, msg))
			}
			switch a.verb {
			case verbVerifies, verbImplements:
				if ref.Domain != "" {
					bad(state.InvalidAnnotation, fmt.Sprintf("docqet:%s names %s: rules and concepts have no domain now: write %s.", a.verb, raw, state.DocRef(ref.Type, ref.ID)))
					continue
				}
				if ref.Key != "" {
					bad(state.InvalidAnnotation, fmt.Sprintf("docqet:%s names %s, a gap or tradeoff: it names a rule, capability, mechanism or component.", a.verb, raw))
					continue
				}
				found, err := addEvidence(st, ref, a.verb, a.place)
				switch {
				case err != nil:
					bad(state.InvalidAnnotation, fmt.Sprintf("docqet:%s names %s: %s", a.verb, raw, err))
				case !found:
					bad(state.UnknownID, fmt.Sprintf("docqet:%s names %s, which doesn't exist.", a.verb, raw))
				}
			case verbGap, verbTradeoff:
				if ref.Key == "" {
					bad(state.InvalidAnnotation, fmt.Sprintf("docqet:%s names %s, which isn't a %s's ID: it's <doc>#<key>.", a.verb, raw, a.verb))
					continue
				}
				id := state.DocRef(ref.Type, ref.ID) + "#" + ref.Key
				if !addPlace(st, a.verb, id, a.place) {
					bad(state.UnknownID, fmt.Sprintf("docqet:%s names %s, which doesn't exist.", a.verb, raw))
				}
			}
		}
	}
	return findings
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
		for i := range st.Rules {
			if st.Rules[i].ID == ref.ID {
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
	// A feature's capabilities are those that name it, drafts among them, and
	// an area's features those that name it.
	for i := range st.Features {
		f := &st.Features[i]
		for _, c := range st.Capabilities {
			if c.Feature != nil && names([]string{*c.Feature}, state.TypeFeature, f.ID) {
				f.Capabilities = appendNew(f.Capabilities, state.DocRef(state.TypeCapability, c.ID))
			}
		}
	}
	for i := range st.Areas {
		a := &st.Areas[i]
		for _, f := range st.Features {
			if f.Area != nil && names([]string{*f.Area}, state.TypeArea, a.ID) {
				a.Features = appendNew(a.Features, state.DocRef(state.TypeFeature, f.ID))
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
		for i := range st.Rules {
			if names(c.Rules, state.TypeRule, st.Rules[i].ID) {
				st.Rules[i].Capabilities = appendNew(st.Rules[i].Capabilities, capRef)
			}
		}
		for i := range st.Concepts {
			if names(c.Concepts, state.TypeConcept, st.Concepts[i].ID) {
				st.Concepts[i].Capabilities = appendNew(st.Concepts[i].Capabilities, capRef)
			}
		}
	}
	for _, r := range st.Rules {
		for i := range st.Concepts {
			if names(r.Concepts, state.TypeConcept, st.Concepts[i].ID) {
				st.Concepts[i].Rules = appendNew(st.Concepts[i].Rules, state.DocRef(state.TypeRule, r.ID))
			}
		}
	}

	// A problem's capabilities are those that solve it, drafts among them:
	// a draft answers a problem nothing else does yet. A capability's
	// personas are its problems'.
	for i := range st.Capabilities {
		c := &st.Capabilities[i]
		capRef := state.DocRef(state.TypeCapability, c.ID)
		var personas []string
		for j := range st.Problems {
			pr := &st.Problems[j]
			if !names(c.Solves, state.TypeProblem, pr.ID) {
				continue
			}
			pr.Capabilities = appendNew(pr.Capabilities, capRef)
			for _, p := range pr.Personas {
				personas = appendNew(personas, p)
			}
		}
		c.Personas = list(personas)
	}
	for i := range st.Personas {
		p := &st.Personas[i]
		for _, pr := range st.Problems {
			if names(pr.Personas, state.TypePersona, p.ID) {
				p.Problems = appendNew(p.Problems, state.DocRef(state.TypeProblem, pr.ID))
			}
		}
	}

	// A constraint's rules and mechanisms are those that respect it.
	for i := range st.Constraints {
		cn := &st.Constraints[i]
		for _, r := range st.Rules {
			if names(r.Respects, state.TypeConstraint, cn.ID) {
				cn.Rules = appendNew(cn.Rules, state.DocRef(state.TypeRule, r.ID))
			}
		}
		for _, m := range st.Mechanisms {
			if names(m.Respects, state.TypeConstraint, cn.ID) {
				cn.Mechanisms = appendNew(cn.Mechanisms, state.DocRef(state.TypeMechanism, m.ID))
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
		for i := range st.Personas {
			if names(in.Personas, state.TypePersona, st.Personas[i].ID) {
				st.Personas[i].Initiatives = appendNew(st.Personas[i].Initiatives, state.DocRef(state.TypeInitiative, in.ID))
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

// names reports whether refs links the doc of type typ with id.
func names(refs []string, typ, id string) bool {
	return slices.ContainsFunc(refs, func(raw string) bool {
		ref, ok := state.ParseRef(raw)
		return ok && ref.Type == typ && ref.ID == id
	})
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
func brokenLinks(fsys fs.FS, file string, data []byte) []state.Finding {
	var findings []state.Finding
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
				findings = append(findings, fileFinding(state.BrokenLink, file, i+1, fmt.Sprintf("The link to %s doesn't resolve.", m[1])))
			}
		}
	}
	return findings
}

// summarize counts the state at a glance.
func summarize(st *state.State) state.Summary {
	s := state.Summary{
		Areas:       len(st.Areas),
		Features:    distinct(len(st.Features), func(i int) string { return st.Features[i].ID }),
		Personas:    len(st.Personas),
		Problems:    len(st.Problems),
		Constraints: len(st.Constraints),
		Initiatives: len(st.Initiatives),
		Rules:       len(st.Rules),
		Gaps:        len(st.Gaps),
		Findings:    len(st.Findings),
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

// distinct is how many different IDs n entries have: a feature declared
// twice, a duplicate-id finding, is still one feature.
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
