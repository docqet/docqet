package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

// StatesHandler serves the states the UI shows, in the UI's own contract
// until the server has an API for it to use: projects.json lists where each
// project's state.json is, beside the page.
type StatesHandler struct {
	states []string
}

// NewStatesHandler serves the state.json files at states, one per project.
// With none, it lists no projects.
func NewStatesHandler(states []string) *StatesHandler {
	return &StatesHandler{states: states}
}

// RegisterRoutes mounts projects.json and each project's state.json.
func (h *StatesHandler) RegisterRoutes(r chi.Router) {
	r.Get("/projects.json", h.ListProjects)
	r.Get("/projects/{index}/state.json", h.GetState)
}

// ListProjects lists where each project's state.json is.
func (h *StatesHandler) ListProjects(w http.ResponseWriter, _ *http.Request) {
	type entry struct {
		State string `json:"state"`
	}
	list := make([]entry, len(h.states))
	for i := range h.states {
		list[i] = entry{State: fmt.Sprintf("projects/%d/state.json", i)}
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"projects": list})
}

// GetState serves one project's state.json. It's read on every request, so a
// new one shows on reload.
func (h *StatesHandler) GetState(w http.ResponseWriter, r *http.Request) {
	i, err := strconv.Atoi(chi.URLParam(r, "index"))
	if err != nil || i < 0 || i >= len(h.states) {
		http.NotFound(w, r)
		return
	}
	http.ServeFile(w, r, h.states[i])
}
