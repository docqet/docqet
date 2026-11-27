// Package diff compares two states of a project and says what changed in
// Docqet's words: docs added and removed, capabilities moving between
// levels, gaps, tradeoffs and decisions added and removed, evidence gained
// and lost, and findings made and fixed. It's pure: it reads only the
// states and trailers it's given.
package diff

import (
	"fmt"
	"slices"
	"strings"

	"github.com/docqet/docqet/internal/state"
)

// The kinds of change.
const (
	Added           = "added"
	Removed         = "removed"
	Level           = "level"
	GapAdded        = "gap added"
	GapRemoved      = "gap removed"
	TradeoffAdded   = "tradeoff added"
	TradeoffRemoved = "tradeoff removed"
	DecisionAdded   = "decision added"
	DecisionRemoved = "decision removed"
	EvidenceAdded   = "evidence added"
	EvidenceRemoved = "evidence removed"
	FindingAdded    = "finding added"
	FindingFixed    = "finding fixed"
)

// Change is one thing that changed.
type Change struct {
	Kind string `json:"kind"`
	// Ref is what changed: a doc's, gap's or tradeoff's reference, or for a
	// decision, the doc it's on.
	Ref string `json:"ref"`
	// From and To are a capability's levels, for a level change.
	From string `json:"from,omitempty"`
	To   string `json:"to,omitempty"`
	// Detail is a decision's question, evidence's verb and place, or a
	// finding's message.
	Detail string `json:"detail,omitempty"`
	// Became is what a removed thing became, as Docqet-Became trailers say.
	Became []string `json:"became,omitempty"`
}

// Diff is what changed between two states.
type Diff struct {
	Changes []Change `json:"changes"`
	// Unexplained is what was removed with no trailer saying what it
	// became. A decision can't be named, so it's never listed.
	Unexplained []string `json:"unexplained"`
}

// Compare returns what changed from one state to another. became maps a
// reference to what Docqet-Became trailers say it became.
func Compare(from, to *state.State, became map[string][]string) Diff {
	d := Diff{Changes: []Change{}, Unexplained: []string{}}
	a, b := docsOf(from), docsOf(to)
	for _, ref := range sortedKeys(a) {
		if _, ok := b[ref]; !ok {
			d.removed(Removed, ref, became)
		}
	}
	for _, ref := range sortedKeys(b) {
		if _, ok := a[ref]; !ok {
			d.Changes = append(d.Changes, Change{Kind: Added, Ref: ref})
		}
	}
	d.levels(from, to)

	oldGaps, newGaps := idsOf(from.Gaps, func(g state.Gap) string { return g.ID }), idsOf(to.Gaps, func(g state.Gap) string { return g.ID })
	d.items(oldGaps, newGaps, GapAdded, GapRemoved, became)
	oldTradeoffs, newTradeoffs := idsOf(from.Tradeoffs, func(t state.Tradeoff) string { return t.ID }), idsOf(to.Tradeoffs, func(t state.Tradeoff) string { return t.ID })
	d.items(oldTradeoffs, newTradeoffs, TradeoffAdded, TradeoffRemoved, became)

	oldDecisions, newDecisions := decisionsOf(from), decisionsOf(to)
	for _, k := range sortedKeys(oldDecisions) {
		if !newDecisions[k] {
			ref, q, _ := strings.Cut(k, "\x00")
			d.Changes = append(d.Changes, Change{Kind: DecisionRemoved, Ref: ref, Detail: q})
		}
	}
	for _, k := range sortedKeys(newDecisions) {
		if !oldDecisions[k] {
			ref, q, _ := strings.Cut(k, "\x00")
			d.Changes = append(d.Changes, Change{Kind: DecisionAdded, Ref: ref, Detail: q})
		}
	}

	oldEvidence, newEvidence := evidenceOf(a), evidenceOf(b)
	for _, k := range sortedKeys(newEvidence) {
		if !oldEvidence[k] {
			ref, detail, _ := strings.Cut(k, "\x00")
			d.Changes = append(d.Changes, Change{Kind: EvidenceAdded, Ref: ref, Detail: detail})
		}
	}
	for _, k := range sortedKeys(oldEvidence) {
		if !newEvidence[k] {
			ref, detail, _ := strings.Cut(k, "\x00")
			d.Changes = append(d.Changes, Change{Kind: EvidenceRemoved, Ref: ref, Detail: detail})
		}
	}

	oldFindings, newFindings := findingsOf(from), findingsOf(to)
	for _, k := range sortedKeys(newFindings) {
		if !oldFindings[k] {
			where, msg, _ := strings.Cut(k, "\x00")
			d.Changes = append(d.Changes, Change{Kind: FindingAdded, Ref: where, Detail: msg})
		}
	}
	for _, k := range sortedKeys(oldFindings) {
		if !newFindings[k] {
			where, msg, _ := strings.Cut(k, "\x00")
			d.Changes = append(d.Changes, Change{Kind: FindingFixed, Ref: where, Detail: msg})
		}
	}
	return d
}

// removed records something removed, with what it became, or as
// unexplained when no trailer says.
func (d *Diff) removed(kind, ref string, became map[string][]string) {
	c := Change{Kind: kind, Ref: ref, Became: became[ref]}
	if len(c.Became) == 0 {
		d.Unexplained = append(d.Unexplained, ref)
	}
	d.Changes = append(d.Changes, c)
}

