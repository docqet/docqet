package commands

import (
	"context"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"time"

	"github.com/urfave/cli/v3"

	"github.com/docqet/docqet/internal/check"
	"github.com/docqet/docqet/internal/client"
	"github.com/docqet/docqet/internal/git"
	"github.com/docqet/docqet/internal/index"
	"github.com/docqet/docqet/internal/project"
	"github.com/docqet/docqet/internal/state"
)

// becameTrailer is the trailer that says what something a commit removed
// became.
const becameTrailer = "Docqet-Became"

// ApplyCommand sends the main branch's new commits to the server.
func ApplyCommand() *cli.Command {
	return &cli.Command{
		Name:     "apply",
		Category: onServer,
		Usage:    "Send the main branch's new commits to the server",
		Description: `Asks the server for the last commit it has for this project, then indexes
each commit after it on HEAD's first-parent line, oldest first, read from git,
and sends each one's state with its parents, commit time and Docqet trailers.
Sending a commit twice changes nothing, so a retried job is harmless. Run it on
the main branch: CI decides when.

A project's first apply sends HEAD alone, unless --from says where to start.
The server is the one in docqet.yaml's server field, or DOCQET_SERVER.`,
		ArgValidator: maxArgs(0),
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "from", Usage: "start at `REV`, for a project's first apply or a backfill"},
			&cli.BoolFlag{Name: "replace", Usage: "with --from, send again the commits the server already has"},
			&cli.BoolFlag{Name: "dry-run", Usage: "show what would be sent, without sending it"},
		},
		Action: apply,
	}
}

// sent is what apply did with one commit.
type sent struct {
	Commit      string `json:"commit"`
	CommittedAt string `json:"committedAt"`
	Problems    int    `json:"problems"`
	Result      string `json:"result"` // created, replaced, skipped or would-send
}

func apply(ctx context.Context, cmd *cli.Command) error {
	if cmd.Bool("replace") && cmd.String("from") == "" {
		return errors.New("--replace needs --from: which commits to send again")
	}
	wd, err := os.Getwd()
	if err != nil {
		return err
	}
	root, err := project.Find(wd)
	if err != nil {
		return err
	}
	cfg, err := project.ReadConfig(os.DirFS(root))
	if err != nil {
		return err
	}
	server := os.Getenv("DOCQET_SERVER")
	if server == "" {
		server = cfg.Server
	}
	if server == "" {
		return errors.New("no server to send to: set server in docqet.yaml, or DOCQET_SERVER")
	}
	if !git.IsRepository(ctx, root) {
		return errors.New("apply sends commits, so the project must be in a git repository")
	}
	head, err := git.Resolve(ctx, root, "HEAD")
	if err != nil {
		return err
	}

	srv := client.New(server)
	id := cfg.Project.ID
	commits, note, err := commitsToSend(ctx, cmd, srv, root, id, head)
	if err != nil {
		return err
	}

	out := cmd.Root().Writer
	asJSON := cmd.Bool("json")
	if !asJSON {
		_, _ = fmt.Fprintf(out, "%s → %s\n\n", id, server)
		if note != "" {
			_, _ = fmt.Fprintf(out, "%s\n\n", note)
		}
	}

	var results []sent
	for _, sha := range commits {
		result, err := applyCommit(ctx, cmd, srv, root, id, sha)
		if err != nil {
			return fmt.Errorf("%s: %w", short(sha), err)
		}
		results = append(results, result)
		if !asJSON {
			_, _ = fmt.Fprintf(out, "%s  %s  %-10s  %d problems\n", short(result.Commit), result.CommittedAt, result.Result, result.Problems)
		}
	}

	if asJSON {
		if results == nil {
			results = []sent{}
		}
		writeJSON(out, map[string]any{"server": server, "project": id, "head": head, "commits": results})
		return nil
	}
	if len(results) == 0 {
		_, _ = fmt.Fprintf(out, "The server is up to date at %s.\n", short(head))
	}
	return nil
}

