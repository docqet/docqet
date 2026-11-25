package commands

import "github.com/urfave/cli/v3"

// IndexCommand writes the project's state, for the working tree or a commit.
func IndexCommand() *cli.Command {
	return &cli.Command{
		Name:     "index",
		Category: settingUp,
		Usage:    "Write the state for the working tree or a commit",
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "at", Usage: "index `REV`, read from git without checking it out"},
			&cli.BoolFlag{Name: "stdout", Usage: "print the state instead of writing .docket/state.json"},
		},
		Action: notBuiltAction,
	}
}
