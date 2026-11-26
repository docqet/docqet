// Package repositories declares how the server keeps what it's sent, in
// docqet's terms. Its implementations, such as repositories/sqlite, only
// persist: what to store, and when, is the services' to decide.
package repositories

import (
	"context"
	"errors"
)

// ErrNotFound is returned when nothing is stored for what was asked.
var ErrNotFound = errors.New("repositories: not found")

// UnitOfWork runs work in one transaction: every repository call made with
// the context fn is given is in it, and it's committed when fn returns nil.
type UnitOfWork interface {
	Do(ctx context.Context, fn func(ctx context.Context) error) error
}
