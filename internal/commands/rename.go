package commands

import "github.com/urfave/cli/v3"

// RenameCommand changes an ID everywhere in the project, and prints the
// trailer that tells history it's the same thing.
func RenameCommand() *cli.Command {
	return &cli.Command{
		Name:      "rename",
		Category:  changing,
		Before:    maxArgs(2),
		Usage:     "Change an ID everywhere in the project, and say so in history",
		ArgsUsage: "<old> <new>",
		Flags: []cli.Flag{
			&cli.BoolFlag{Name: "dry-run", Usage: "show what would change, without changing it"},
			productFlag("also list the rest of the product's references, from the server"),
		},
		Action: notBuiltAction,
	}
}
