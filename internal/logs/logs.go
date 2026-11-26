// Package logs builds docqet's structured logger (log/slog). Only the
// commands that serve log: the rest print their results instead.
package logs

import (
	"io"
	"log/slog"
	"strings"
)

// New builds a logger that writes to w. level is one of "debug", "info",
// "warn" or "error" (anything else becomes "info"), and format is "json" or
// "text" (anything else becomes "json").
func New(w io.Writer, level, format string) *slog.Logger {
	opts := &slog.HandlerOptions{Level: parseLevel(level)}
	if strings.EqualFold(format, "text") {
		return slog.New(slog.NewTextHandler(w, opts))
	}
	return slog.New(slog.NewJSONHandler(w, opts))
}

func parseLevel(name string) slog.Level {
	switch strings.ToLower(name) {
	case "debug":
		return slog.LevelDebug
	case "warn", "warning":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
