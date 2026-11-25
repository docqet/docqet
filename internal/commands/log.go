package commands

import "github.com/urfave/cli/v3"

// LogCommand shows how one thing changed over time.
func LogCommand() *cli.Command {
	return &cli.Command{
		Name:      "log",
		Category:  history,
		Before:    maxArgs(1),
		Usage:     "How one thing changed over time",
		ArgsUsage: "<ref or kind>",
		Flags: withSourceFlags(
			&cli.StringFlag{Name: "initiative", Usage: "only initiative `ID`"},
			&cli.StringFlag{Name: "since", Usage: "only changes since `DATE`"},
		),
		Action: notBuiltAction,
	}
}
