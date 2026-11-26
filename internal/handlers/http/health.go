// Package http contains docket's HTTP handlers. Each mounts its own routes
// with RegisterRoutes, and the serve command decides where.
package http

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/alexliesenfeld/health"
	"github.com/go-chi/chi/v5"
)

// healthCheckTimeout bounds each check, inside the 1 second a probe waits by
// default.
const healthCheckTimeout = time.Second

// errUnhealthy is what a failed check reports. The endpoint is public, so the
// real cause is logged rather than returned.
var errUnhealthy = errors.New("unhealthy")

// HealthHandler serves the process's readiness probe, for what the process
// runs: one check for each of its servers. Dependencies get checks of their
// own once the server has any, such as its SQLite database.
//
// Checks are added while the server is built, and Start must be called once
// they all have, before it serves.
type HealthHandler struct {
	logger  *slog.Logger
	servers []health.Check
	ready   http.Handler
}

// NewHealthHandler constructs a HealthHandler with no checks. logger records
// why a check failed.
func NewHealthHandler(logger *slog.Logger) *HealthHandler {
	return &HealthHandler{logger: logger}
}

// AddServer adds a check for one of the process's servers, reported under
// name: up while check returns nil, and down when it returns an error.
func (h *HealthHandler) AddServer(name string, check func(ctx context.Context) error) {
	h.servers = append(h.servers, health.Check{
		Name: name,
		Check: func(ctx context.Context) error {
			if err := check(ctx); err != nil {
				h.logger.WarnContext(ctx, "health check failed", "check", name, "error", err)
				return errUnhealthy
			}
			return nil
		},
	})
}

// Start builds the checker from the checks added so far.
func (h *HealthHandler) Start() {
	h.ready = health.NewHandler(health.NewChecker(
		health.WithTimeout(healthCheckTimeout),
		health.WithChecks(h.servers...),
	), health.WithResultWriter(healthResultWriter{}))
}

// RegisterRoutes mounts the readiness probe. It's the only one anything
// calls yet: Compose's healthcheck.
func (h *HealthHandler) RegisterRoutes(r chi.Router) {
	r.Get("/readyz", h.GetReady)
}

// GetReady runs the server checks and reports each one's status and the
// overall status: 200 when all are up, 503 when any is down. Results are
// cached for a second.
func (h *HealthHandler) GetReady(w http.ResponseWriter, r *http.Request) {
	h.ready.ServeHTTP(w, r)
}

// healthResultWriter writes a result in the same shape as the api
// repository's health endpoints.
type healthResultWriter struct{}

// healthResult is the JSON body of the health endpoint.
type healthResult struct {
	Status  health.AvailabilityStatus    `json:"status"`
	Details map[string]healthCheckResult `json:"details,omitempty"`
}

// healthCheckResult is one check in a healthResult.
type healthCheckResult struct {
	Status    health.AvailabilityStatus `json:"status"`
	Timestamp time.Time                 `json:"timestamp,omitzero"`
	Error     string                    `json:"error,omitempty"`
}

func (healthResultWriter) Write(result *health.CheckerResult, statusCode int, w http.ResponseWriter, _ *http.Request) error {
	body := healthResult{Status: result.Status, Details: make(map[string]healthCheckResult, len(result.Details))}
	for name, check := range result.Details {
		c := healthCheckResult{Status: check.Status, Timestamp: check.Timestamp}
		if check.Error != nil {
			c.Error = check.Error.Error()
		}
		body.Details[name] = c
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(statusCode)
	return json.NewEncoder(w).Encode(body)
}
