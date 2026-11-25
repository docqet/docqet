package commands

import "github.com/urfave/cli/v3"

// DiffCommand shows what changed in Docket between two points.
func DiffCommand() *cli.Command {
	return &cli.Command{
		Name:      "diff",
		Category:  history,
		Before:    maxArgs(2),
		Usage:     "What changed in Docket between two points",
		ArgsUsage: "[<from>] [<to>]",
		Flags: withSourceFlags(
			&cli.BoolFlag{Name: "staged", Usage: "compare the last commit with what's staged"},
		),
		Action: notBuiltAction,
	}
}
