package commands

import "github.com/urfave/cli/v3"

// ListCommand lists docs of one kind, or gaps, decisions or tradeoffs.
func ListCommand() *cli.Command {
	return &cli.Command{
		Name:      "list",
		Category:  reading,
		Before:    maxArgs(1),
		Usage:     "Docs, gaps, decisions or tradeoffs, filtered and ordered",
		ArgsUsage: "<kind>",
		Flags: withSourceFlags(
			&cli.StringFlag{Name: "stability", Usage: "only at `LEVEL`"},
			&cli.StringFlag{Name: "initiative", Usage: "only in initiative `ID`"},
			&cli.StringFlag{Name: "domain", Usage: "only in domain `ID`"},
			&cli.StringFlag{Name: "for", Usage: "only what affects `REF`, such as persona:front-desk-clerk"},
			&cli.StringFlag{Name: "on", Usage: "only what's on `REF`, such as component:ledger"},
			&cli.StringSliceFlag{Name: "impact", Usage: "only gaps with these `IMPACTS`, such as damaging,blocking"},
			&cli.StringFlag{Name: "sort", Usage: "order by `FIELD`, such as risk"},
		),
		Action: notBuiltAction,
	}
}
