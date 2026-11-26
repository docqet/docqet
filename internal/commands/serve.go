package commands

import (
	"context"
	"database/sql"
	"errors"
	"log/slog"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/urfave/cli/v3"

	"github.com/exalynt/docket/internal/database"
	httphandlers "github.com/exalynt/docket/internal/handlers/http"
	"github.com/exalynt/docket/internal/logs"
	"github.com/exalynt/docket/internal/repositories/sqlite"
	"github.com/exalynt/docket/internal/services"
	"github.com/exalynt/docket/internal/state"
)

// shutdownTimeout bounds how long in-flight requests have to finish once
// shutdown starts, before the server stops waiting.
const shutdownTimeout = 10 * time.Second

// ServeCommand runs the Docket server: it takes each project's states from
// `docket apply`, keeps them in SQLite and hands them back, and serves the
// API's docs, a readiness probe and the UI, over each project's latest
// applied state.
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
			databaseFlag(),
		},
		Action: func(ctx context.Context, cmd *cli.Command) error {
			logger := logs.New(os.Stderr, cmd.String("log-level"), cmd.String("log-format"))
			logger.InfoContext(ctx, "starting docket server", "version", cmd.Root().Version, "database", cmd.String("database"))

			db, err := database.Open(ctx, cmd.String("database"))
			if err != nil {
				return err
			}
			defer func() { _ = db.Close() }()
			// Migrations are a step of their own, never run here, so a
			// database behind this version refuses to serve.
			if err := database.CheckMigrated(ctx, db); err != nil {
				return err
			}

			handler, err := router(logger, nil, db)
			if err != nil {
				return err
			}
			return run(ctx, logger, net.JoinHostPort("", cmd.String("port")), handler)
		},
	}
}

// router builds the handler `serve` and `ui` serve: the API under /api/v1, its
// docs under /docs, and the UI under everything else, which reads only the
// API. With db, the server's database, the API takes and serves applied
// states, and its resources are each project's latest. Without it, they're
// the states source returns.
func router(logger *slog.Logger, source services.StateSource, db *sql.DB) (http.Handler, error) {
	uiHandler, err := httphandlers.NewUIHandler()
	if err != nil {
		return nil, err
	}
	docsHandler, err := httphandlers.NewDocsHandler()
	if err != nil {
		return nil, err
	}

	// The one server's check is always up: once it stops serving, its
	// listener is closed, so nothing can ask.
	health := httphandlers.NewHealthHandler(logger)
	health.AddServer("http", func(context.Context) error { return nil })
	var projects *httphandlers.ProjectsHandler
	if db != nil {
		health.AddDependency("database", "sqlite", db.PingContext)
		stateService := services.NewStateService(sqlite.NewStateRepository(db), sqlite.NewUnitOfWork(db))
		projects = httphandlers.NewProjectsHandler(logger, stateService)
		source = latestStates(stateService)
	}
	products := httphandlers.NewProductsHandler(logger, services.NewReadService(source))
	health.Start()

	r := chi.NewRouter()
	r.Route("/api/v1", func(api chi.Router) {
		// Health stays public so infrastructure probes, such as Compose's
		// healthcheck, reach it without a token.
		health.RegisterRoutes(api)
		if projects != nil {
			projects.RegisterRoutes(api)
		}
		products.RegisterRoutes(api)
	})
	docsHandler.RegisterRoutes(r)
	uiHandler.RegisterRoutes(r)
	return r, nil
}

// latestStates is each project's latest applied state.
// docket:implements capability:overview
func latestStates(states *services.StateService) services.StateSource {
	return func(ctx context.Context) ([]*state.State, error) {
		latest, err := states.ListLatest(ctx)
		if err != nil {
			return nil, err
		}
		shown := make([]*state.State, len(latest))
		for i, a := range latest {
			shown[i] = a.State
		}
		return shown, nil
	}
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
