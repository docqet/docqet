// Package http contains docket's HTTP handlers. Each mounts its own routes
// with RegisterRoutes, and the serve command decides where.
package http

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

// HealthHandler answers the readiness probe.
type HealthHandler struct{}

// NewHealthHandler returns a HealthHandler.
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// RegisterRoutes mounts the readiness probe. It's public, with no sign-in, so
// Compose's healthcheck reaches it.
func (h *HealthHandler) RegisterRoutes(r chi.Router) {
	r.Get("/readyz", h.Ready)
}

// Ready answers 200. There's nothing the server depends on yet, so it's ready
// once it's serving.
func (h *HealthHandler) Ready(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
}
