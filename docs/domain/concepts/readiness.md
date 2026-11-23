# Readiness

Whether the software is ready enough for people to use, and if not, what it
still needs. A capability is ready or not. A feature, domain, project or
persona is ready when every capability it counts is, and otherwise says how
many are, such as `2 of 4 ready`. Nobody writes it down.

## Details

It's meant to be good enough to act on, not precise. A **capability is
ready** when:

- **Its [stability level](stability-level.md) is Beta or GA**, its lowest
  across the domains that build it. Beta is the first level settled enough
  for real use.
- **No [gap](gap.md) is unacceptable on it**: no gap's [risk](risk.md),
  scored on that capability, has the verdict `unacceptable`.

A capability that's started but not ready is **not ready yet**, and **what it
needs** is to reach Beta, when it's below, and to close each gap that's
unacceptable on it. A draft is **not started**: it's neither ready nor not,
and counts toward nothing, so writing one down never makes anything less
ready.

| Readiness of             | Counts                                 |
| ------------------------ | -------------------------------------- |
| A feature                | Its capabilities                       |
| A domain                 | Every capability with a part in it     |
| A project, or a platform | Every capability showing               |
| A persona                | Every capability that lists them       |
| A feature, for a persona | The capabilities in it that serve them |

Something with no started capabilities has no readiness.

- **It lists what's left.** Anything not ready shows each capability that
  isn't, with what it needs, so "not ready" always comes with what to do
  about it.
- **A count isn't a verdict on whether it's enough.** `5 of 6 ready` doesn't
  say whether the one that isn't matters to someone. A persona who can do
  without it can start using the rest. That's for people to judge.
- **It's as good as what's written down.** A gap nobody wrote, or rated too
  low, leaves a capability looking ready. We live with that.

How far along the work is, rather than whether it can be used, is
[maturity](maturity.md), shown beside it on features, domains and projects.
Readiness doesn't depend on it: an average can be high while one capability
someone needs isn't ready.

## In the spec

Nothing is written for it, and it isn't in [state](state.md): readers work it
out once projects are put together, since it depends on risk and on each
capability's level across domains.

In Hotel Billing, the manager has city tax at Alpha, deposits at Beta, and
daily takings at Beta and night audit at GA, with no gaps. Deposits relies on
the [ledger](../../../spec/examples/hotel-billing/docs/technical/components/ledger.md),
whose untested corrections are `damaging` and score 72 there, unacceptable:

```text
Manager: 2 of 4 ready

city tax   reach Beta, now Alpha
deposits   close component:ledger#corrections-of-corrections-untested (72)
```

The night auditor has only night audit, so they're Ready.

The spec has [how it's worked out](../../../spec/README.md#readiness).

## Not to be confused with

- [Stability level](stability-level.md): how much people can depend on one
  capability, declared. Readiness is worked out from levels and gaps.
- [Maturity](maturity.md): how far along the work is. A persona never has
  one.
- [Risk](risk.md): what's at stake in one gap. Readiness counts only the gaps
  that are unacceptable.
