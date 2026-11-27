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
// one: it's in when any contribution says so. A feature is in when a
// capability in it names it, an area when such a feature names it, and a
// problem when a capability in it solves it, in any project. It returns new
// states and
// never changes the ones it's given. With no initiative, it returns them as
// they are.
// docqet:implements capability:initiative-scope
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
		for _, in := range st.Initiatives {
			if in.ID != initiative {
				continue
			}
			for _, raw := range in.Personas {
				personas[state.DocRef(state.TypePersona, idOf(raw))] = true
			}
		}
	}
	problems := map[string]bool{}
	features := map[string]bool{}
	for _, st := range states {
		for _, c := range st.Capabilities {
			if !kept[state.DocRef(state.TypeCapability, c.ID)] {
				continue
			}
			for _, raw := range c.Solves {
				problems[state.DocRef(state.TypeProblem, idOf(raw))] = true
			}
			if c.Feature != nil {
				features[state.DocRef(state.TypeFeature, idOf(*c.Feature))] = true
			}
		}
	}
	areas := map[string]bool{}
	for _, st := range states {
		for _, f := range st.Features {
			if features[state.DocRef(state.TypeFeature, f.ID)] && f.Area != nil {
				areas[state.DocRef(state.TypeArea, idOf(*f.Area))] = true
			}
		}
	}
	in := keep{capabilities: kept, personas: personas, problems: problems, features: features, areas: areas}
	out := make([]*state.State, 0, len(states))
	for _, st := range states {
		out = append(out, scope(st, in))
	}
	// A constraint stays when a rule, capability, mechanism or component left
	// in respects it, or a problem left in is subject to it, in any project.
	respected := map[string]bool{}
	for _, st := range out {
		for _, c := range st.Capabilities {
			for _, raw := range c.Respects {
				respected[idOf(raw)] = true
			}
		}
		for _, c := range st.Components {
			for _, raw := range c.Respects {
				respected[idOf(raw)] = true
			}
		}
		for _, pr := range st.Problems {
			for _, raw := range pr.SubjectTo {
				respected[idOf(raw)] = true
			}
		}
		for _, r := range st.Rules {
			for _, raw := range r.Respects {
				respected[idOf(raw)] = true
			}
		}
		for _, m := range st.Mechanisms {
			for _, raw := range m.Respects {
				respected[idOf(raw)] = true
			}
		}
	}
	for _, st := range out {
		constraints := []state.Constraint{}
		for _, cn := range st.Constraints {
			if respected[cn.ID] {
				constraints = append(constraints, cn)
			}
		}
		st.Constraints = constraints
	}
	return out
}

// keep is what's in an initiative, by reference, across every project.
type keep struct {
	capabilities, personas, problems, features, areas map[string]bool
}

// scope is one project's state with only what's kept, and the product docs
// the kept capabilities reach. Rules and concepts no kept capability links
// go. A persona in the initiative stays even when nothing in it
// serves them yet. A problem stays when a kept capability solves it. Gaps and
// tradeoffs on a capability or feature that went go
// with it. Mechanisms and components stay, with what's left of their
// capabilities. Initiatives all stay, so each can still be chosen.
func scope(st *state.State, in keep) *state.State {
	kept := in.capabilities
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
	keptFeatures := in.features
	for _, f := range st.Features {
		if !keptFeatures[state.DocRef(state.TypeFeature, f.ID)] {
			continue
		}
		f.Capabilities = narrow(f.Capabilities)
		features = append(features, f)
	}

	linkedRules := map[string]bool{}
	linkedConcepts := map[string]bool{}
	for _, c := range capabilities {
		for _, r := range c.Rules {
			linkedRules[idOf(r)] = true
		}
		for _, r := range c.Concepts {
			linkedConcepts[idOf(r)] = true
		}
	}
	rules := []state.Rule{}
	for _, r := range st.Rules {
		if linkedRules[r.ID] {
			rules = append(rules, r)
			for _, ref := range r.Concepts {
				linkedConcepts[idOf(ref)] = true
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
	out.Areas = []state.Area{}
	for _, a := range st.Areas {
		if in.areas[state.DocRef(state.TypeArea, a.ID)] {
			out.Areas = append(out.Areas, a)
		}
	}
	out.Concepts = []state.Concept{}
	for _, c := range st.Concepts {
		if linkedConcepts[c.ID] {
			out.Concepts = append(out.Concepts, c)
		}
	}
	out.Personas = []state.Persona{}
	for _, p := range st.Personas {
		if in.personas[state.DocRef(state.TypePersona, p.ID)] {
			out.Personas = append(out.Personas, p)
		}
	}
	out.Problems = []state.Problem{}
	for _, pr := range st.Problems {
		if in.problems[state.DocRef(state.TypeProblem, pr.ID)] {
			pr.Capabilities = narrow(pr.Capabilities)
			out.Problems = append(out.Problems, pr)
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
	out.Findings = []state.Finding{}
	for _, p := range st.Findings {
		if len(p.Capabilities) == 0 || slices.ContainsFunc(p.Capabilities, func(ref string) bool {
			return kept[ref] || kept[state.DocRef(state.TypeCapability, ref)]
		}) {
			out.Findings = append(out.Findings, p)
		}
	}
	return &out
}
