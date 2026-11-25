package commands

import "github.com/urfave/cli/v3"

// CheckCommand finds problems in the docs, annotations and commit trailers.
func CheckCommand() *cli.Command {
	return &cli.Command{
		Name:     "check",
		Category: reading,
		Before:   maxArgs(0),
		Usage:    "Find problems in the docs, annotations and commit trailers",
		Flags: withSourceFlags(
			&cli.BoolFlag{Name: "changed", Usage: "only problems in files changed since the main branch"},
			&cli.StringFlag{Name: "base", Usage: "with --changed, changed since `REV` instead of origin/HEAD"},
			&cli.StringFlag{Name: "commits", Usage: "also check the Docket trailers in `RANGE`, such as origin/main..HEAD"},
		),
		Action: notBuiltAction,
	}
}
