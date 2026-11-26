package commands

import "github.com/urfave/cli/v3"

// RubricCommand shows what each stability level expects, or what a
// promotion needs. Only --for reads the project, so only then do the source
// flags apply.
func RubricCommand() *cli.Command {
	return &cli.Command{
		Name:      "rubric",
		Category:  reading,
		Before:    maxArgs(1),
		Usage:     "What each stability level expects, or what a promotion needs",
		ArgsUsage: "[outcome]",
		Flags: withSourceFlags(
			&cli.StringFlag{Name: "level", Usage: "everything `LEVEL` expects, including what it carries up"},
			&cli.StringFlag{Name: "for", Usage: "what promoting capability `REF` needs, with --to"},
			&cli.StringFlag{Name: "to", Usage: "with --for, the `LEVEL` to promote to"},
		),
		Action: notBuiltAction,
	}
}
