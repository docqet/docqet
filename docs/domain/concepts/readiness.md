# Readiness

How ready people can rely on the software being, as a percentage, with what
it still needs. It's Docket's recommendation, and people judge. It's worked
out from capabilities' [stability levels](stability-level.md), as
[maturity](maturity.md) is, and from the [risk](risk.md) of their
[gaps](gap.md). Nobody writes it down.

## Details

Readiness is maturity that gaps can hold back. Each capability counts with
its score and weight, at its level in short, its lowest across the domains
that build it, except that **a capability with a gap that's unacceptable on
it counts for nothing** until that gap is closed. It still weighs what its
level weighs, so an unacceptable gap on something people depend on most
costs most.

Impact, stability and broken promises all come in through risk: a gap's
verdict on a capability is worked out from them. Acceptable and tolerable gaps
don't lower readiness, since their verdict says they're fine to leave open at
that level.

| Readiness of             | Counts                                 |
| ------------------------ | -------------------------------------- |
| A capability             | Itself                                 |
| A feature                | Its capabilities                       |
| A domain                 | Every capability with a part in it     |
| A project, or a platform | Every capability showing               |
| A persona                | Every capability that lists them       |
| A feature, for a persona | The capabilities in it that serve them |

Drafts don't count, and something with no started capabilities has no
readiness. It falls in a quarter of its own:

| Readiness     | From | What it recommends                                                                   |
| ------------- | ---- | ------------------------------------------------------------------------------------ |
| Not ready     | 0%   | Most of what they need is still being explored, or held back by what's unacceptable. |
| Partly ready  | 25%  | Some of it can be used, but much of what they need is still taking shape.            |
| Mostly ready  | 50%  | Enough is settled for them to rely on day to day.                                    |
| Ready         | 75%  | What they need is mostly stable, with nothing unacceptable left open.                |

- **It comes with what's left.** Each capability below Beta, the first level
  settled enough for real use, needs to reach Beta, and each gap that's
  unacceptable on one needs closing. A capability at Beta or GA with neither
  has nothing left.
- **It's a recommendation, not a verdict.** A persona at 60% who can do
  without the one capability that's held back can start using the rest.
  That's for people to judge.
- **New work lowers it a little.** A new capability at Prototype weighs
  least, so starting one lowers readiness slightly without taking it away.
- **It's as good as what's written down.** A gap nobody wrote, or rated too
  low, leaves a capability counting in full. We live with that.

## In the spec

Nothing is written for it, and it isn't in [state](state.md): readers work it
out once projects are put together, since it depends on risk and on each
capability's level across domains.

In Hotel Billing, the manager has city tax at Alpha, deposits at Beta, and
daily takings at Beta and night audit at GA, with no gaps. Deposits relies on
the [ledger](../../../spec/examples/hotel-billing/docs/technical/components/ledger.md),
whose untested corrections are `damaging` and score 72 there, unacceptable,
so deposits counts for nothing:

```text
(35 × 3 + 0 × 4 + 60 × 4 + 100 × 6) ÷ (3 + 4 + 4 + 6) = 945 ÷ 17 ≈ 56%
```

That's Mostly ready, and what's left is:

```text
city tax   reach Beta, now Alpha
deposits   close component:ledger#corrections-of-corrections-untested
```

Closing the ledger's gap would make it 70%. The night auditor has only night
audit, at GA, so they're 100%, Ready.

The spec has [how it's worked out](../../../spec/README.md#readiness).

## Not to be confused with

- [Maturity](maturity.md): how far along the work is, for planning. It's the
  same calculation with no gaps in it, and a persona never has one.
- [Stability level](stability-level.md): how much people can depend on one
  capability, declared.
- [Risk](risk.md): what's at stake in one gap. Readiness counts only the gaps
  that are unacceptable.
