package commands

import (
	"context"
	"errors"

	"github.com/urfave/cli/v3"
)

// ResultsCommand sends test or QA results for a commit.
func ResultsCommand() *cli.Command {
	commit := func() cli.Flag {
		return &cli.StringFlag{Name: "commit", Value: "HEAD", Usage: "the `REV` the results are for"}
	}
	return &cli.Command{
		Name:     "results",
		Category: onServer,
		Usage:    "Send test or QA results for a commit: junit or qa",
		Commands: []*cli.Command{
			{
				Name:      "junit",
				Usage:     "Send automated test results, as JUnit XML",
				ArgsUsage: "<file ...>",
				Flags:     []cli.Flag{commit()},
				Action:    notBuiltAction,
			},
			{
				Name:      "qa",
				Usage:     "Send a QA run's results",
				ArgsUsage: "<file>",
				Flags:     []cli.Flag{commit()},
				Action:    notBuiltAction,
			},
		},
		// Refuse rather than guess what kind of results they are.
		Action: func(context.Context, *cli.Command) error {
			return errors.New("results needs what kind to send: junit or qa")
		},
	}
}
