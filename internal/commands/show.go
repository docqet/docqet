package commands

import "github.com/urfave/cli/v3"

// ShowCommand shows one doc, with everything derived about it.
func ShowCommand() *cli.Command {
	return &cli.Command{
		Name:      "show",
		Category:  reading,
		Before:    maxArgs(1),
		Usage:     "One doc, with everything derived about it",
		ArgsUsage: "<ref>",
		Flags:     sourceFlags(),
		Action:    notBuiltAction,
	}
}
