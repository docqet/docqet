package http

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"

	"github.com/exalynt/docket/internal/state"
)

// StateSource returns the states the UI shows, one per project, in the same
// order on every call.
type StateSource func(ctx context.Context) ([]*state.State, error)

// FileStates is a StateSource over the state.json files at paths, read on
// every call, so a new one shows on reload.
func FileStates(paths []string) StateSource {
	return func(context.Context) ([]*state.State, error) {
		states := make([]*state.State, 0, len(paths))
		for _, p := range paths {
			body, err := os.ReadFile(p)
			if err != nil {
				return nil, err
			}
			var st state.State
			if err := json.Unmarshal(body, &st); err != nil {
				return nil, fmt.Errorf("%s: %w", p, err)
			}
			states = append(states, &st)
		}
		return states, nil
	}
}

// StatesHandler serves the states the UI shows, in the UI's own contract
// until it reads the server's resources: projects.json lists where each
// project's state.json is, beside the page.
type StatesHandler struct {
	logger *slog.Logger
	states StateSource
}

// NewStatesHandler serves the states source returns.
func NewStatesHandler(logger *slog.Logger, source StateSource) *StatesHandler {
	return &StatesHandler{logger: logger, states: source}
}

// RegisterRoutes mounts projects.json and each project's state.json.
func (h *StatesHandler) RegisterRoutes(r chi.Router) {
	r.Get("/projects.json", h.ListProjects)
	r.Get("/projects/{index}/state.json", h.GetState)
}

// ListProjects lists where each project's state.json is.
func (h *StatesHandler) ListProjects(w http.ResponseWriter, r *http.Request) {
	states, err := h.states(r.Context())
	if err != nil {
		h.fail(w, r, err)
		return
	}
	type entry struct {
		State string `json:"state"`
	}
	list := make([]entry, len(states))
	for i := range states {
		list[i] = entry{State: fmt.Sprintf("projects/%d/state.json", i)}
	}
	render.JSON(w, r, map[string]any{"projects": list})
}

// GetState serves one project's state.json, as it is now.
func (h *StatesHandler) GetState(w http.ResponseWriter, r *http.Request) {
	states, err := h.states(r.Context())
	if err != nil {
		h.fail(w, r, err)
		return
	}
	i, err := strconv.Atoi(chi.URLParam(r, "index"))
	if err != nil || i < 0 || i >= len(states) {
		http.NotFound(w, r)
		return
	}
	render.JSON(w, r, states[i])
}

func (h *StatesHandler) fail(w http.ResponseWriter, r *http.Request, err error) {
	h.logger.ErrorContext(r.Context(), "request failed", "method", r.Method, "path", r.URL.Path, "error", err)
	writeError(w, r, http.StatusInternalServerError, "something went wrong")
}
