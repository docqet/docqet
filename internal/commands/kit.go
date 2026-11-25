package commands

import "github.com/urfave/cli/v3"

// KitCommand installs or updates the agent kit in the project.
func KitCommand() *cli.Command {
	return &cli.Command{
		Name:     "kit",
		Category: settingUp,
		Usage:    "Install or update the agent kit",
		Flags: []cli.Flag{
			&cli.BoolFlag{Name: "check", Usage: "exit 1 if the project's copy isn't this version's kit, for CI"},
		},
		Action: notBuiltAction,
	}
}
