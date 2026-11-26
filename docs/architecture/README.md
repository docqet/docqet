# How `docket` is built

_Decisions and direction for `docket`'s Go code: where its logic lives, how
the CLI and the server share it, and the API the UI reads. Indexing,
checking, applying states to the server, combining, deriving and the
resources are built. Everything else here is the plan, and may change as the
prototype teaches us. [The order of work](#order-of-work) says which is
which._

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
internal/state, index, check, combine,        the format in Go: pure functions, no I/O
derive, diff
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
- **The core is the format in Go.** It never touches the filesystem, git, the
  network or a database, so what it works out depends only on what it's
  given. That's what lets the CLI, the server and the UI never disagree, and
  lets the server's history be rebuilt from git.
- **Boundaries** are interfaces with an implementation package each, as the
  api's are: `repositories` and `repositories/sqlite`, for example. Each is
  added with the first command that needs it, never ahead of it.

The core's packages:

| Package   | Does                                                                                                    | Built with                          |
| --------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `state`   | The types of `state.json`, as the [state](../../docket/domains/authoring/concepts/state.md) concept defines them                | `docket index`                      |
| `index`   | Reads a project's docs and annotations, and works out evidence, reverse links and problems              | `docket index`                      |
| `check`   | Finds the problems a state shows on its own, for the CLI and the server alike                           | `docket check`, `apply`, the server |
| `combine` | Puts several projects of one product together, as [Combining](../../docket/domains/reporting/concepts/product.md) describes | `--product`, the server's reads     |
| `derive`  | Works out maturity, readiness, risk and exposure                                                        | `docket status`, the API            |
| `diff`    | Compares two states, with the trailers between them                                                     | `docket diff`, `log`, `preview`     |

Each is created when the command that needs it is built, not before, but
for `combine` and `derive`: they were ported from the UI first, so the read
service could serve the figures the UI shows, and their callers come with it.

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

1. **Built: `state`, `index` and `check`**, with `docket index` and
   `docket check` over the working tree or a commit, checked against the
   examples.
2. **Built: `combine` and `derive`**, ported from the UI's TypeScript and
   checked against it figure by figure, for every example product and for
   Docket. Built too: the read service, over the server's store or the
   states `docket ui` shows. Still to come: `status`, `list` and `show`
   calling it.
3. **`docket ui` serving the API** over the working tree. Built: it serves the
   API over `.docket/state.json` as `docket index` wrote it. Still to come:
   indexing the working tree itself, and again as files change.
4. **The server's store.** Built: `docket migrate`, the state repository, the
   whole-state endpoints and `apply`. Still to come: results, with their
   repository and `docket results`.
5. **The resources.** Built: every resource in [the API](api.md#resources-for-the-ui),
   with its spec. Still to come: the UI moving to them, then the make targets
   that load the examples.
6. **History**: git as an `fs.FS`, `diff`, `log`, `history` and `preview`,
   then `?at=`, changes worked out as states are applied, and the change and
   comparison resources.

## Open decisions

Open decisions are in Docket's own docs, such as how results and changes are
modelled, on the [Reporting](../../docket/domains/reporting/domain.md) domain.

## Left out for now

What's left out for now is in Docket's own docs, as gaps, tradeoffs and draft
capabilities: signing in on
[Applying states](../../docket/domains/reporting/capabilities/applying.md),
[Trends](../../docket/domains/reporting/capabilities/trends.md),
`?at=` on the [Local viewer](../../docket/domains/reporting/capabilities/local-viewer.md),
and how the server is configured on the [Server](../../docket/components/server.md)
component.
