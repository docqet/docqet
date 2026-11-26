package commands

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/urfave/cli/v3"

	"github.com/exalynt/docket/internal/logs"
	"github.com/exalynt/docket/internal/project"
)

// uiAddr is where `docket ui` listens. It's loopback only, and can't be
// changed to listen anywhere else, so it can never be deployed as the server
// by mistake.
const uiAddr = "127.0.0.1:4100"

// UICommand serves the UI over this project, on this machine only.
//
// Until `docket index` is built, it shows the project's .docket/state.json as
// it is, and doesn't re-index as files change. Only the working tree can be
// shown: the source flags answer that they aren't built.
func UICommand() *cli.Command {
	return &cli.Command{
		Name:     "ui",
		Category: serving,
		Before:   maxArgs(0),
		Usage:    "Show the UI over the working tree, on this machine",
		Flags:    sourceFlags(),
		Action: func(ctx context.Context, cmd *cli.Command) error {
			if cmd.IsSet("at") || cmd.Bool("remote") || cmd.IsSet("product") || cmd.IsSet("project") {
				return errors.New("ui's --at, --remote, --product and --project aren't built yet: it shows the working tree only")
			}

			wd, err := os.Getwd()
			if err != nil {
				return err
			}
			root, err := project.Find(wd)
			if err != nil {
				return err
			}
			state := project.StatePath(root)
			if _, err := os.Stat(state); errors.Is(err, os.ErrNotExist) {
				return fmt.Errorf("%s has no .docket/state.json to show, and docket index isn't built yet to write one", root)
			}

			logger := logs.New(os.Stderr, "info", "text")
			logger.InfoContext(ctx, "showing the project's state as it is, without re-indexing", "state", state, "url", "http://"+uiAddr)

			handler, err := router(logger, []string{state})
			if err != nil {
				return err
			}
			return run(ctx, logger, uiAddr, handler)
		},
	}
}