func (d *Diff) items(old, new map[string]bool, added, removed string, became map[string][]string) {
	for _, id := range sortedKeys(old) {
		if !new[id] {
			d.removed(removed, id, became)
		}
	}
	for _, id := range sortedKeys(new) {
		if !old[id] {
			d.Changes = append(d.Changes, Change{Kind: added, Ref: id})
		}
	}
}

// levels records each capability whose level changed in a domain.
func (d *Diff) levels(from, to *state.State) {
	old := map[string]string{}
	for _, c := range from.Capabilities {
		old[c.ID+"@"+c.Domain] = c.Stability
	}
	for _, c := range to.Capabilities {
		was, ok := old[c.ID+"@"+c.Domain]
		if ok && was != c.Stability {
			ref := state.DocRef(state.TypeCapability, c.ID)
			if multiDomain(to, c.ID) {
				ref += " in " + c.Domain
			}
			d.Changes = append(d.Changes, Change{Kind: Level, Ref: ref, From: was, To: c.Stability})
		}
	}
}

func multiDomain(st *state.State, id string) bool {
	n := 0
	for _, c := range st.Capabilities {
		if c.ID == id {
			n++
		}
	}
	return n > 1
}

// docOf is what diff compares of a doc: its evidence and decisions.
type docOf struct {
	evidence  *state.Evidence
	decisions []state.Decision
}

// docsOf is every doc in a state, by reference. A capability written in
// several domains is one doc.
func docsOf(st *state.State) map[string]docOf {
	docs := map[string]docOf{}
	add := func(typ, id string, e *state.Evidence, ds []state.Decision) {
		ref := state.DocRef(typ, id)
		prev := docs[ref]
		if prev.evidence == nil {
			prev.evidence = e
		}
		prev.decisions = append(prev.decisions, ds...)
		docs[ref] = prev
	}
	for _, x := range st.Domains {
		add(state.TypeDomain, x.ID, nil, x.Decisions)
	}
	for _, x := range st.Features {
		add(state.TypeFeature, x.ID, nil, x.Decisions)
	}
	for i, x := range st.Capabilities {
		add(state.TypeCapability, x.ID, &st.Capabilities[i].Evidence, x.Decisions)
	}
	for i, x := range st.Rules {
		add(state.TypeRule, x.ID+"@"+x.Domain, &st.Rules[i].Evidence, nil)
	}
	for _, x := range st.Concepts {
		add(state.TypeConcept, x.ID+"@"+x.Domain, nil, nil)
	}
	for _, x := range st.Personas {
		add(state.TypePersona, x.ID, nil, nil)
	}
	for _, x := range st.Problems {
		add(state.TypeProblem, x.ID, nil, nil)
	}
	for _, x := range st.Initiatives {
		add(state.TypeInitiative, x.ID, nil, nil)
	}
	for i, x := range st.Mechanisms {
		add(state.TypeMechanism, x.ID, &st.Mechanisms[i].Evidence, x.Decisions)
	}
	for i, x := range st.Components {
		add(state.TypeComponent, x.ID, &st.Components[i].Evidence, x.Decisions)
	}
	return docs
}

func decisionsOf(st *state.State) map[string]bool {
	out := map[string]bool{}
	for ref, d := range docsOf(st) {
		for _, dec := range d.decisions {
			out[ref+"\x00"+strings.Join(strings.Fields(dec.Question), " ")] = true
		}
	}
	return out
}

// evidenceOf is every piece of evidence, by what it's for, its verb, its
// file and the text it's on. Lines aren't compared, so evidence that only
// moved within its file hasn't changed.
func evidenceOf(docs map[string]docOf) map[string]bool {
	out := map[string]bool{}
	for ref, d := range docs {
		if d.evidence == nil {
			continue
		}
		for verb, places := range map[string][]state.Place{"implements": d.evidence.Implements, "verifies": d.evidence.Verifies} {
			for _, p := range places {
				out[fmt.Sprintf("%s\x00%s %s: %s", ref, verb, p.File, p.Text)] = true
			}
		}
	}
	return out
}

func findingsOf(st *state.State) map[string]bool {
	out := map[string]bool{}
	for _, p := range st.Findings {
		where := p.Subject
		if where == "" {
			where = p.File
		}
		out[where+"\x00"+p.Type+": "+p.Message] = true
	}
	return out
}

func idsOf[T any](list []T, id func(T) string) map[string]bool {
	out := map[string]bool{}
	for _, x := range list {
		out[id(x)] = true
	}
	return out
}

func sortedKeys[V any](m map[string]V) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	slices.Sort(keys)
	return keys
}

// ParseBecame reads Docqet-Became trailer values, <old> -> <new>, into what
// each old reference became. Values not written that way are skipped: check
// --commits reports them.
func ParseBecame(values []string) map[string][]string {
	out := map[string][]string{}
	for _, v := range values {
		old, new, ok := strings.Cut(v, "->")
		if !ok {
			continue
		}
		old, new = strings.TrimSpace(old), strings.TrimSpace(new)
		if old != "" && new != "" {
			out[old] = append(out[old], new)
		}
	}
	return out
}
