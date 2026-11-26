package commands

import (
	"context"
	"fmt"

	"github.com/urfave/cli/v3"

	"github.com/exalynt/docket/internal/database"
)

// defaultDatabase is where the server keeps its SQLite database when
// DATABASE_PATH is unset: beside the code for a local run, and ignored by
// git. The image sets /var/lib/docket/docket.db, on a volume.
const defaultDatabase = "data/docket.db"

// databaseFlag is the server's database, for serve and migrate.
func databaseFlag() cli.Flag {
	return &cli.StringFlag{
		Name:    "database",
		Usage:   "the `PATH` of the server's SQLite database",
		Value:   defaultDatabase,
		Sources: cli.EnvVars("DATABASE_PATH"),
	}
}

// MigrateCommand brings the server's database up to this version's schema.
// It's a step of its own, run before `docket serve`, which refuses to start
// on a database that's behind.
func MigrateCommand() *cli.Command {
	return &cli.Command{
		Name:     "migrate",
		Category: serving,
		Usage:    "Bring the server's database up to this version's schema",
		Before:   maxArgs(0),
		Flags:    []cli.Flag{databaseFlag()},
		Action: func(ctx context.Context, cmd *cli.Command) error {
			path := cmd.String("database")
			db, err := database.Open(ctx, path)
			if err != nil {
				return err
			}
			defer func() { _ = db.Close() }()
			applied, version, err := database.Migrate(ctx, db)
			if err != nil {
				return err
			}
			if cmd.Bool("json") {
				writeJSON(cmd.Root().Writer, map[string]any{"database": path, "applied": applied, "version": version})
				return nil
			}
			_, _ = fmt.Fprintf(cmd.Root().Writer, "%s is at version %d (%d migrations applied now).\n", path, version, applied)
			return nil
		},
	}
}
