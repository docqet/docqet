package commands

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"

	"github.com/urfave/cli/v3"

	"github.com/exalynt/docqet/internal/logs"
	"github.com/exalynt/docqet/internal/project"
	"github.com/exalynt/docqet/internal/services"
	"github.com/exalynt/docqet/internal/state"
)

// uiAddr is where `docqet ui` listens. It's loopback only, and can't be
// changed to listen anywhere else, so it can never be deployed as the server
// by mistake.
const uiAddr = "127.0.0.1:4100"

// UICommand serves the UI over this project, on this machine only: the
// server's API, over the project's .docqet/state.json as docqet index wrote
// it, read on every request, so re-indexing shows on reload. It doesn't
// index the working tree itself. Only the working tree can be shown: the
// source flags answer that they aren't built.
// docqet:implements capability:local-viewer
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
				return fmt.Errorf("%s has no .docqet/state.json to show: run docqet index first", root)
			}

			logger := logs.New(os.Stderr, "info", "text")
			logger.InfoContext(ctx, "showing the project's state as it is, without re-indexing", "state", state, "url", "http://"+uiAddr)

			handler, err := router(logger, fileState(state), nil)
			if err != nil {
				return err
			}
			return run(ctx, logger, uiAddr, handler)
		},
	}
}

// fileState is the state.json at path, read on every call, as the only
// project's latest state.
func fileState(path string) services.StateSource {
	return func(context.Context) ([]*state.State, error) {
		body, err := os.ReadFile(path)
		if err != nil {
			return nil, err
		}
		var st state.State
		if err := json.Unmarshal(body, &st); err != nil {
			return nil, fmt.Errorf("%s: %w", path, err)
		}
		return []*state.State{&st}, nil
	}
}
