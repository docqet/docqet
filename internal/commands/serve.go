package commands

import (
	"context"
	"errors"
	"io/fs"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/urfave/cli/v3"

	"github.com/exalynt/docket/ui"
)

// ServeCommand runs the Docket server. For now it serves the UI and a
// readiness probe, and nothing else.
func ServeCommand() *cli.Command {
	return &cli.Command{
		Name:  "serve",
		Usage: "Run the Docket server",
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:    "port",
				Usage:   "port to listen on",
				Value:   "8080",
				Sources: cli.EnvVars("PORT"),
			},
		},
		Action: func(ctx context.Context, cmd *cli.Command) error {
			return serve(ctx, ":"+cmd.String("port"))
		},
	}
}

func serve(ctx context.Context, addr string) error {
	dist, err := fs.Sub(ui.Dist, "dist")
	if err != nil {
		return err
	}

	r := chi.NewRouter()
	r.Get("/readyz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	r.Handle("/*", http.FileServerFS(dist))

	srv := &http.Server{Addr: addr, Handler: r, ReadHeaderTimeout: 10 * time.Second}
	errc := make(chan error, 1)
	go func() { errc <- srv.ListenAndServe() }()
	slog.InfoContext(ctx, "docket serving", "addr", addr)

	select {
	case err := <-errc:
		return err
	case <-ctx.Done():
	}

	shutdown, cancel := context.WithTimeout(context.WithoutCancel(ctx), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdown); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}
