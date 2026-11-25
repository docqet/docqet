// Command docket is the CLI, the Docket server, and what serves the UI.
package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/urfave/cli/v3"

	"github.com/exalynt/docket/internal/commands"
)

// version is stamped at build time:
//
//	go build -ldflags "-X main.version=$(git describe --tags)" ./cmd/docket
var version = "dev"

func main() {
	// Stopped by Ctrl-C or `docker stop`, so the server shuts down cleanly.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	cmd := &cli.Command{
		Name:    "docket",
		Usage:   "What software can do, who it serves, and how ready it is",
		Version: version,
		Commands: []*cli.Command{
			commands.ServeCommand(),
		},
	}

	if err := cmd.Run(ctx, os.Args); err != nil {
		slog.ErrorContext(ctx, "docket exited with error", "error", err)
		os.Exit(1)
	}
}
