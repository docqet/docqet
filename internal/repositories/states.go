package repositories

import (
	"context"
	"time"

	"github.com/exalynt/docqet/internal/state"
)

// AppliedCommit is a project's state at a commit on its main branch, as
// stored: the commit, where it is in history, and the hash of its state.
type AppliedCommit struct {
	Project     string
	Product     string // the product the project was part of at the commit, or "" for none
	SHA         string
	Parents     []string
	CommittedAt time.Time
	AppliedAt   time.Time
	Trailers    []state.Trailer
	StateHash   string
	IndexedAt   string
}

// StateRepository keeps each project's applied states: every distinct state
// once, by its hash, and every commit pointing at its state.
type StateRepository interface {
	// PutState stores a state's body under its hash, unless one is stored
	// there already.
	PutState(ctx context.Context, hash string, body []byte) error
	// GetState returns the state body stored under hash, or ErrNotFound.
	GetState(ctx context.Context, hash string) ([]byte, error)
	// UpsertCommit stores c, replacing what's stored for its project and SHA.
	// created reports whether there was nothing stored for them before.
	UpsertCommit(ctx context.Context, c AppliedCommit) (created bool, err error)
	// GetCommit returns a project's commit, or ErrNotFound.
	GetCommit(ctx context.Context, project, sha string) (AppliedCommit, error)
	// GetLatestCommit returns a project's most recent commit by commit time,
	// or ErrNotFound when none is stored.
	GetLatestCommit(ctx context.Context, project string) (AppliedCommit, error)
	// ListProjects returns the ID of every project with a commit stored, in
	// order.
	ListProjects(ctx context.Context) ([]string, error)
}
