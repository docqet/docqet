// Package server is the HTTP side of docket, shared by `docket serve` and
// `docket ui`: the UI, the states it shows, and running it until shutdown.
package server

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"log/slog"
	"net"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/exalynt/docket/ui"
)

// shutdownTimeout bounds how long in-flight requests have to finish once
// shutdown starts, before the server stops waiting.
const shutdownTimeout = 10 * time.Second

// Handler serves the UI over the state.json files at states, one per
// project. With none, the UI shows no projects.
func Handler(states []string) (http.Handler, error) {
	dist, err := fs.Sub(ui.Dist, "dist")
	if err != nil {
		return nil, err
	}

	r := chi.NewRouter()

	// Public, with no sign-in, so Compose's healthcheck reaches it. There's
	// nothing the server depends on yet, so it's ready once it's serving.
	r.Get("/v1/readyz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// The UI's own contract, until the server has an API for it to use:
	// projects.json lists where each project's state is, beside the page.
	// Each state.json is read on every request, so a new one shows on reload.
	r.Get("/projects.json", func(w http.ResponseWriter, _ *http.Request) {
		type entry struct {
			State string `json:"state"`
		}
		list := make([]entry, len(states))
		for i := range states {
			list[i] = entry{State: fmt.Sprintf("projects/%d/state.json", i)}
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{"projects": list})
	})
	r.Get("/projects/{index}/state.json", func(w http.ResponseWriter, r *http.Request) {
		i, err := strconv.Atoi(chi.URLParam(r, "index"))
		if err != nil || i < 0 || i >= len(states) {
			http.NotFound(w, r)
			return
		}
		http.ServeFile(w, r, states[i])
	})

	r.Handle("/*", http.FileServerFS(dist))
	return r, nil
}

// Serve serves handler on addr until ctx is done, then drains in-flight
// requests. The port is opened before it logs that it's serving, so a port
// already in use fails at once.
func Serve(ctx context.Context, logger *slog.Logger, addr string, handler http.Handler) error {
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
