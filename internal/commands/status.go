package commands

import "github.com/urfave/cli/v3"

// StatusCommand shows maturity, readiness and its improvements, at a glance.
func StatusCommand() *cli.Command {
	return &cli.Command{
		Name:         "status",
		Category:     reading,
		ArgValidator: maxArgs(0),
		Usage:        "Maturity, readiness and its improvements, at a glance",
		Flags: withSourceFlags(
			&cli.StringFlag{Name: "initiative", Usage: "only initiative `ID`"},
			&cli.StringFlag{Name: "for", Usage: "only for `REF`, such as persona:front-desk-clerk"},
		),
		Action: notBuiltAction,
	}
}
