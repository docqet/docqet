package sqlite

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"github.com/docqet/docqet/internal/repositories"
)

// StateRepository keeps applied states in SQLite.
type StateRepository struct {
	db *sql.DB
}

var _ repositories.StateRepository = (*StateRepository)(nil)

// NewStateRepository returns a StateRepository on db.
func NewStateRepository(db *sql.DB) *StateRepository {
	return &StateRepository{db: db}
}

// PutState stores a state's body under its hash, unless one is stored there
// already.
func (r *StateRepository) PutState(ctx context.Context, hash string, body []byte) error {
	_, err := on(ctx, r.db).ExecContext(ctx, `INSERT INTO states (hash, body) VALUES (?, ?) ON CONFLICT (hash) DO NOTHING`, hash, body)
	return err
}

// GetState returns the state body stored under hash, or
// repositories.ErrNotFound.
func (r *StateRepository) GetState(ctx context.Context, hash string) ([]byte, error) {
	var body []byte
	err := on(ctx, r.db).QueryRowContext(ctx, `SELECT body FROM states WHERE hash = ?`, hash).Scan(&body)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, repositories.ErrNotFound
	}
	return body, err
}

// UpsertCommit stores c, replacing what's stored for its project and SHA.
func (r *StateRepository) UpsertCommit(ctx context.Context, c repositories.AppliedCommit) (bool, error) {
	q := on(ctx, r.db)
	var exists int
	err := q.QueryRowContext(ctx, `SELECT 1 FROM commits WHERE project = ? AND sha = ?`, c.Project, c.SHA).Scan(&exists)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return false, err
	}
	parents, err := json.Marshal(nonNil(c.Parents))
	if err != nil {
		return false, err
	}
	trailers, err := json.Marshal(nonNil(c.Trailers))
	if err != nil {
		return false, err
	}
	_, err = q.ExecContext(ctx, `
		INSERT INTO commits (project, sha, product, parents, committed_at, applied_at, trailers, state_hash, indexed_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT (project, sha) DO UPDATE SET
			product = excluded.product, parents = excluded.parents, committed_at = excluded.committed_at,
			applied_at = excluded.applied_at, trailers = excluded.trailers, state_hash = excluded.state_hash,
			indexed_at = excluded.indexed_at`,
		c.Project, c.SHA, c.Product, string(parents), formatTime(c.CommittedAt), formatTime(c.AppliedAt),
		string(trailers), c.StateHash, c.IndexedAt)
	return exists == 0, err
}

const commitColumns = `project, sha, product, parents, committed_at, applied_at, trailers, state_hash, indexed_at`

// GetCommit returns a project's commit, or repositories.ErrNotFound.
func (r *StateRepository) GetCommit(ctx context.Context, project, sha string) (repositories.AppliedCommit, error) {
	return scanCommit(on(ctx, r.db).QueryRowContext(ctx,
		`SELECT `+commitColumns+` FROM commits WHERE project = ? AND sha = ?`, project, sha))
}

// GetLatestCommit returns a project's most recent commit by commit time, the
// one applied last among any committed at the same moment, or
// repositories.ErrNotFound.
func (r *StateRepository) GetLatestCommit(ctx context.Context, project string) (repositories.AppliedCommit, error) {
	return scanCommit(on(ctx, r.db).QueryRowContext(ctx,
		`SELECT `+commitColumns+` FROM commits WHERE project = ? ORDER BY committed_at DESC, applied_at DESC LIMIT 1`, project))
}

// ListProjects returns the ID of every project with a commit stored, in
// order.
func (r *StateRepository) ListProjects(ctx context.Context) ([]string, error) {
	rows, err := on(ctx, r.db).QueryContext(ctx, `SELECT DISTINCT project FROM commits ORDER BY project`)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	var projects []string
	for rows.Next() {
		var p string
		if err := rows.Scan(&p); err != nil {
			return nil, err
		}
		projects = append(projects, p)
	}
	return projects, rows.Err()
}

func scanCommit(row *sql.Row) (repositories.AppliedCommit, error) {
	var (
		c                      repositories.AppliedCommit
		parents, trailers      string
		committedAt, appliedAt string
	)
	err := row.Scan(&c.Project, &c.SHA, &c.Product, &parents, &committedAt, &appliedAt, &trailers, &c.StateHash, &c.IndexedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return c, repositories.ErrNotFound
	}
	if err != nil {
		return c, err
	}
	if err := json.Unmarshal([]byte(parents), &c.Parents); err != nil {
		return c, err
	}
	if err := json.Unmarshal([]byte(trailers), &c.Trailers); err != nil {
		return c, err
	}
	if c.CommittedAt, err = time.Parse(time.RFC3339Nano, committedAt); err != nil {
		return c, err
	}
	if c.AppliedAt, err = time.Parse(time.RFC3339Nano, appliedAt); err != nil {
		return c, err
	}
	return c, nil
}

// formatTime writes a time so that ordering the text orders the times.
func formatTime(t time.Time) string {
	return t.UTC().Format("2006-01-02T15:04:05.000000000Z")
}

func nonNil[T any](l []T) []T {
	if l == nil {
		return []T{}
	}
	return l
}
