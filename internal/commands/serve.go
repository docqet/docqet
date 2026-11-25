package commands

import (
	"context"
	"errors"
	"log/slog"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/urfave/cli/v3"

	httphandlers "github.com/exalynt/docket/internal/handlers/http"
	"github.com/exalynt/docket/internal/logs"
)

// shutdownTimeout bounds how long in-flight requests have to finish once
// shutdown starts, before the server stops waiting.
const shutdownTimeout = 10 * time.Second

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

			handler, err := router(nil)
			if err != nil {
				return err
			}
			return run(ctx, logger, net.JoinHostPort("", cmd.String("port")), handler)
		},
	}
}

// router builds the handler `serve` and `ui` serve: the API under /v1, the
// states the UI shows, and the UI under everything else. states are the
// state.json files to show, one per project.
func router(states []string) (http.Handler, error) {
	uiHandler, err := httphandlers.NewUIHandler()
	if err != nil {
		return nil, err
	}

	r := chi.NewRouter()
	r.Route("/v1", func(api chi.Router) {
		httphandlers.NewHealthHandler().RegisterRoutes(api)
	})
	httphandlers.NewStatesHandler(states).RegisterRoutes(r)
	uiHandler.RegisterRoutes(r)
	return r, nil
}

// run serves handler on addr until ctx is done, then drains in-flight
// requests. The port is opened before it logs that it's serving, so a port
// already in use fails at once.
func run(ctx context.Context, logger *slog.Logger, addr string, handler http.Handler) error {
	ln, err := (&net.ListenConfig{}).Listen(ctx, "tcp", addr)
	if err != nil {
		return err
	}
	srv := &http.Server{Handler: handler, ReadHeaderTimeout: 10 * time.Second}

	errc := make(chan error, 1)
	go func() { errc <- srv.Serve(ln) }()
	logger.InfoContext(ctx, "serving", "addr", ln.Addr().String())

	select {
	case err := <-errc:
		return err
	case <-ctx.Done():
		logger.InfoContext(ctx, "shutting down, draining connections", "timeout", shutdownTimeout)
	}

	shutdown, cancel := context.WithTimeout(context.WithoutCancel(ctx), shutdownTimeout)
	defer cancel()
	if err := srv.Shutdown(shutdown); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	logger.InfoContext(ctx, "shutdown complete")
	return nil
}
