# State

What the [indexer](indexer.md) writes: a snapshot of a project at one commit,
with everything declared and derived.

## Details

The UI shows only the state and never reads the repository itself. To show
several projects together, it reads each one's state and **combines** them: it
puts each doc's contributions together, works out reverse links and maturity
again across them, and finds the [contradictions](contradiction.md) between
them. Showing only some projects combines just what they define.

Some things are worked out only when the state is shown, since they depend on
other projects: which outcomes a capability meets with evidence.

## In the spec

`.docket/state.json`, one per project.
[Hotel Bookings'](../../../spec/examples/hotel-bookings/.docket/state.json),
with each list cut down to its keys:

```json
{
  "docket": "0.1",
  "project": { "id": "hotel-bookings", "name": "Hotel Bookings" },
  "commit": "4f2c9e1",
  "indexedAt": "2026-11-18T15:04:00Z",
  "summary": {
    "maturity": 60,
    "band": "beta",
    "capabilities": { "draft": 1, "prototype": 4, "alpha": 1, "beta": 2, "ga": 1 },
    "gaps": 4,
    "tradeoffs": 3,
    "problems": 0
  },
  "domains": [], "features": [], "personas": [], "capabilities": [],
  "rules": [], "concepts": [], "systems": [], "components": [],
  "gaps": [], "tradeoffs": [], "problems": [],
  "checklist": {}
}
```

The spec's [index output](../../../spec/README.md#index-output) describes each
part.

## Not to be confused with

- [Doc](doc.md): what people write. The state is what's worked out from the
  docs, and nobody edits it by hand.
