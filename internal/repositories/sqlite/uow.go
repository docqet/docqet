package sqlite

import (
	"context"
	"database/sql"

	"github.com/exalynt/docket/internal/repositories"
)

// querier is what a repository runs its SQL on: the database, or the
// transaction a unit of work carries on the context.
type querier interface {
	ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
	QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
}

type txKey struct{}

// on returns the transaction ctx carries, or db.
func on(ctx context.Context, db *sql.DB) querier {
	if tx, ok := ctx.Value(txKey{}).(*sql.Tx); ok {
		return tx
	}
	return db
}

// UnitOfWork runs work in one SQLite transaction.
type UnitOfWork struct {
	db *sql.DB
}

var _ repositories.UnitOfWork = (*UnitOfWork)(nil)

// NewUnitOfWork returns a UnitOfWork on db.
func NewUnitOfWork(db *sql.DB) *UnitOfWork {
	return &UnitOfWork{db: db}
}

// Do runs fn in a transaction, committing it when fn returns nil and rolling
// it back otherwise.
func (u *UnitOfWork) Do(ctx context.Context, fn func(ctx context.Context) error) error {
	tx, err := u.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	if err := fn(context.WithValue(ctx, txKey{}, tx)); err != nil {
		_ = tx.Rollback()
		return err
	}
	return tx.Commit()
}
