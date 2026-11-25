package commands

import "github.com/urfave/cli/v3"

// HistoryCommand indexes every commit on a branch, for history offline.
func HistoryCommand() *cli.Command {
	return &cli.Command{
		Name:     "history",
		Category: history,
		Usage:    "Index every commit on a branch, for history offline",
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "since", Usage: "only commits since `DATE`"},
			&cli.StringFlag{Name: "branch", Usage: "index `BRANCH` instead of the current one"},
		},
		Action: notBuiltAction,
	}
}
