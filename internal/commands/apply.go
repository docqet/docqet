package commands

import "github.com/urfave/cli/v3"

// ApplyCommand sends the main branch's new commits to the server.
func ApplyCommand() *cli.Command {
	return &cli.Command{
		Name:     "apply",
		Category: onServer,
		Usage:    "Send the main branch's new commits to the server",
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "from", Usage: "start at `REV`, for a project's first apply or a backfill"},
			&cli.BoolFlag{Name: "replace", Usage: "with --from, re-index and replace what the server has"},
			&cli.BoolFlag{Name: "dry-run", Usage: "show what would be sent, without sending it"},
		},
		Action: notBuiltAction,
	}
}
