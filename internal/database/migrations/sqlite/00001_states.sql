-- +goose Up

-- Each distinct state, once, by the SHA-256 of its JSON without the commit it
-- was indexed at or when.
CREATE TABLE states (
  hash TEXT PRIMARY KEY,
  body BLOB NOT NULL
) STRICT;

-- Each commit applied for a project, pointing at its state.
CREATE TABLE commits (
  project      TEXT NOT NULL,
  sha          TEXT NOT NULL,
  product      TEXT NOT NULL,
  parents      TEXT NOT NULL, -- a JSON array of SHAs
  committed_at TEXT NOT NULL, -- RFC 3339, in UTC
  applied_at   TEXT NOT NULL,
  trailers     TEXT NOT NULL, -- a JSON array of {key, value}
  state_hash   TEXT NOT NULL REFERENCES states (hash),
  indexed_at   TEXT NOT NULL,
  PRIMARY KEY (project, sha)
) STRICT;

CREATE INDEX commits_by_time ON commits (project, committed_at);

-- +goose Down
DROP TABLE commits;
DROP TABLE states;
