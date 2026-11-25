package commands

import "github.com/urfave/cli/v3"

// TouchesCommand lists what a set of files, or a change, is about.
func TouchesCommand() *cli.Command {
	return &cli.Command{
		Name:      "touches",
		Category:  reading,
		Usage:     "What a set of files or a change is about",
		ArgsUsage: "[path ...]",
		Flags: withSourceFlags(
			&cli.BoolFlag{Name: "staged", Usage: "what's staged"},
			&cli.StringFlag{Name: "base", Usage: "everything changed since `REV`"},
		),
		Action: notBuiltAction,
	}
}
