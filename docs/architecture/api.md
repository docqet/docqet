# The server's API

_The endpoints the CLI sends and reads whole states through, and the resources
the UI reads, now and at any point in time. Part of [how `docket` is
built](README.md)._

The server has two kinds of callers, so it has two kinds of endpoint.

## Whole states, for the CLI

A state is the unit the CLI sends and receives: one project, at one commit.

```text
PUT /api/v1/projects/{project}/commits/{sha}           apply: the state, its parents, commit time and trailers
PUT /api/v1/projects/{project}/commits/{sha}/results   results: JUnit or QA
GET /api/v1/projects/{project}                         the project, with its latest commit, where apply starts from
GET /api/v1/projects/{project}/state                   the latest applied state, whole
GET /api/v1/projects/{project}/commits/{sha}           a commit, without its state, so apply can skip one already sent
GET /api/v1/projects/{project}/commits/{sha}/state     a commit's state, whole
```

All but results are built.

- **`PUT` because sending a commit twice changes nothing**, as `apply` needs,
  and `apply --replace` replaces it: `201` for a commit new to the server,
  `200` for one it had.
- **The server checks every state it's sent** with the CLI's own check. It
  refuses one that isn't a state with `400`, and stores the problems it finds
  itself, as [Indexing](indexing.md#problems) describes.
- **The CLI reads whole states** too, for `--product`: it combines the working
  tree with the other projects' states itself, and keeps them in
  `.docket/product/`. These are its endpoints, not the UI's.

## Resources, for the UI

The UI, and any other tool or agent, reads REST resources: never a state file.

```text
GET /api/v1/products
GET /api/v1/products/{product}
GET /api/v1/products/{product}/status?initiative=mvp&for=persona:front-desk-clerk
GET /api/v1/products/{product}/projects
GET /api/v1/products/{product}/rubric
GET /api/v1/products/{product}/capabilities?stability=beta&initiative=mvp
GET /api/v1/products/{product}/capabilities/{id}
GET /api/v1/products/{product}/capabilities/{id}/gaps/{key}
GET /api/v1/products/{product}/domains/{domain}/rules/{id}
GET /api/v1/products/{product}/domains/{domain}/concepts/{id}
GET /api/v1/products/{product}/gaps?sort=risk&impact=blocking,damaging
GET /api/v1/products/{product}/search?q=refund
GET /api/v1/products/{product}/domains, features, personas, initiatives, rules, concepts,
    mechanisms, components, decisions, tradeoffs, problems, and each one by ID
```

All but `?at=` are built, in `internal/handlers/http`'s `ProductsHandler`,
over the read service. `internal/handlers/http/resources.go` lists every
route and resource.

- **Resources are the product's, not a project's.** What anyone sees is the
  combined product: a feature can be built by two projects, contradictions
  only appear across them, and an ID is unique within a product. A project is
  a resource of its own, saying what it contributed and the last commit
  applied.
- **They carry what's derived.** A capability comes with its maturity,
  readiness and gaps scored by risk, worked out by `derive`, so the UI works
  nothing out.
- **Filters are the CLI's flags.** `?initiative=`, `?for=`, `?sort=` and the
  rest mean what `docket list`'s `--initiative`, `--for` and `--sort` mean,
  since both call the read service. `?project=a,b` shows only some of a
  product's projects, as `--project` does.
- **Search is an endpoint of its own**, since the UI searches every doc's
  name, description and body, and a reader shouldn't page through every doc
  to do it.
- **References become paths.** A gap or tradeoff is nested under the doc it's
  on, since `#` can't be in a path: `capability:room-booking#calendar-needs-a-mouse`
  is `/capabilities/room-booking/gaps/calendar-needs-a-mouse`. A rule or
  concept is nested under its domain.

## Time

The server keeps every state applied, so its API answers two questions about
time, each in its own way.

**What it was like at a point** is the same resources, read at that point:

```text
GET /api/v1/products/hotel/capabilities/room-booking                the latest
GET /api/v1/products/hotel/capabilities/room-booking?at=9b1e004     as of a commit
GET /api/v1/products/hotel/gaps?at=2026-10-01T00:00:00Z&sort=risk   as of a time
```

- **`?at=` is on every resource**, rather than a second tree of resources
  under a path such as `/at/{sha}/`.
- **For a product, a point is a time,** since its projects' commits are
  separate. `at=<time>` reads each project's latest state applied at or before
  it. `at=<sha>` reads that project at that commit, and the others as of its
  commit time, as `--at` with `--product` does.
- **Time is commit time,** not when a state was applied, since history comes
  from git. A backfill with `apply --from` lands where its commits happened.
- **A commit the server hasn't applied is a `404`.** It never guesses the
  nearest one. Only the main branch's commits are applied, so only they can
  be named.
- **Every response says the point it was read at**, in a `Docket-At` header,
  and the UI sends it back as `?at=` on what it asks next. Every list is
  paginated, so without this, a state applied between two pages would mix two
  states in one view. A screen pins its point once, and everything on it is
  read from the same states.
- **The product resource says what it was built from**: each project's commit
  and when it was applied. That's how a read says what it's showing, without
  an envelope around every list.

**How it changed** is resources of their own, the server's side of
`docket log`, `diff` and the timeline:

```text
GET /api/v1/products/hotel/changes?since=2026-09-01&initiative=mvp   docket log gaps --initiative mvp --since … --remote --product
GET /api/v1/products/hotel/capabilities/room-booking/changes         docket log capability:room-booking --remote
GET /api/v1/products/hotel/compare?from=<sha>&to=<sha>               docket diff --remote <from> <to>
GET /api/v1/projects/hotel-bookings/commits                          the commits applied, with their times and trailers
```

- **A change** is one entry in a log: its date, commit and project, what
  happened, such as a gap closed, a promotion or a decision answered, and what
  it's about. `/changes` is a paginated list of them, filtered like any other.
  How a change is modelled is still in flux (see
  [the Reporting domain's decisions](../../docket/domains/reporting/domain.md)).
- **A comparison** is the net difference between two points, as `docket diff`
  shows it. It isn't a collection, so it's a read of its own, as GitHub's
  `/compare` is.

On the server:

- **Every applied state is kept, one per project per commit, and never
  changed.** Reading at a point picks the states for it, then combines and
  derives them as it does for the latest.
- **Changes are worked out when a state is applied, and stored.** That's when
  the server has the state before and the state after: `diff` compares the
  project's two states, then the product combined before and after, which
  finds what only the product shows, such as a new contradiction. `/changes`
  is then an ordinary paginated query, rather than diffs worked out across
  hundreds of commits on every request.
- **Everything stored can be rebuilt**: changes from the states, and the
  states from git. When `diff` or the format changes, `apply --replace` rebuilds
  them.
- **What's worked out for a point never changes**, since the states it's read
  from never do. It can be cached safely if it ever needs to be.

## Conventions

The api repository's REST conventions apply:

- **Paths** are plural and kebab-case, under `/api/v1`.
- **Each endpoint returns a translated resource**, a `CapabilityResource`
  built from the state and what's derived, never a raw `state` type. The
  whole-state endpoints are the one exception: there, the state is the
  resource.
- **A list is a bare JSON array**, and an error is `{"error": "..."}`, with
  the api's status codes.
- **Every list is paginated from its first version**, through
  `github.com/exalynt/turn`, with `Link` and `X-Total-Count` headers and
  never anything in the body. So filtering, sorting and search are the
  server's job, and a view that wants everything, such as the canvas or the
  feature map, pages through it. Resources are worked out in memory, so
  their lists are numbered pages, `?page=` and `?size=`, of up to 500.
- **At Prototype, endpoints change in place.** Nothing depends on them yet.
- **Every endpoint is in the OpenAPI spec** as it's built, with its
  `x-stability`, and shows in the reference at `/docs/api` (see
  [API docs](api-docs.md)).
