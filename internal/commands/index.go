package commands

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/urfave/cli/v3"

	"github.com/exalynt/docqet/internal/project"
	"github.com/exalynt/docqet/internal/state"
)

// IndexCommand writes the project's state, for the working tree or a commit.
func IndexCommand() *cli.Command {
	return &cli.Command{
		Name:     "index",
		Category: settingUp,
		Usage:    "Write the state for the working tree or a commit",
		Description: `Reads the project's docs and annotations and writes its state: the working
tree's, uncommitted changes included, to .docqet/state.json, or with --at, a
commit's, read from git without checking it out, to .docqet/history/<sha>.json.`,
		Before: maxArgs(0),
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "at", Usage: "index `REV`, read from git without checking it out"},
			&cli.BoolFlag{Name: "stdout", Usage: "print the state instead of writing it"},
		},
		Action: func(ctx context.Context, cmd *cli.Command) error {
			ix, err := indexHere(ctx, cmd.String("at"))
			if err != nil {
				return err
			}
			out := cmd.Root().Writer
			if cmd.Bool("stdout") {
				writeJSON(out, ix.state)
				return nil
			}

			path := project.StatePath(ix.root)
			if ix.source.When == "commit" {
				path = filepath.Join(ix.root, ".docqet", "history", ix.state.Commit+".json")
			}
			if err := writeState(path, ix.state); err != nil {
				return err
			}
			rel, _ := filepath.Rel(ix.root, path)
			if cmd.Bool("json") {
				writeJSON(out, map[string]any{"source": ix.source, "file": rel, "summary": ix.state.Summary})
				return nil
			}
			s := ix.state.Summary
			caps := s.Capabilities.Draft + s.Capabilities.Prototype + s.Capabilities.Alpha + s.Capabilities.Beta + s.Capabilities.GA
			_, _ = fmt.Fprintf(out, "%s\n\nWrote %s: %d capabilities, %d rules, %d gaps, %d tradeoffs, %d problems.\n",
				ix.source.line(), rel, caps, s.Rules, s.Gaps, s.Tradeoffs, s.Problems)
			return nil
		},
	}
}

// writeState writes st to path as indented JSON, making its folder.
func writeState(path string, st *state.State) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(st, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, append(data, '\n'), 0o644)
}
