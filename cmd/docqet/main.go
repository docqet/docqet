// Command docqet is the CLI, the Docqet server, and what serves the UI.
package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/exalynt/docqet/internal/commands"
)

// version is stamped at build time:
//
//	go build -ldflags "-X main.version=$(git describe --tags)" ./cmd/docqet
var version = "dev"

func main() {
	// Stopped by Ctrl-C or `docker stop`, so a server shuts down cleanly.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)

	root := commands.Root(version)
	err := root.Run(ctx, os.Args)
	stop()
	os.Exit(commands.Finish(root, os.Args, err))
}
