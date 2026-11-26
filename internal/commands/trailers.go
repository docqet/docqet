package commands

import (
	"context"
	"fmt"
	"strings"

	"github.com/exalynt/docqet/internal/git"
	"github.com/exalynt/docqet/internal/index"
	"github.com/exalynt/docqet/internal/state"
)

// becameKey is the trailer that says what something a commit removed became.
const becameKey = "Docqet-Became"

// invalidTrailer is the type of a problem with a Docqet-Became trailer. It's
// check's own: trailers aren't part of a state, so the indexer never reports
// one.
const invalidTrailer = "invalid-trailer"

// checkTrailers checks every Docqet-Became trailer in the commits of rng:
// that it's written as <old> -> <new>, that <old> existed before the commit
// and <new> exists after it, and that no Docqet-Became line is left in a
// message's body, where git won't read it.
// docqet:implements capability:trailers
func checkTrailers(ctx context.Context, root, rng string) ([]state.Problem, error) {
	commits, err := git.Commits(ctx, root, rng)
	if err != nil {
		return nil, err
	}
	var problems []state.Problem
	for _, sha := range commits {
		message, trailers, err := git.Message(ctx, root, sha, becameKey)
		if err != nil {
			return nil, err
		}
		where := "commit " + short(sha)
		lines := 0
		for line := range strings.SplitSeq(message, "\n") {
			if strings.HasPrefix(strings.TrimSpace(line), becameKey+":") {
				lines++
			}
		}
		if lines > len(trailers) {
			problems = append(problems, state.Problem{Type: invalidTrailer, File: where,
				Message: "a Docqet-Became line isn't in the message's trailer block, its last paragraph, so git won't read it"})
		}
		if len(trailers) == 0 {
			continue
		}
		before, after, err := idsAround(ctx, root, sha)
		if err != nil {
			return nil, err
		}
		for _, t := range trailers {
			old, new, ok := strings.Cut(t, "->")
			old, new = strings.TrimSpace(old), strings.TrimSpace(new)
			_, oldOK := state.ParseRef(old)
			_, newOK := state.ParseRef(new)
			switch {
			case !ok || !oldOK || !newOK:
				problems = append(problems, state.Problem{Type: invalidTrailer, Subject: t, File: where,
					Message: "write it as <old reference> -> <new reference>"})
			case !hasID(before, old):
				problems = append(problems, state.Problem{Type: invalidTrailer, Subject: t, File: where,
					Message: fmt.Sprintf("%s didn't exist before this commit", old)})
			case !hasID(after, new):
				problems = append(problems, state.Problem{Type: invalidTrailer, Subject: t, File: where,
					Message: fmt.Sprintf("%s doesn't exist after this commit", new)})
			}
		}
	}
	return problems, nil
}

// idsAround returns what a commit's first parent and the commit itself
// declare, by reference.
func idsAround(ctx context.Context, root, sha string) (before, after map[string]bool, err error) {
	c, err := git.Show(ctx, root, sha)
	if err != nil {
		return nil, nil, err
	}
	after, err = idsAt(ctx, root, sha)
	if err != nil {
		return nil, nil, err
	}
	before = map[string]bool{}
	if len(c.Parents) > 0 {
		if before, err = idsAt(ctx, root, c.Parents[0]); err != nil {
			return nil, nil, err
		}
	}
	return before, after, nil
}

// idsAt returns every reference the project declares at a commit, or none
// when it had no docqet.yaml then.
func idsAt(ctx context.Context, root, sha string) (map[string]bool, error) {
	fsys, err := git.Tree(ctx, root, sha)
	if err != nil {
		return nil, err
	}
	st, err := index.Index(fsys)
	if err != nil {
		return map[string]bool{}, nil
	}
	return declaredIDs(st), nil
}

// declaredIDs is every reference a state declares: its docs, a rule or
// concept with its domain, and its gaps' and tradeoffs' IDs.
func declaredIDs(st *state.State) map[string]bool {
	ids := map[string]bool{}
	add := func(typ, id string) { ids[state.DocRef(typ, id)] = true }
	for _, d := range st.Domains {
		add(state.TypeDomain, d.ID)
	}
	for _, f := range st.Features {
		add(state.TypeFeature, f.ID)
	}
	for _, c := range st.Capabilities {
		add(state.TypeCapability, c.ID)
	}
	for _, r := range st.Rules {
		add(state.TypeRule, r.ID+"@"+r.Domain)
	}
	for _, c := range st.Concepts {
		add(state.TypeConcept, c.ID+"@"+c.Domain)
	}
	for _, p := range st.Personas {
		add(state.TypePersona, p.ID)
	}
	for _, i := range st.Initiatives {
		add(state.TypeInitiative, i.ID)
	}
	for _, m := range st.Mechanisms {
		add(state.TypeMechanism, m.ID)
	}
	for _, c := range st.Components {
		add(state.TypeComponent, c.ID)
	}
	for _, g := range st.Gaps {
		ids[g.ID] = true
	}
	for _, t := range st.Tradeoffs {
		ids[t.ID] = true
	}
	return ids
}

// hasID reports whether ids has ref. A rule or concept named without its
// domain matches one in any domain.
func hasID(ids map[string]bool, ref string) bool {
	if ids[ref] {
		return true
	}
	r, _ := state.ParseRef(ref)
	if (r.Type == state.TypeRule || r.Type == state.TypeConcept) && r.Domain == "" && r.Key == "" {
		for id := range ids {
			if strings.HasPrefix(id, ref+"@") {
				return true
			}
		}
	}
	return false
}
