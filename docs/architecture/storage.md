# Storage

_How the server keeps what it's sent: repositories, SQLite, and keeping states
small. Part of [how `docqet` is built](README.md)._

The server keeps what it's sent in SQLite, behind repositories. The state
repository is built, storing each distinct state once by its hash. The results
and changes repositories are still to come.

**Code:** `internal/repositories` (each repository's interface in a file of
its own, and what they share in `shared.go`), `internal/repositories/sqlite`
(each implementation, in a file of the same name), `internal/database`
(opening the database, and its migrations), `internal/services` (what to
store, and when).

## Repositories

The repositories follow these rules:

- **Repositories only persist.** They store and retrieve, with no logic and
  no decisions, and use common names: `Get`, `List`, `Upsert`, `Create`.
- **`List` takes a query struct** of filters, each applied only when set, and
  a page.
- **Their errors**, such as `ErrNotFound`, are declared beside their
  interfaces in `repositories`, and the SQLite implementation in
  `repositories/sqlite` translates the driver's into them.
- **Writes that belong together run in the service's transaction**, a unit of
  work carried on `ctx`. The repositories never decide on transactions.
- **SQL is written by hand**, with no ORM, and the schema is goose
  migrations embedded in the binary.

The server stores three things, each with its own lifecycle, so it has three
repositories:

- **`StateRepository`** holds each state applied: its project and product,
  commit, parents, commit time, when it was applied, its trailers, and the
  state. A state is never changed once it's written. Roughly: `Upsert`, `Get` a
  project's state at a commit, `GetLatest`, `List` the states of a product at a
  point, `ListCommits` for the timeline without the states, `ListProducts` and
  `ListProjects`.
- **A repository for test and QA results**, kept as they were sent, for a
  project's commit, including one not applied yet.
- **A repository for the changes** worked out as each state is applied,
  paginated in SQL.

How results and changes are modelled is still in flux, so these two are
placeholders, named for now by what they hold (see
[the Understanding domain's decisions](../../docqet/domains/understanding/domain.md)).

- **Resources never come from a repository.** Capabilities, gaps, readiness
  and the rest aren't stored: the read service works them out from states with
  `combine` and `derive`, then filters, sorts and pages through them in
  memory. `turn` never runs a query itself, so it pages through a list worked
  out in Go as readily as a table. A repository with `ListCapabilities` would
  move Docqet's logic into SQL, where the CLI couldn't use it.
- **Projects and products are the state repository's.** Nothing on the server
  declares them: they're each state's header. A project's product can change
  between commits, so each state's row carries it. A repository of their own
  comes when projects have something of their own on the server, such as the
  project tokens that come with signing in.
- **Applying a state is one transaction**: the state, then the changes worked
  out from it.
- **Types live with what makes them.** An applied state, the state with its
  commit, parents, time and trailers, is what `apply` sends and what the
  server stores, so it's in `state`. A change is what `diff` works out, so
  it's in `diff`.
- **The read service doesn't depend on `StateRepository`.** It declares the
  small interface it needs, the states of a product at a point, which the
  state repository satisfies on the server and the working tree satisfies on a
  laptop. The CLI has no repositories: the working tree and `.docqet/` are
  files.

## SQLite

- **SQLite is the default provider, and the only one so far.**
  `DATABASE_PROVIDER` (`--database-provider`) names it, defaulting to
  `sqlite`, and `serve` and `migrate` refuse any other value.
- **The driver is `modernc.org/sqlite`**, which is pure Go, so the image still
  builds with `CGO_ENABLED=0`.
- **`internal/database` opens it and keeps its schema up to date.** Its goose
  migrations are in `internal/database/migrations/`, in a folder for each
  provider: `migrations/sqlite/` for now.
- **Migrations run from an explicit command**, `docqet migrate`, not when
  the server starts. `docqet serve` refuses to start on a database that's
  behind, unless it's given `--migrate` (`MIGRATE=true`), which brings it up
  to date first. That's off by default and meant for local runs: `make run`
  passes it, and `compose.yml` sets it for the local stack.
- **The database is one file**, at `DATABASE_PATH`: `data/docqet.db` for a
  local run, ignored by git, and `/var/lib/docqet/docqet.db` on a volume in
  Compose.
- **Paginating in SQL uses `turn`'s store adapter.** It has no SQLite dialect,
  so if neither of its dialects renders SQLite's keyset queries correctly, we
  write one, as its `Dialect` interface allows.

## Keeping states small

A whole state for every commit adds up, and most commits change little or
nothing in the docs.

- **Each distinct state is stored once, by its hash**, and each commit points
  at the hash. A commit that changes nothing in the docs stores nothing new.
- **What's particular to a commit isn't in what's hashed.** The commit a state
  was indexed at belongs to the commit's row, not the stored state, or no two
  states would ever be the same.

If that isn't enough, two more steps, in this order, each when sizes call for
it:

1. **Compress what's stored**, with the standard library's `compress/gzip`.
   State is JSON, which compresses well.
2. **Store a state's parts by their hashes**, as git stores files in trees:
   each doc's entry, and the rubric, once each by its hash, and a
   state as the list of them. Most commits change one or two docs, so most of
   each state is already stored. It also catches what whole-state hashing
   misses: a code change that only moves an annotated line changes the state,
   but only that doc's entry. Reading a state means putting it back together,
   so it costs more to read.

Storing each state as a delta from the one before, as git's pack files do, is
left out: reading a state would mean replaying its chain.
