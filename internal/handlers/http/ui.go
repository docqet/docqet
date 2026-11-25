package http

import (
	"io/fs"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/exalynt/docket/ui"
)

// UIHandler serves the UI built into the binary.
type UIHandler struct {
	files http.Handler
}

// NewUIHandler returns a UIHandler over the embedded build.
func NewUIHandler() (*UIHandler, error) {
	dist, err := fs.Sub(ui.Dist, "dist")
	if err != nil {
		return nil, err
	}
	return &UIHandler{files: http.FileServerFS(dist)}, nil
}

// RegisterRoutes mounts the UI's files under every path no other route takes.
func (h *UIHandler) RegisterRoutes(r chi.Router) {
	r.Handle("/*", h.files)
}