// commitsToSend works out which commits to send, oldest first: from --from,
// or after the server's last commit, to HEAD, along its first-parent line.
func commitsToSend(ctx context.Context, cmd *cli.Command, srv *client.Client, root, id, head string) (commits []string, note string, err error) {
	if from := cmd.String("from"); from != "" {
		start, err := git.Resolve(ctx, root, from)
		if err != nil {
			return nil, "", err
		}
		if ok, err := git.IsAncestor(ctx, root, start, head); err != nil || !ok {
			return nil, "", fmt.Errorf("%s isn't in HEAD's history", from)
		}
		rest, err := git.FirstParents(ctx, root, start, head)
		if err != nil {
			return nil, "", err
		}
		return append([]string{start}, rest...), "", nil
	}

	p, err := srv.GetProject(ctx, id)
	if errors.Is(err, client.ErrNotFound) {
		return []string{head}, "The server has nothing for this project yet, so this sends HEAD alone. --from sends its history.", nil
	}
	if err != nil {
		return nil, "", err
	}
	last := p.LastCommit.Commit
	ok, err := git.IsAncestor(ctx, root, last, head)
	if err != nil {
		return nil, "", fmt.Errorf("the server's last commit, %s, isn't in this repository: %w", short(last), err)
	}
	if !ok {
		return nil, "", fmt.Errorf("the server's last commit, %s, isn't in HEAD's history, so the main branch may have been rewritten: --from says where to start", short(last))
	}
	commits, err = git.FirstParents(ctx, root, last, head)
	return commits, "", err
}

// applyCommit indexes one commit from git and sends it, unless the server
// has it already and --replace wasn't given with --from, or it's a dry run.
func applyCommit(ctx context.Context, cmd *cli.Command, srv *client.Client, root, id, sha string) (sent, error) {
	info, err := git.Show(ctx, root, sha)
	if err != nil {
		return sent{}, err
	}
	result := sent{Commit: sha, CommittedAt: info.CommittedAt.UTC().Format(time.RFC3339)}

	if cmd.String("from") != "" && !cmd.Bool("replace") {
		has, err := srv.HasCommit(ctx, id, sha)
		if err != nil {
			return sent{}, err
		}
		if has {
			result.Result = "skipped"
			return result, nil
		}
	}

	fsys, err := git.Tree(ctx, root, sha)
	if err != nil {
		return sent{}, err
	}
	st, err := index.Index(fsys)
	if errors.Is(err, fs.ErrNotExist) {
		return sent{}, errors.New("the project has no docqet.yaml at this commit")
	}
	if err != nil {
		return sent{}, err
	}
	st.Commit = sha
	st.IndexedAt = time.Now().UTC().Format(time.RFC3339)
	// The server refuses a state that isn't one with this same check, so a
	// state that fails it here is docqet's bug, not the project's.
	if err := check.Validate(st); err != nil {
		return sent{}, fmt.Errorf("the state indexed isn't valid: %w", err)
	}
	result.Problems = len(st.Problems)

	values, err := git.Trailers(ctx, root, sha, becameTrailer)
	if err != nil {
		return sent{}, err
	}
	trailers := make([]state.Trailer, 0, len(values))
	for _, v := range values {
		trailers = append(trailers, state.Trailer{Key: becameTrailer, Value: v})
	}
	parents := info.Parents
	if parents == nil {
		parents = []string{}
	}

	if cmd.Bool("dry-run") {
		result.Result = "would-send"
		return result, nil
	}
	created, err := srv.ApplyCommit(ctx, id, sha, state.Applied{
		Parents:     parents,
		CommittedAt: info.CommittedAt.UTC().Format(time.RFC3339),
		Trailers:    trailers,
		State:       *st,
	})
	if err != nil {
		return sent{}, err
	}
	result.Result = "replaced"
	if created {
		result.Result = "created"
	}
	return result, nil
}
