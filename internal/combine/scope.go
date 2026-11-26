package combine

import (
	"slices"
	"strings"

	"github.com/docqet/docqet/internal/state"
)

// ScopeToInitiative narrows each project's state to one initiative, before
// the states are combined, so everything worked out from the result counts
// only what's in it. Whether a capability or persona is in the initiative is
// decided across every project first, since projects contribute to the same
// one: it's in when any contribution says so. It returns new states and
// never changes the ones it's given. With no initiative, it returns them as
// they are.
func ScopeToInitiative(states []*state.State, initiative string) []*state.State {
	if initiative == "" {
		return states
	}
	ref := state.DocRef(state.TypeInitiative, initiative)
	kept := map[string]bool{}
	personas := map[string]bool{}
	for _, st := range states {
		for _, c := range st.Capabilities {
			if slices.Contains(c.Initiatives, ref) {
				kept[state.DocRef(state.TypeCapability, c.ID)] = true
			}
		}
		for _, p := range st.Personas {
			if slices.Contains(p.Initiatives, ref) {
				personas[state.DocRef(state.TypePersona, p.ID)] = true
			}
		}
	}
	out := make([]*state.State, 0, len(states))
	for _, st := range states {
		out = append(out, scope(st, kept, personas))
	}
	return out
}

// scope is one project's state with only the capabilities and personas
// kept, and the product docs those capabilities reach. A feature or domain
// left with none of them goes, and so do rules and concepts no kept
// capability links. A persona in the initiative stays even when nothing in it
// serves them yet. Gaps and tradeoffs on a capability or feature that went go
// with it. Mechanisms and components stay, with what's left of their
// capabilities. Initiatives all stay, so each can still be chosen.
func scope(st *state.State, kept, personas map[string]bool) *state.State {
	narrow := func(refs []string) []string {
		out := []string{}
		for _, r := range refs {
			if kept[r] {
				out = append(out, r)
			}
		}
		return out
	}

	capabilities := []state.Capability{}
	for _, c := range st.Capabilities {
		if kept[state.DocRef(state.TypeCapability, c.ID)] {
			capabilities = append(capabilities, c)
		}
	}

	features := []state.Feature{}
	keptFeatures := map[string]bool{}
	domains := map[string]bool{}
	for _, f := range st.Features {
		f.Capabilities = narrow(f.Capabilities)
		if len(f.Capabilities) == 0 {
			continue
		}
		features = append(features, f)
		keptFeatures[state.DocRef(state.TypeFeature, f.ID)] = true
		domains[f.Domain] = true
	}
	for _, c := range capabilities {
		domains[c.Domain] = true
	}

	// A rule or concept link means the domain it names, else the linking
	// doc's own, keyed <id>@<domain>.
	key := func(ref, domain string) string { return inDomain(idOf(ref), domain) }
	linkedRules := map[string]bool{}
	linkedConcepts := map[string]bool{}
	for _, c := range capabilities {
		for _, r := range c.Rules {
			linkedRules[key(r, c.Domain)] = true
		}
		for _, r := range c.Concepts {
			linkedConcepts[key(r, c.Domain)] = true
		}
	}
	rules := []state.Rule{}
	for _, r := range st.Rules {
		if linkedRules[r.ID+"@"+r.Domain] {
			rules = append(rules, r)
			for _, ref := range r.Concepts {
				linkedConcepts[key(ref, r.Domain)] = true
			}
		}
	}

	// A gap or tradeoff ID is <what it's on>#<key>.
	onKept := func(id string) bool {
		on, _, _ := strings.Cut(id, "#")
		switch {
		case strings.HasPrefix(on, state.TypeCapability+":"):
			return kept[on]
		case strings.HasPrefix(on, state.TypeFeature+":"):
			return keptFeatures[on]
		}
		return true
	}

	out := *st
	out.Features = features
	out.Capabilities = capabilities
	out.Rules = rules
	out.Domains = []state.Domain{}
	for _, d := range st.Domains {
		if domains[d.ID] {
			out.Domains = append(out.Domains, d)
		}
	}
	out.Concepts = []state.Concept{}
	for _, c := range st.Concepts {
		if linkedConcepts[c.ID+"@"+c.Domain] {
			out.Concepts = append(out.Concepts, c)
		}
	}
	out.Personas = []state.Persona{}
	for _, p := range st.Personas {
		if personas[state.DocRef(state.TypePersona, p.ID)] {
			out.Personas = append(out.Personas, p)
		}
	}
	out.Mechanisms = make([]state.Mechanism, 0, len(st.Mechanisms))
	for _, m := range st.Mechanisms {
		m.Capabilities = narrow(m.Capabilities)
		out.Mechanisms = append(out.Mechanisms, m)
	}
	out.Components = make([]state.Component, 0, len(st.Components))
	for _, m := range st.Components {
		m.Capabilities = narrow(m.Capabilities)
		out.Components = append(out.Components, m)
	}
	out.Gaps = []state.Gap{}
	for _, g := range st.Gaps {
		if onKept(g.ID) {
			out.Gaps = append(out.Gaps, g)
		}
	}
	out.Tradeoffs = []state.Tradeoff{}
	for _, t := range st.Tradeoffs {
		if onKept(t.ID) {
			out.Tradeoffs = append(out.Tradeoffs, t)
		}
	}
	out.Problems = []state.Problem{}
	for _, p := range st.Problems {
		if len(p.Capabilities) == 0 || slices.ContainsFunc(p.Capabilities, func(ref string) bool {
			return kept[ref] || kept[state.DocRef(state.TypeCapability, ref)]
		}) {
			out.Problems = append(out.Problems, p)
		}
	}
	return &out
}
