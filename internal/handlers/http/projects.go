package http

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"

	"github.com/exalynt/docqet/internal/repositories"
	"github.com/exalynt/docqet/internal/services"
	"github.com/exalynt/docqet/internal/state"
)

// maxStateBytes bounds what a commit's state can be. The largest example,
// a product of 36 capabilities and 368 rules, is under a megabyte.
const maxStateBytes = 64 << 20

// ProjectsHandler takes each project's states from `docqet apply`, and
// hands them back whole, as the CLI reads them.
type ProjectsHandler struct {
	logger *slog.Logger
	states *services.StateService
}

// NewProjectsHandler returns a ProjectsHandler over states.
func NewProjectsHandler(logger *slog.Logger, states *services.StateService) *ProjectsHandler {
	return &ProjectsHandler{logger: logger, states: states}
}

// RegisterRoutes mounts the project and commit routes on r.
func (h *ProjectsHandler) RegisterRoutes(r chi.Router) {
	r.Get("/projects/{project}", h.GetProject)
	r.Get("/projects/{project}/state", h.GetLatestState)
	r.Put("/projects/{project}/commits/{sha}", h.ApplyCommit)
	r.Get("/projects/{project}/commits/{sha}", h.GetCommit)
	r.Get("/projects/{project}/commits/{sha}/state", h.GetCommitState)
}

// ApplyCommitRequest is a project's state at a commit on its main branch,
// with where the commit is in history.
type ApplyCommitRequest struct {
	Parents     []string        `json:"parents"`
	CommittedAt string          `json:"committedAt"`
	Trailers    []state.Trailer `json:"trailers"`
	State       state.State     `json:"state"`
}

// CommitResource is a commit applied for a project.
type CommitResource struct {
	Project     string          `json:"project"`
	Commit      string          `json:"commit"`
	Product     *string         `json:"product"`
	Parents     []string        `json:"parents"`
	CommittedAt time.Time       `json:"committedAt"`
	AppliedAt   time.Time       `json:"appliedAt"`
	Trailers    []state.Trailer `json:"trailers"`
}

// NewCommitResource returns c as a resource.
func NewCommitResource(c repositories.AppliedCommit) CommitResource {
	r := CommitResource{
		Project:     c.Project,
		Commit:      c.SHA,
		Parents:     c.Parents,
		CommittedAt: c.CommittedAt.UTC(),
		AppliedAt:   c.AppliedAt.UTC(),
		Trailers:    c.Trailers,
	}
	if c.Product != "" {
		r.Product = &c.Product
	}
	if r.Parents == nil {
		r.Parents = []string{}
	}
	if r.Trailers == nil {
		r.Trailers = []state.Trailer{}
	}
	return r
}

// ProjectResource is a project the server has states for, as of its latest
// commit.
type ProjectResource struct {
	ID         string         `json:"id"`
	Name       string         `json:"name"`
	Product    *state.Ident   `json:"product"`
	LastCommit CommitResource `json:"lastCommit"`
}

// ApplyCommit stores a project's state at a commit: 201 when the commit is
// new to the server, 200 when it replaces what was there.
func (h *ProjectsHandler) ApplyCommit(w http.ResponseWriter, r *http.Request) {
	var req ApplyCommitRequest
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxStateBytes))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		writeError(w, r, http.StatusBadRequest, "the body isn't a commit's state: "+err.Error())
		return
	}
	applied, created, err := h.states.Apply(r.Context(), chi.URLParam(r, "project"), chi.URLParam(r, "sha"), state.Applied{
		Parents:     req.Parents,
		CommittedAt: req.CommittedAt,
		Trailers:    req.Trailers,
		State:       req.State,
	})
	if err != nil {
		h.writeStateError(w, r, err)
		return
	}
	status := http.StatusOK
	if created {
		status = http.StatusCreated
	}
	render.Status(r, status)
	render.JSON(w, r, NewCommitResource(applied.Commit))
}

// GetProject returns a project as of its latest commit.
func (h *ProjectsHandler) GetProject(w http.ResponseWriter, r *http.Request) {
	applied, err := h.states.GetLatest(r.Context(), chi.URLParam(r, "project"))
	if err != nil {
		h.writeStateError(w, r, err)
		return
	}
	render.JSON(w, r, ProjectResource{
		ID:         applied.State.Project.ID,
		Name:       applied.State.Project.Name,
		Product:    applied.State.Product,
		LastCommit: NewCommitResource(applied.Commit),
	})
}

// GetCommit returns one of a project's applied commits, without its state.
func (h *ProjectsHandler) GetCommit(w http.ResponseWriter, r *http.Request) {
	c, err := h.states.GetCommit(r.Context(), chi.URLParam(r, "project"), chi.URLParam(r, "sha"))
	if err != nil {
		h.writeStateError(w, r, err)
		return
	}
	render.JSON(w, r, NewCommitResource(c))
}

// GetLatestState returns a project's latest applied state, whole.
func (h *ProjectsHandler) GetLatestState(w http.ResponseWriter, r *http.Request) {
	applied, err := h.states.GetLatest(r.Context(), chi.URLParam(r, "project"))
	if err != nil {
		h.writeStateError(w, r, err)
		return
	}
	render.JSON(w, r, applied.State)
}

// GetCommitState returns a project's state at a commit, whole.
func (h *ProjectsHandler) GetCommitState(w http.ResponseWriter, r *http.Request) {
	applied, err := h.states.Get(r.Context(), chi.URLParam(r, "project"), chi.URLParam(r, "sha"))
	if err != nil {
		h.writeStateError(w, r, err)
		return
	}
	render.JSON(w, r, applied.State)
}

// writeStateError maps the state service's errors to a status and a message
// safe to return. Anything unexpected is a 500, with its cause logged.
func (h *ProjectsHandler) writeStateError(w http.ResponseWriter, r *http.Request, err error) {
	switch {
	case errors.Is(err, services.ErrInvalidState):
		writeError(w, r, http.StatusBadRequest, strings.TrimPrefix(err.Error(), "services: "))
	case errors.Is(err, services.ErrProjectNotFound):
		writeError(w, r, http.StatusNotFound, "nothing has been applied for this project")
	case errors.Is(err, services.ErrCommitNotFound):
		writeError(w, r, http.StatusNotFound, "this commit hasn't been applied for this project")
	default:
		h.logger.ErrorContext(r.Context(), "request failed", "method", r.Method, "path", r.URL.Path, "error", err)
		writeError(w, r, http.StatusInternalServerError, "something went wrong")
	}
}

// writeError writes the body every error has: {"error": msg}.
func writeError(w http.ResponseWriter, r *http.Request, status int, msg string) {
	render.Status(r, status)
	render.JSON(w, r, map[string]string{"error": msg})
}
