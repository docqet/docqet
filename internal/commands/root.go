// Package commands holds every `docket` command, one file each, as
// cmd/docket/README.md drafts them. Most are scaffolded and not built yet:
// they take their drafted flags and answer that they aren't built.
package commands

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"slices"
	"strings"

	"github.com/urfave/cli/v3"
)

// The categories commands are grouped under in help, as in the draft.
const (
	settingUp = "Setting up"
	reading   = "Reading"
	changing  = "Changing"
	history   = "History"
	onServer  = "Acting on the server"
	serving   = "Serving"
)

// Exit codes, the same for every command.
const (
	// exitOK is for when everything's fine.
	exitOK = 0
	// exitFound is for when a command ran and found what it was asked to fail
	// on, such as a problem in check.
	exitFound = 1
	// exitCouldNotRun is for when a command couldn't run: bad usage, not in a
	// project, a server it couldn't reach, or a command not built yet.
	exitCouldNotRun = 2
)

// errFound is returned by a command that ran and found what it was asked to
// fail on, once it has printed what it found. It exits 1, with nothing more
// printed.
var errFound = errors.New("found what it was asked to fail on")

// Root builds the docket command and every command under it.
func Root(version string) *cli.Command {
	root := &cli.Command{
		Name:    "docket",
		Usage:   "What software can do, who it serves, and how ready it is",
		Version: version,
		Flags: []cli.Flag{
			&cli.BoolFlag{
				Name:  "json",
				Usage: "print only JSON to stdout, even on failure",
			},
			&cli.StringFlag{
				Name:    "directory",
				Aliases: []string{"C"},
				Usage:   "run as if started in `DIR`, as git's -C does",
			},
		},
		Before: func(ctx context.Context, cmd *cli.Command) (context.Context, error) {
			if dir := cmd.String("directory"); dir != "" {
				if err := os.Chdir(dir); err != nil {
					return ctx, err
				}
			}
			return ctx, nil
		},
		Commands: []*cli.Command{
			InitCommand(),
			KitCommand(),
			IndexCommand(),
			CheckCommand(),
			TouchesCommand(),
			ShowCommand(),
			ListCommand(),
			StatusCommand(),
			ChecklistCommand(),
			RenameCommand(),
			DiffCommand(),
			LogCommand(),
			HistoryCommand(),
			PreviewCommand(),
			ApplyCommand(),
			ResultsCommand(),
			UICommand(),
			ServeCommand(),
			MigrateCommand(),
		},
	}
	returnUsageErrors(root)
	return root
}

// returnUsageErrors makes cmd and every command under it return a usage
// error, such as an unknown flag, rather than print it and the help, so
// Finish reports it like any other error and --json keeps stdout to JSON.
func returnUsageErrors(cmd *cli.Command) {
	cmd.OnUsageError = func(_ context.Context, _ *cli.Command, err error, _ bool) error {
		return err
	}
	for _, sub := range cmd.Commands {
		returnUsageErrors(sub)
	}
}

// Finish reports err, if there is one, and returns the code to exit with.
// With --json, the error is a JSON object with an error field on stdout, so
// stdout is only ever JSON. Otherwise it's a line on stderr.
func Finish(root *cli.Command, args []string, err error) int {
	if err == nil {
		return exitOK
	}
	if errors.Is(err, errFound) {
		return exitFound
	}
	if wantsJSON(root, args) {
		writeJSON(root.Writer, map[string]string{"error": err.Error()})
	} else {
		_, _ = fmt.Fprintf(root.ErrWriter, "docket: %s\n", err)
	}
	return exitCouldNotRun
}

// wantsJSON reports whether --json was given. A usage error can stop parsing
// before it reaches --json, so the arguments are checked too.
func wantsJSON(root *cli.Command, args []string) bool {
	return root.Bool("json") || slices.Contains(args, "--json")
}

// writeJSON writes v to w as indented JSON.
func writeJSON(w io.Writer, v any) {
	enc := json.NewEncoder(w)
	enc.SetIndent("", "  ")
	_ = enc.Encode(v)
}

// notBuilt is what a scaffolded command answers until it's built.
func notBuilt(cmd *cli.Command) error {
	return fmt.Errorf("%s isn't built yet: cmd/docket/README.md drafts what it will do", strings.TrimPrefix(cmd.FullName(), "docket "))
}

// notBuiltAction is the action of every command not built yet.
func notBuiltAction(_ context.Context, cmd *cli.Command) error {
	return notBuilt(cmd)
}
