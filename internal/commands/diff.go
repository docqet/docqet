package commands

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"strings"
	"text/tabwriter"

	"github.com/urfave/cli/v3"

	"github.com/docqet/docqet/internal/diff"
	"github.com/docqet/docqet/internal/git"
	"github.com/docqet/docqet/internal/index"
	"github.com/docqet/docqet/internal/project"
	"github.com/docqet/docqet/internal/state"
)

// DiffCommand shows what changed in Docqet between two points.
// docqet:implements capability:changes
func DiffCommand() *cli.Command {
	return &cli.Command{
		Name:         "diff",
		Category:     history,
		ArgValidator: maxArgs(2),
		Usage:        "What changed in Docqet between two points",
		ArgsUsage:    "[<from>] [<to>]",
		Description: `Compares two states of the project in Docqet's words. Each point is a commit,
branch or tag, or a state file. <from> is the last commit when it's left out,
and <to> is the working tree, or with --staged, what's staged. It lists what a
change removed with no Docqet-Became trailer saying what it became, for its
author to say in the commit.`,
		Flags: withSourceFlags(
			&cli.BoolFlag{Name: "staged", Usage: "compare the last commit with what's staged"},
		),
		Action: func(ctx context.Context, cmd *cli.Command) error {
			if err := notBuiltFlags(cmd.IsSet, "remote", "product", "project", "at"); err != nil {
				return err
			}
			wd, err := os.Getwd()
			if err != nil {
				return err
			}
			root, err := project.Find(wd)
			if err != nil {
				return err
			}
			args := cmd.Args().Slice()
			if cmd.Bool("staged") && len(args) > 1 {
				return errors.New("--staged compares with what's staged, so it takes at most <from>")
			}
			fromPoint, toPoint := "HEAD", ""
			if len(args) > 0 {
				fromPoint = args[0]
			}
			if len(args) > 1 {
				toPoint = args[1]
			}
			from, err := statePoint(ctx, root, fromPoint, false)
			if err != nil {
				return err
			}
			to, err := statePoint(ctx, root, toPoint, cmd.Bool("staged"))
			if err != nil {
				return err
			}
			became, err := becameBetween(ctx, root, from, to)
			if err != nil {
				return err
			}
			d := diff.Compare(from.state, to.state, became)
			out := cmd.Root().Writer
			if cmd.Bool("json") {
				writeJSON(out, map[string]any{"project": to.state.Project.ID, "from": from.label, "to": to.label, "changes": d.Changes, "unexplained": d.Unexplained})
				return nil
			}
			_, _ = fmt.Fprintf(out, "%s · %s → %s\n\n", to.state.Project.ID, from.label, to.label)
			printDiff(out, d)
			return nil
		},
	}
}

// point is one side of a diff: its state, what to call it, and its commit
// when it's one.
type point struct {
	state *state.State
	label string
	sha   string
}

// statePoint indexes one side of a diff: a commit, branch or tag, a state
// file, the working tree when p is "", or what's staged.
func statePoint(ctx context.Context, root, p string, staged bool) (point, error) {
	var (
		fsys  fs.FS
		err   error
		label string
		sha   string
	)
	switch {
	case staged:
		fsys, err = git.StagedTree(ctx, root)
		label = "staged"
	case p == "":
		fsys, err = git.WorkingTree(ctx, root)
		label = "working tree"
	case strings.HasSuffix(p, ".json"):
		data, err := os.ReadFile(p)
		if err != nil {
			return point{}, err
		}
		var st state.State
		if err := json.Unmarshal(data, &st); err != nil {
			return point{}, fmt.Errorf("%s isn't a state file: %w", p, err)
		}
		return point{state: &st, label: p}, nil
	default:
		if sha, err = git.Resolve(ctx, root, p); err != nil {
			return point{}, err
		}
		fsys, err = git.Tree(ctx, root, sha)
		label = fmt.Sprintf("%s (%s)", p, short(sha))
		if p == "HEAD" {
			label = fmt.Sprintf("last commit (%s)", short(sha))
		}
	}
	if err != nil {
		return point{}, err
	}
	st, err := index.Index(fsys)
	if errors.Is(err, fs.ErrNotExist) && sha != "" {
		// Before the project had a docqet.yaml, it declared nothing.
		return point{state: &state.State{}, label: label, sha: sha}, nil
	}
	if err != nil {
		return point{}, err
	}
	return point{state: st, label: label, sha: sha}, nil
}

// becameBetween reads the Docqet-Became trailers of the commits between two
// points: from from's commit to to's, or to HEAD when to isn't a commit.
func becameBetween(ctx context.Context, root string, from, to point) (map[string][]string, error) {
	if from.sha == "" {
		return nil, nil
	}
	end := to.sha
	if end == "" {
		end = "HEAD"
	}
	commits, err := git.Commits(ctx, root, from.sha+".."+end)
	if err != nil {
		return nil, err
	}
	var values []string
	for _, sha := range commits {
		_, trailers, err := git.Message(ctx, root, sha, becameKey)
		if err != nil {
			return nil, err
		}
		values = append(values, trailers...)
	}
	return diff.ParseBecame(values), nil
}

func printDiff(out io.Writer, d diff.Diff) {
	if len(d.Changes) == 0 {
		_, _ = fmt.Fprintln(out, "Nothing changed in Docqet.")
		return
	}
	tw := tabwriter.NewWriter(out, 0, 0, 2, ' ', 0)
	for _, c := range d.Changes {
		switch {
		case c.Kind == diff.Level:
			_, _ = fmt.Fprintf(tw, "%s\t%s → %s\n", c.Ref, c.From, c.To)
		case c.Kind == diff.Added || c.Kind == diff.Removed:
			_, _ = fmt.Fprintf(tw, "%s\t%s\n", c.Kind, c.Ref)
		case c.Detail != "":
			_, _ = fmt.Fprintf(tw, "%s\t%s\t%s\n", c.Kind, c.Ref, oneLine(c.Detail, 100))
		default:
			_, _ = fmt.Fprintf(tw, "%s\t%s\n", c.Kind, c.Ref)
		}
		for _, b := range c.Became {
			_, _ = fmt.Fprintf(tw, "  became\t%s\n", b)
		}
	}
	_ = tw.Flush()
	if len(d.Unexplained) > 0 {
		_, _ = fmt.Fprintln(out, "\nRemoved with no trailer yet. If any became something, say so in the commit message:")
		for _, ref := range d.Unexplained {
			_, _ = fmt.Fprintf(out, "  git commit --trailer \"%s: %s -> <what it became>\"\n", becameKey, ref)
		}
	}
}
