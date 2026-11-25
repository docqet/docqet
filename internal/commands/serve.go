package commands

import (
	"context"
	"net"
	"os"

	"github.com/urfave/cli/v3"

	"github.com/exalynt/docket/internal/logs"
	"github.com/exalynt/docket/internal/server"
)

// ServeCommand runs the Docket server. For now it serves the UI, over no
// projects, and a readiness probe: it can't take applied states or results
// yet, so it holds nothing.
func ServeCommand() *cli.Command {
	return &cli.Command{
		Name:     "serve",
		Category: serving,
		Usage:    "Run the Docket server",
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:    "port",
				Usage:   "the `PORT` to listen on",
				Value:   "8080",
				Sources: cli.EnvVars("PORT"),
			},
			&cli.StringFlag{
				Name:    "log-level",
				Usage:   "the lowest `LEVEL` logged: debug, info, warn or error",
				Value:   "info",
				Sources: cli.EnvVars("LOG_LEVEL"),
			},
			&cli.StringFlag{
				Name:    "log-format",
				Usage:   "json, for log pipelines, or text, for reading",
				Value:   "json",
				Sources: cli.EnvVars("LOG_FORMAT"),
			},
		},
		Action: func(ctx context.Context, cmd *cli.Command) error {
			logger := logs.New(os.Stderr, cmd.String("log-level"), cmd.String("log-format"))
			logger.InfoContext(ctx, "starting docket server", "version", cmd.Root().Version)

			handler, err := server.Handler(nil)
			if err != nil {
				return err
			}
			return server.Serve(ctx, logger, net.JoinHostPort("", cmd.String("port")), handler)
		},
	}
}
