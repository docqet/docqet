---
docqet: concept
id: exposure
domain: reporting
name: Exposure
description: >-
  How much is at stake in the gaps and rated open decisions still open on a
  feature, a domain, a project, an initiative, or what serves a persona: how
  close its capabilities are to the worst their levels allow. It's a
  percentage, derived from each gap's and decision's [risk](risk.md) and each
  capability's [stability level](../../authoring/concepts/stability-level.md),
  and nobody writes it down. It's to [risk](risk.md) what
  [maturity](maturity.md) is to stability: one capability's level, or one
  gap's or decision's risk, is about a part, and maturity and exposure are
  about the whole.
confused-with:
  - concept: "concept:risk"
    summary: >-
      what's at stake in one gap or decision, from 0 to 100, with a verdict. Exposure is about the whole, from the riskiest gap or decision on each capability.
  - term: "[Spread](risk.md#spread)"
    summary: >-
      how one gap's or decision's risk spreads across the capabilities it shows on. It orders them; it isn't a total.
  - concept: "concept:maturity"
    summary: >-
      how far along the same capabilities are.
  - concept: "concept:readiness"
    summary: >-
      maturity less the exposure, with what's left.
  - concept: "concept:stability-level@authoring"
    summary: >-
      how much you can depend on one capability, as declared. Exposure never changes it.
---

Exposure is what the gaps still open on some capabilities, and the open
decisions rated on them, put at stake together, from 0 to 100%. It isn't
their stability, which is declared.
[Readiness](readiness.md) takes it off their maturity:
readiness = maturity × (1 − exposure).

## How it's worked out

The most a capability could be exposed to is a certain damaging gap,
reaching everyone, that breaks a claim its level makes: 4 × its level weight
× its level's claim factor, from 1 on a Prototype to 1.5 on GA (see
[risk](risk.md#how-its-worked-out)). A capability is exposed to the share of
that of its riskiest gap or decision: its own, or one on its feature or
domain, or on what it's built on. The exposure of several is the average of
each started capability's, weighted by its level weight, as in
[maturity](maturity.md), so exposure on GA counts for more than on a
Prototype:

```text
a capability's exposure = its riskiest gap's or decision's raw score ÷ (4 × level weight × claim factor)
exposure                = Σ (level weight × each capability's exposure) ÷ Σ level weight
```

A capability with no gaps and no rated decisions has none. A decision with
no ratings never counts. Drafts don't count.

- **A feature's** comes from its capabilities, each counted once, at its level
  in short: the lowest across the domains that build it.
- **A domain's** comes from every capability with a part in it, each at its
  level in short too, not its level in that domain.
- **A project's**, or a product's, comes from every capability showing.
- **What serves a persona** comes from the capabilities that list them.
- **An [initiative's](../../authoring/concepts/initiative.md)** comes from the
  capabilities that list it. Showing one narrows every capability showing to
  its own, the way choosing projects does.

### Gaps and decisions together

A gap and a rated decision are scored the same way, so they're compared as
they are: whichever scores higher on a capability is what it's exposed to.
They're read differently, though. A gap's share is what's at stake while
something falls short. A decision's is what's at stake in its answer
changing what people rely on now, so exposure counts how unsettled what
people rely on is, as well as how short it falls. How each is rated, and
why the same scale reads differently on a decision, is on
[risk](risk.md#decisions).

## Its bands

It falls in a quarter, its band, and readers draw it as maturity is, a ring,
in its band's color:

| Band       | From | What it means                                                       |
| ---------- | ---- | ------------------------------------------------------------------- |
| `low`      | 0%   | Little is at stake in what's open on it.                            |
| `minor`    | 25%  | What's open on it could cost people a little, or seldom.            |
| `moderate` | 50%  | Some of what's open on it could cost people if it bites or changes. |
| `high`     | 75%  | What's open on it is likely to cost people, or to cost them a lot.  |

An [unacceptable](risk.md#verdict) gap or decision on any of the capabilities makes it at
least `moderate`. One among many capabilities with none is a small share, but
it's not OK to leave open.

## Reading it

- **It isn't stability.** A capability's level is declared, and says how
  much people can depend on it. Exposure takes the level as given, weighing
  each gap by it, and says what the gaps still open against it put at stake.
  It never changes the level: a GA capability with high exposure is still
  GA, with gaps against what it claims.
- **It's measured against the worst case.** 100% would be every capability
  carrying a certain damaging gap that breaks a claim, so most software
  sits well below that, and `high` is rare.
- **Only the riskiest gap or decision on each capability counts.** Closing a
  lesser gap, or answering a lesser decision, doesn't change it until the
  riskiest is closed or answered too. Counting every one would make a gap
  in something every capability relies on, such as a product mechanism,
  outweigh everything else.
- **It counts gaps and decisions the score puts at 0.** A score below the
  least there is shows as 0, but its share of the most isn't nothing.
- **Promoting can raise it.** Where a gap or decision breaks a claim the new
  level makes, what's at stake goes up with the level.
- **Answering a decision can lower it, or not.** Answering removes the
  decision's share, but what its answer becomes, such as a new gap, counts
  on its own.

## Example

In Hotel Bookings, Reservations' room booking at Beta could be exposed to
4 × 4 × 1.25 = 20, and its riskiest gap, its calendar needing a mouse, is 15
of that, 75%. Cancellations, at Alpha, could be exposed to 4 × 3 × 1.125 =
13.5, and is at 100%, since late cancellations refunded in full is the most
it could be exposed to. Group bookings, at Prototype, is 4 of 8 from
deployment's migrations, 50%. Weighted as in maturity:

```text
(75% × 4 + 100% × 3 + 50% × 2) ÷ (4 + 3 + 2) ≈ 78%
```

That's `high`. Shown with Hotel Billing, Finance's exposure is 8%, `low`.

## How it's written

Nothing is written for it in a doc, and it isn't in
[state](../../authoring/concepts/state.md): readers work it out once projects
are put together, since a mechanism that applies across a product shows on
every project's capabilities.
