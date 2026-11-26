package database

import (
	"context"
	"database/sql"
	"embed"
	"errors"
	"io/fs"

	"github.com/pressly/goose/v3"
)

//go:embed migrations/sqlite/*.sql
var migrations embed.FS

// ErrNotMigrated is returned when the database's schema is behind this
// version of docqet, so `docqet migrate` needs running first, or `docqet
// serve` needs --migrate.
var ErrNotMigrated = errors.New("the database isn't migrated: run docqet migrate, or serve with --migrate")

// provider is goose over Driver's migrations.
func provider(db *sql.DB) (*goose.Provider, error) {
	sub, err := fs.Sub(migrations, "migrations/"+Driver)
	if err != nil {
		return nil, err
	}
	return goose.NewProvider(goose.DialectSQLite3, db, sub)
}

// Migrate applies every migration not yet applied, and returns how many it
// applied and the version the database is at after.
func Migrate(ctx context.Context, db *sql.DB) (applied int, version int64, err error) {
	p, err := provider(db)
	if err != nil {
		return 0, 0, err
	}
	results, err := p.Up(ctx)
	if err != nil {
		return 0, 0, err
	}
	version, err = p.GetDBVersion(ctx)
	return len(results), version, err
}

// CheckMigrated returns ErrNotMigrated when a migration hasn't been applied.
func CheckMigrated(ctx context.Context, db *sql.DB) error {
	p, err := provider(db)
	if err != nil {
		return err
	}
	pending, err := p.HasPending(ctx)
	if err != nil {
		return err
	}
	if pending {
		return ErrNotMigrated
	}
	return nil
}
