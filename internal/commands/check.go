package commands

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"text/tabwriter"

	"github.com/urfave/cli/v3"

	"github.com/docqet/docqet/internal/git"
	"github.com/docqet/docqet/internal/index"
	"github.com/docqet/docqet/internal/state"
)

// CheckCommand reports what's wrong in the docs, annotations and commit trailers.
func CheckCommand() *cli.Command {
	return &cli.Command{
		Name:     "check",
		Category: reading,
		Usage:    "Report what's wrong in the docs, annotations and commit trailers",
		Description: `Indexes the working tree, or with --at a commit, and reports every finding,
with its file and line where it has one. It exits 1 when there are any but
advisory ones, such as a capability that solves no problem yet. The
server checks every state it's sent with the same check.`,
		ArgValidator: maxArgs(0),
		Flags: withSourceFlags(
			&cli.BoolFlag{Name: "changed", Usage: "only findings in files changed since the main branch"},
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
			findings := ix.state.Findings
			if cmd.Bool("changed") {
				if findings, err = onlyChanged(ctx, ix.root, cmd.String("base"), findings); err != nil {
					return err
				}
			}
			if rng := cmd.String("commits"); rng != "" {
				found, err := checkTrailers(ctx, ix.root, rng)
				if err != nil {
					return err
				}
				findings = append(findings, found...)
			}
			out := cmd.Root().Writer
			if cmd.Bool("json") {
				writeJSON(out, map[string]any{"source": ix.source, "findings": findings})
			} else {
				_, _ = fmt.Fprintf(out, "%s\n\n", ix.source.line())
				printFindings(cmd, findings)
			}
			for _, f := range findings {
				if !state.Advisory(f.Type) {
					return errFound
				}
			}
			return nil
		},
	}
}

// printFindings lists findings, one a line: where it is, its type, what it's
// about, and what's wrong.
func printFindings(cmd *cli.Command, findings []state.Finding) {
	out := cmd.Root().Writer
	if len(findings) == 0 {
		_, _ = fmt.Fprintln(out, "No findings.")
		return
	}
	tw := tabwriter.NewWriter(out, 0, 0, 2, ' ', 0)
	for _, p := range findings {
		where := p.File
		if p.Line > 0 {
			where += ":" + strconv.Itoa(p.Line)
		}
		_, _ = fmt.Fprintf(tw, "%s\t%s\t%s\t%s\n", where, p.Type, p.Subject, p.Message)
	}
	_ = tw.Flush()
	noun := "findings"
	if len(findings) == 1 {
		noun = "finding"
	}
	advisory := 0
	for _, f := range findings {
		if state.Advisory(f.Type) {
			advisory++
		}
	}
	if advisory == 0 {
		_, _ = fmt.Fprintf(out, "\n%d %s.\n", len(findings), noun)
		return
	}
	_, _ = fmt.Fprintf(out, "\n%d %s, %d advisory: advisory findings don't fail the check.\n", len(findings), noun, advisory)
}

// onlyChanged keeps the findings a change since base brought: those in the
// files it changed, and any other that wasn't there at base, such as an
// annotation left naming a gap the change removed. base is the main branch,
// origin/HEAD, when it's "".
// docqet:implements capability:checking
func onlyChanged(ctx context.Context, root, base string, findings []state.Finding) ([]state.Finding, error) {
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
			for _, p := range st.Findings {
				before[findingKey(p)] = true
			}
		}
	}
	in := map[string]bool{}
	for _, f := range changed {
		in[f] = true
	}
	kept := []state.Finding{}
	for _, p := range findings {
		if in[p.File] || !before[findingKey(p)] {
			kept = append(kept, p)
		}
	}
	return kept, nil
}

// findingKey is what makes two findings the same one, wherever they're found.
func findingKey(p state.Finding) string {
	return p.Type + "\x00" + p.Subject + "\x00" + p.File + "\x00" + p.Message
}
