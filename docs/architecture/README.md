# How `docket` is built

_Decisions and direction for `docket`'s Go code: where its logic lives, how
the CLI and the server share it, and the API the UI reads. Only the scaffold
exists today (see [the command draft](../../cmd/docket/README.md)). Everything
else here is the plan, and may change as the prototype teaches us._

**Contents:** [Layers](#layers) · [The parts](#the-parts) · [Order of work](#order-of-work) · [Open decisions](#open-decisions) · [Left out for now](#left-out-for-now)

## Layers

`docket` follows the api repository's layering, with one difference: most of
Docket's logic is computation over docs, not orchestration, so it lives in
pure packages below the services.

```text
internal/commands, internal/handlers/http     thin: parse input, call a service, render
        │
internal/services                             orchestration: where states come from, what to do with them
        │
internal/state, index, combine, derive, diff  the spec in Go: pure functions, no I/O
        │
fs.FS, internal/git, repositories/sqlite,     I/O, behind interfaces, each added when a command needs it
a client for the server
```

- **Commands and HTTP handlers are thin.** A command reads its flags, calls
  one service method, and renders the result: text for people, JSON with
  `--json`. A handler does the same with a request. Rendering text is
  presentation, so it stays in `commands`.
- **Services orchestrate.** As in the api, each is built with
  `NewXService(...)` from interfaces, and takes `ctx` first. A service only
  exists once there's orchestration to do. Until then, a command may call the
  core directly, as `docket index` will at first.
- **The core is the spec in Go.** It never touches the filesystem, git, the
  network or a database, so what it works out depends only on what it's
  given. That's what lets the CLI, the server and the UI never disagree, and
  lets the server's history be rebuilt from git.
- **Boundaries** are interfaces with an implementation package each, as the
  api's are: `repositories` and `repositories/sqlite`, for example. Each is
  added with the first command that needs it, never ahead of it.

The core's packages:

| Package   | Does                                                                                                 | Built with                      |
| --------- | ---------------------------------------------------------------------------------------------------- | ------------------------------- |
| `state`   | The types of `state.json`, as the [spec](../../spec/README.md#index-output) defines them                | `docket index`                  |
| `index`   | Reads a project's docs and annotations, and works out evidence, reverse links and problems           | `docket index`                  |
| `combine` | Puts several projects of one product together, as [Combining](../../spec/README.md#combining) describes | `--product`, the server's reads |
| `derive`  | Works out maturity, readiness, risk and exposure                                                     | `docket status`, the API        |
| `diff`    | Compares two states, with the trailers between them                                                  | `docket diff`, `log`, `preview` |

Each is created when the command that needs it is built, not before.

## The parts

| Doc                            | What it covers                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| [The model](model.md)          | Why `state` is the model and there's no `models` package, and where the other types live            |
| [Indexing](indexing.md)        | `Index(fs.FS)`, reading YAML, and checking the indexer against the examples                         |
| [Reads](reads.md)              | The read service and its sources of states, so every reader shows the same thing                    |
| [The server's API](api.md)     | Whole states for the CLI, REST resources for the UI, reading at a point and how things changed      |
| [API docs](api-docs.md)        | The reference at `/docs/api`: the OpenAPI spec, rendered by Scalar with each endpoint's stability   |
| [Storage](storage.md)          | Repositories, SQLite and migrations, and keeping states small                                       |
| [The UI](ui.md)                | Moving the UI to read only from the server's API                                                    |

## Order of work

Each step builds only what its commands need:

1. **`state` and `index`**, with `docket index`, checked against the
   examples.
2. **`check`** and the reads over the working tree: the read service, its
   working tree source, and `derive` as `status` and `list` need it.
3. **`docket ui` serving the API** over the working tree, re-indexing as files
   change.
4. **The server's store**: `docket migrate`, the state and results
   repositories, and the whole-state endpoints, with `apply` and `results`.
5. **The resources**, then the UI moving to them, then the make targets that
   load the examples.
6. **History**: git as an `fs.FS`, `diff`, `log`, `history` and `preview`,
   then `?at=`, changes worked out as states are applied, and the change and
   comparison resources.

## Open decisions

- **How results and changes are modelled.** Both are needed, and both are in
  flux: what each one is, what it holds, and what it's called. The model
  carries into its repository, its type and its resource, so `results` and
  `/changes` are working names until it settles. Names considered so far:
  "runs" or "reports" for results, since each `docket results` call sends one
  JUnit or QA run, and "timeline" or "events" for changes, since the draft
  calls the server's history its timeline. "History" is taken by
  `docket history`.

## Left out for now

- **Signing in.** A server serves one client and is kept off the open
  internet (see [Signing in](../../cmd/docket/README.md#signing-in)).
- **Trends**, such as maturity over time as a chart. They mean deriving at
  many points. They'll be worked out from the stored states when a view wants
  them, and worked out as states are applied if that's slow.
- **`?at=` on `docket ui`**, which serves the working tree. It needs the
  history service, so it comes with history.
- **How the server is configured** beyond its flags and environment
  variables.
