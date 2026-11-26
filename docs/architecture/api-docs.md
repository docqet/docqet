# API docs

_The reference at `GET /docs/api`, on both `docket serve` and `docket ui`:
the OpenAPI spec bundled into one document, rendered by Scalar, with each
endpoint's stability and each group's maturity drawn on top by our own
script. It's the api repository's, copied with only the names changed. Part
of [how `docket` is built](README.md)._

**Code:** `internal/handlers/http/docs.go` (the page), `docs_bundle.go`
(bundling, and every operation's level), `static/docs/api.yaml` and the files
it references, `static/docs/stability-marks.js` and `.css`.

## How it works

- `NewDocsHandler` bundles the spec once at startup, inlining every `$ref`.
  An operation without a valid `x-stability` fails the bundle, so the server
  won't start rather than serve an unlabeled endpoint.
- The bundler gives each operation below GA an `x-badges` badge, ending its
  name with an invisible U+2060 so the script can find exactly those badges.
  It also writes every operation's level, each tag's levels, and the tags'
  navigation order into `window.EXALYNT_STABILITY` on the page. The script
  needs that because Scalar only draws a tag's operations once it's opened.
- `stability-marks.js` watches Scalar's DOM and, as it renders, swaps those
  badges for stability marks, adds a mark to each operation and a maturity
  ring to each tag in the navigation, and adds the overview under the
  introduction's `## Maturity` heading.
- Every endpoint is documented as it's built: a file under
  `static/docs/paths/`, referenced from `api.yaml`'s `paths`, with its
  schemas in `schemas.yml`. `make check` and CI lint the spec with Redocly
  (`redocly.yaml`).
- Only the API under `/api/v1` is documented. `projects.json` and each
  project's `state.json` are the UI's own contract until it moves to the
  resources, so they aren't.

## Gotchas

- The levels, their colors and wording, and how maturity is weighted mirror
  the design package's `stability/stability.ts` and `maturity/maturity.ts`,
  which the UI copies into `ui/src/design/`. Change them there first, then
  here, then in the api repository's copy.
- Scalar's markdown styles start with `.scalar-app .markdown`, and are loaded
  after ours. Styles for anything we add inside the introduction must start
  the same way, or Scalar's list and link styles win.
- The overview's heading must stay `## Maturity` in `api.yaml`. Renaming it
  changes the id the script looks for, and the overview silently disappears.

## Known gaps

- **The script depends on Scalar's page structure**, as the api
  repository's does, and the page loads `@scalar/api-reference` from
  jsdelivr without a version. A Scalar release can stop the marks, rings and
  overview appearing, without an error. Nothing tests the rendered page.
- **Two copies of the script and bundler**, here and in the api repository,
  kept in step by hand.
