// Package database opens the server's database and keeps its schema up to
// date. Its migrations are in migrations/, a folder for each driver.
package database

import (
	"context"
	"database/sql"
	"fmt"
	"net/url"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite" // registers the "sqlite" driver
)

// Driver is the database the server keeps its data in. SQLite is the only
// one so far, in one file, so a server runs with nothing beside it.
const Driver = "sqlite"

// Open opens the SQLite database at path, creating the file and its folder
// if they're missing.
func Open(ctx context.Context, path string) (*sql.DB, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, err
	}
	q := url.Values{}
	q.Add("_pragma", "busy_timeout(5000)")
	q.Add("_pragma", "journal_mode(WAL)")
	q.Add("_pragma", "foreign_keys(1)")
	db, err := sql.Open(Driver, "file:"+path+"?"+q.Encode())
	if err != nil {
		return nil, err
	}
	// One connection: SQLite writes one at a time anyway, and a transaction
	// never waits on another connection's lock.
	db.SetMaxOpenConns(1)
	if err := db.PingContext(ctx); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("opening %s: %w", path, err)
	}
	return db, nil
}
