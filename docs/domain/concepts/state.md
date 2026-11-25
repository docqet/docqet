# State

What the [indexer](indexer.md) writes: a snapshot of a project at one commit,
with everything declared and derived.

## Details

Everything Docket shows is worked out from states, never from the repository
directly. `docket` works it out, as the CLI or as the server, and the UI only
shows what `docket` gives it. To show several projects together, `docket`
reads each one's state and **combines** them: it puts each doc's
contributions together, works out reverse links again across them, and finds
the [contradictions](contradiction.md) between them. Showing only some
projects combines just what they define.

Some things are worked out only when the state is shown, since they depend on
other projects: which outcomes a capability meets with evidence,
[risk](risk.md), [maturity](maturity.md) and [readiness](readiness.md).
`docket` works these out too, and the UI never does.

A state can be of a working tree, uncommitted changes included, or of a
commit. The server keeps each project's state at every commit applied to it
on its main branch, so how anything changed is worked out by comparing them.

## In the spec

`.docket/state.json`, one per project, beside its `docket.yaml`.
[Hotel Bookings'](../../../spec/examples/hotel-bookings/.docket/state.json),
with each list cut down to its keys:

```json
{
  "docket": "0.1",
  "project": { "id": "hotel-bookings", "name": "Hotel Bookings" },
  "commit": "4f2c9e1",
  "indexedAt": "2026-11-18T15:04:00Z",
  "summary": {
    "capabilities": { "draft": 1, "prototype": 4, "alpha": 1, "beta": 2, "ga": 1 },
    "gaps": 4,
    "tradeoffs": 3,
    "problems": 0
  },
  "domains": [], "features": [], "personas": [], "initiatives": [],
  "capabilities": [], "rules": [], "concepts": [], "mechanisms": [],
  "components": [], "gaps": [], "tradeoffs": [], "problems": [],
  "checklist": {}
}
```

The spec's [index output](../../../spec/README.md#index-output) describes each
part.

## Not to be confused with

- [Doc](doc.md): what people write. The state is what's worked out from the
  docs, and nobody edits it by hand.
