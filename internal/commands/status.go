package commands

import "github.com/urfave/cli/v3"

// StatusCommand shows maturity, readiness and what's left, at a glance.
func StatusCommand() *cli.Command {
	return &cli.Command{
		Name:     "status",
		Category: reading,
		Before:   maxArgs(0),
		Usage:    "Maturity, readiness and what's left, at a glance",
		Flags: withSourceFlags(
			&cli.StringFlag{Name: "initiative", Usage: "only initiative `ID`"},
			&cli.StringFlag{Name: "for", Usage: "only for `REF`, such as persona:front-desk-clerk"},
		),
		Action: notBuiltAction,
	}
}
