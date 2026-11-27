package check

import (
	"errors"
	"fmt"
	"strings"

	"github.com/docqet/docqet/internal/state"
)

// Validate reports whether st is a state at all, as index writes one: the
// format's version, a project, and an ID for every entry. A state that isn't
// one is refused. Findings in the docs aren't its business: a state with
// findings is still a state, and Check finds them.
func Validate(st *state.State) error {
	var errs []string
	fail := func(format string, args ...any) {
		errs = append(errs, fmt.Sprintf(format, args...))
	}
	if st.Docqet != state.Version {
		fail("docqet is %q, and this server reads %q", st.Docqet, state.Version)
	}
	if !state.IsKebab(st.Project.ID) || st.Project.Name == "" {
		fail("the project needs a kebab-case id and a name")
	}
	if st.Product != nil && (!state.IsKebab(st.Product.ID) || st.Product.Name == "") {
		fail("the product needs a kebab-case id and a name")
	}
	entry := func(kind, id, file string) {
		if id == "" || file == "" {
			fail("every %s needs an id and a file", kind)
		}
	}
	for _, a := range st.Areas {
		entry("area", a.ID, a.File)
	}
	for _, f := range st.Features {
		entry("feature", f.ID, f.File)
	}
	for _, c := range st.Capabilities {
		entry("capability", c.ID, c.File)
	}
	for _, r := range st.Rules {
		entry("rule", r.ID, r.File)
	}
	for _, c := range st.Concepts {
		entry("concept", c.ID, c.File)
	}
	for _, p := range st.Personas {
		entry("persona", p.ID, p.File)
	}
	for _, pr := range st.Problems {
		entry("problem", pr.ID, pr.File)
	}
	for _, cn := range st.Constraints {
		entry("constraint", cn.ID, cn.File)
	}
	for _, in := range st.Initiatives {
		entry("initiative", in.ID, in.File)
	}
	for _, m := range st.Mechanisms {
		entry("mechanism", m.ID, m.File)
	}
	for _, c := range st.Components {
		entry("component", c.ID, c.File)
	}
	for _, g := range st.Gaps {
		if ref, ok := state.ParseRef(g.ID); !ok || ref.Key == "" {
			fail("gap %q isn't a gap's ID: <doc>#<key>", g.ID)
		}
	}
	for _, t := range st.Tradeoffs {
		if ref, ok := state.ParseRef(t.ID); !ok || ref.Key == "" {
			fail("tradeoff %q isn't a tradeoff's ID: <doc>#<key>", t.ID)
		}
	}
	for _, p := range st.Findings {
		if p.Type == "" {
			fail("every finding needs a type")
		}
	}
	if len(st.Rubric.Qualities) == 0 {
		fail("the state carries no rubric")
	}
	if len(errs) == 0 {
		return nil
	}
	if len(errs) > 5 {
		errs = append(errs[:5], fmt.Sprintf("and %d more", len(errs)-5))
	}
	return errors.New(strings.Join(errs, "; "))
}

// Recheck works out st's findings again with Check, keeping only the
// findings it carries that Check can't find, those found reading files, so
// what st says about its docs is always this check's own.
// docqet:implements rule:same-findings-everywhere
func Recheck(st *state.State) {
	var kept []state.Finding
	for _, p := range st.Findings {
		if !Recheckable(p) {
			kept = append(kept, p)
		}
	}
	st.Findings = append(kept, Check(st)...)
	if st.Findings == nil {
		st.Findings = []state.Finding{}
	}
	st.Summary.Findings = len(st.Findings)
}
