# Maturity

How far along a feature, a domain, a project, an initiative, or what serves a
persona is: how much of the work under way is stable and supported. It's a percentage, derived from capabilities'
[stability levels](stability-level.md), and nobody writes it down. It's for
seeing where the work is heading. How ready people can rely on it being,
with gaps taken into account, is [readiness](readiness.md).

## Details

Stable capabilities count for more than early ones, and drafts don't count at
all, since no work has started on them.

- **A feature's** comes from its capabilities, each counted once, at its level
  in short: the lowest across the domains that build it.
- **A domain's** comes from its parts of features, each from the capabilities
  that domain builds, at their levels there.
- **A project's**, or a platform's, comes from its features.
- **What serves a persona** comes from the capabilities that list them, as a
  feature's does, each counted once at its level in short.
- **An [initiative's](initiative.md)** comes from the capabilities that list
  it, the same way.

Showing one initiative narrows every capability showing to its own, the way
choosing projects does, so every maturity counts only those.

Each maturity falls in a [band](band.md).

- **It's about the whole, not each part.** It's an indication, not a verdict.
  Before depending on something, check its readiness.
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

That's Emerging. Readers work it out, since a capability's level in short
needs every project that builds part of it, so it isn't in
[state](state.md). Shown with Hotel Billing, Front desk has check-in at Beta,
and check-out at GA in Guest stays but Alpha in Billing, so Alpha in short:

```text
(60 × 4 + 35 × 3) ÷ (4 + 3) = 345 ÷ 7 ≈ 49%
```

## Not to be confused with

- [Stability level](stability-level.md): how much you can depend on one
  capability. Maturity is about the whole.
- [Exposure](exposure.md): what the gaps open on the same capabilities put
  at stake. It's to risk what maturity is to stability.
- [Readiness](readiness.md): maturity less the same capabilities' exposure,
  with what's left.
