# Exposure

How much is at stake in the gaps still open on a feature, a domain, a
project, an initiative, or what serves a persona: how close its capabilities are to the
worst their levels allow. It's a percentage, derived from each gap's
[risk](risk.md) and each capability's [stability level](stability-level.md),
and nobody writes it down. It's to [risk](risk.md) what
[maturity](maturity.md) is to stability: one capability's level, or one
gap's risk, is about a part, and maturity and exposure are about the whole.

## Details

The most a capability could be exposed to is a certain damaging gap,
reaching everyone, that breaks a claim its level makes: 4 × level weight ×
its level's claim factor, from 1 on a Prototype to 1.5 on GA.
A capability is exposed to its riskiest gap's share of that, its own or one
on what it's built on. Each capability then counts with its level weight, as
in maturity, so exposure on GA counts for more than on a Prototype:

```text
a capability's exposure = its riskiest gap's raw score ÷ (4 × level weight × claim factor)
exposure                = Σ (level weight × each capability's exposure) ÷ Σ level weight
```

A capability with no gaps has none. Drafts don't count, and gaps with no
impact rated add nothing.

- **A feature's** comes from its capabilities, each counted once, at its level
  in short: the lowest across the domains that build it.
- **A domain's** comes from every capability with a part in it.
- **A project's**, or a product's, comes from every capability showing.
- **What serves a persona** comes from the capabilities that list them.
- **An [initiative's](initiative.md)** comes from the capabilities that list
  it. Showing one narrows every capability showing to its own, the way
  choosing projects does.

It falls in a quarter, its band:

| Band       | From | What it means                                                   |
| ---------- | ---- | --------------------------------------------------------------- |
| `low`      | 0%   | Little is at stake in its open gaps.                            |
| `minor`    | 25%  | Its open gaps could cost people a little, or seldom.            |
| `moderate` | 50%  | Some of its open gaps could cost people if they bite.           |
| `high`     | 75%  | Its open gaps are likely to cost people, or to cost them a lot. |

- **An unacceptable gap makes it at least `moderate`.** One among many
  capabilities with none is a small share, but it's not OK to leave open.
- **It isn't stability.** A capability's level is declared, and says how
  much people can depend on it. Exposure takes the level as given, weighing
  each gap by it, and says what the gaps still open against it put at stake.
  It never changes the level: a GA capability with high exposure is still
  GA, with gaps against what it claims.
- **It's measured against the worst case.** 100% would be every capability
  carrying a certain damaging gap that breaks a claim, so most software
  sits well below that, and `high` is rare.
- **Only the riskiest gap on each capability counts.** Closing a lesser one
  doesn't change it until the riskiest is closed too. Counting every gap
  would make a gap in something every capability relies on, such as a
  product mechanism, outweigh everything else.
- **It counts gaps the score puts at 0.** A score below the least there is
  shows as 0, but its share of the most isn't nothing.
- **Promoting can raise it.** Where a gap breaks a claim the new level
  makes, what's at stake goes up with the level.

[Readiness](readiness.md) takes it off maturity:
readiness = maturity × (1 − exposure).

The spec has [how it's worked out](../../../spec/README.md#exposure).

## In the spec

Nothing is written for it in a doc, and it isn't in [state](state.md):
readers work it out once projects are put together, since a mechanism that
applies across a product shows on every project's capabilities.

In Hotel Bookings, Reservations' room booking at Beta could be exposed to
4 × 4 × 1.25 = 20, and its riskiest gap, its calendar needing a mouse, is 15
of that, 75%. Cancellations, at Alpha, is at 100%, since late cancellations
refunded in full is the most it could be exposed to, and group bookings, at
Prototype, 4 of 8 from deployment's migrations, 50%. Weighted as in
maturity:

```text
(75% × 4 + 100% × 3 + 50% × 2) ÷ (4 + 3 + 2) ≈ 78%
```

That's `high`. Shown with Hotel Billing, Finance's exposure is 8%, `low`.

## Not to be confused with

- [Risk](risk.md): what's at stake in one gap, from 0 to 100, with a verdict.
  Exposure is about the whole, from the riskiest gap on each capability.
- [Spread](risk.md#spread): how one gap's risk spreads across the
  capabilities it shows on. It orders gaps; it isn't a total.
- [Maturity](maturity.md): how far along the same capabilities are.
- [Readiness](readiness.md): maturity less the exposure, with what's left.
- [Stability level](stability-level.md): how much you can depend on one
  capability, as declared. Exposure never changes it.
