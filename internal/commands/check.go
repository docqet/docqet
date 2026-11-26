package commands

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"text/tabwriter"

	"github.com/urfave/cli/v3"

	"github.com/docqet/docqet/internal/git"
	"github.com/docqet/docqet/internal/index"
	"github.com/docqet/docqet/internal/state"
)

// CheckCommand finds problems in the docs, annotations and commit trailers.
func CheckCommand() *cli.Command {
	return &cli.Command{
		Name:     "check",
		Category: reading,
		Usage:    "Find problems in the docs, annotations and commit trailers",
		Description: `Indexes the working tree, or with --at a commit, and reports every problem,
with its file and line where it has one. It exits 1 when there are any. The
server checks every state it's sent with the same check.`,
		ArgValidator: maxArgs(0),
		Flags: withSourceFlags(
			&cli.BoolFlag{Name: "changed", Usage: "only problems in files changed since the main branch"},
			&cli.StringFlag{Name: "base", Usage: "with --changed, changed since `REV` instead of origin/HEAD"},
			&cli.StringFlag{Name: "commits", Usage: "also check the Docqet trailers in `RANGE`, such as origin/main..HEAD"},
		),
		Action: func(ctx context.Context, cmd *cli.Command) error {
			if err := notBuiltFlags(cmd.IsSet, "remote", "product", "project"); err != nil {
				return err
			}
			if cmd.IsSet("base") && !cmd.Bool("changed") {
				return errors.New("--base goes with --changed")
			}
			ix, err := indexHere(ctx, cmd.String("at"))
			if err != nil {
				return err
			}
			problems := ix.state.Problems
			if cmd.Bool("changed") {
				if problems, err = onlyChanged(ctx, ix.root, cmd.String("base"), problems); err != nil {
					return err
				}
			}
			if rng := cmd.String("commits"); rng != "" {
				found, err := checkTrailers(ctx, ix.root, rng)
				if err != nil {
					return err
				}
				problems = append(problems, found...)
			}
			out := cmd.Root().Writer
			if cmd.Bool("json") {
				writeJSON(out, map[string]any{"source": ix.source, "problems": problems})
			} else {
				_, _ = fmt.Fprintf(out, "%s\n\n", ix.source.line())
				printProblems(cmd, problems)
			}
			if len(problems) > 0 {
				return errFound
			}
			return nil
		},
	}
}

// printProblems lists problems, one a line: where it is, its type, what it's
// about, and what's wrong.
func printProblems(cmd *cli.Command, problems []state.Problem) {
	out := cmd.Root().Writer
	if len(problems) == 0 {
		_, _ = fmt.Fprintln(out, "No problems.")
		return
	}
	tw := tabwriter.NewWriter(out, 0, 0, 2, ' ', 0)
	for _, p := range problems {
		where := p.File
		if p.Line > 0 {
			where += ":" + strconv.Itoa(p.Line)
		}
		about := p.Subject
		// A rule's or concept's ID is one in its domain, so it's shown with it.
		if p.Domain != "" && (strings.HasPrefix(about, "rule:") || strings.HasPrefix(about, "concept:")) {
			about += "@" + p.Domain
		}
		_, _ = fmt.Fprintf(tw, "%s\t%s\t%s\t%s\n", where, p.Type, about, p.Message)
	}
	_ = tw.Flush()
	noun := "problems"
	if len(problems) == 1 {
		noun = "problem"
	}
	_, _ = fmt.Fprintf(out, "\n%d %s.\n", len(problems), noun)
}

// onlyChanged keeps the problems a change since base brought: those in the
// files it changed, and any other that wasn't there at base, such as an
// annotation left naming a gap the change removed. base is the main branch,
// origin/HEAD, when it's "".
// docqet:implements capability:checking
func onlyChanged(ctx context.Context, root, base string, problems []state.Problem) ([]state.Problem, error) {
	if base == "" {
		var err error
		if base, err = git.DefaultBase(ctx, root); err != nil {
			return nil, err
		}
	}
	changed, err := git.Changed(ctx, root, base)
	if err != nil {
		return nil, err
	}
	mb, err := git.MergeBase(ctx, root, base)
	if err != nil {
		return nil, err
	}
	before := map[string]bool{}
	if fsys, err := git.Tree(ctx, root, mb); err == nil {
		if st, err := index.Index(fsys); err == nil {
			for _, p := range st.Problems {
				before[problemKey(p)] = true
			}
		}
	}
	in := map[string]bool{}
	for _, f := range changed {
		in[f] = true
	}
	kept := []state.Problem{}
	for _, p := range problems {
		if in[p.File] || !before[problemKey(p)] {
			kept = append(kept, p)
		}
	}
	return kept, nil
}

// problemKey is what makes two problems the same one, wherever they're found.
func problemKey(p state.Problem) string {
	return p.Type + "\x00" + p.Subject + "\x00" + p.File + "\x00" + p.Message
}
