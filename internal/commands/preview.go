package commands

import "github.com/urfave/cli/v3"

// PreviewCommand is `diff --remote --product`, for CI.
func PreviewCommand() *cli.Command {
	return &cli.Command{
		Name:     "preview",
		Category: history,
		Usage:    "What merging this branch would change on the server, for CI",
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "format", Value: "text", Usage: "text or markdown, for a pull request comment"},
		},
		Action: notBuiltAction,
	}
}
