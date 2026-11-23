# Maturity

How far along a feature, a domain or a project is: how much of the work under
way is stable and supported. It's a percentage, derived from capabilities'
[stability levels](stability-level.md), and nobody writes it down.

## Details

Stable capabilities count for more than early ones, and drafts don't count at
all, since no work has started on them. A feature's maturity comes from its
capabilities, a domain's from its parts of features, and a project's from all
its parts of features. Each falls in a [band](band.md).

- **It's about the whole, not each part.** It's an indication, not a verdict.
  Before depending on something, check the stability level of the capability
  you need.
- **Starting new work lowers it**, without anything having got worse.
- **100% isn't the goal.** Software that keeps growing always has newer parts
  settling in.

The spec has [how it's worked out](../../../spec/README.md#how-maturity-is-worked-out).

## In the spec

Nothing is written for it in a doc. Each level has a score and a weight:

| Level | Score | Weight |
| --- | --- | --- |
| Prototype | 15 | 2 |
| Alpha | 35 | 3 |
| Beta | 60 | 4 |
| GA | 100 | 6 |

Reservations has room booking at Beta, cancellations at Alpha, group bookings
at Prototype, and the waitlist as a draft, which doesn't count:

```text
(60 × 4 + 35 × 3 + 15 × 2) ÷ (4 + 3 + 2) = 375 ÷ 9 ≈ 42%
```

The indexer writes it in the feature's entry in [state](state.md), with its
band:

```json
{ "id": "reservations", "maturity": 42, "band": "alpha" }
```

## Not to be confused with

- [Stability level](stability-level.md): how much you can depend on one
  capability. Maturity is about the whole.
- [Readiness](readiness.md): how ready the software is for a persona, on a
  scale of its own.
