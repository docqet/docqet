# Readiness

Our view of how ready the software is to serve people in production, based on
the engineering judgement written down beside it: each capability's
[stability level](stability-level.md), and its [gaps](gap.md) and their
[risk](risk.md). It's a percentage, with what's still left, and
a recommendation: people judge. Nobody writes it down.

## Details

Readiness is maturity that gaps can hold back. Each capability counts with
its score and weight, at its level in short, its lowest across the domains
that build it, except that **a capability with a gap that's unacceptable on
it counts as the level below its own** until that gap is closed: as if it
hadn't been promoted yet. A Beta capability held back scores what an Alpha
one does, and keeps its own weight. A gap is never unacceptable on a
Prototype, so there's no level below to fall to.

That way promoting a capability never lowers readiness, even when a gap that
was tolerable at its old level is unacceptable at its new one, and a
capability with an unacceptable gap still counts for the work that's done.

Impact, likelihood, reach, stability and broken promises all come in through
risk: a gap's verdict on a capability is worked out from them. Acceptable and
tolerable gaps don't lower readiness, since their verdict says they're fine to
leave open at that level.

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

In Hotel Bookings, the front desk clerk has room booking and check-in at
Beta, cancellations at Alpha, check-out at GA, and group bookings and room
status at Prototype. Three of them have a gap that's unacceptable on them,
each scoring 76, so each counts as the level below its own:

- **Room booking**, Beta, counts as Alpha: its
  [calendar needs a mouse](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/room-booking.md),
  `blocking`, and breaks the promise Beta makes that everyone can use it.
- **Cancellations**, Alpha, counts as Prototype: late cancellations are
  refunded in full, `damaging`, against a rule it follows.
- **Check-out**, GA, counts as Beta: the
  [deployment](../../../spec/examples/hotel-bookings/docs/technical/mechanisms/deployment.md)'s
  migrations have no down step, `damaging` and `possible`, which falls short
  of recovery, an outcome GA expects.

```text
room booking    35 × 4    (Beta, counts as Alpha)
check-in        60 × 4
cancellations   15 × 3    (Alpha, counts as Prototype)
check-out       60 × 6    (GA, counts as Beta)
group bookings  15 × 2
room status     15 × 2

845 ÷ 21 ≈ 40%
```

That's Partly ready, and what's left is:

```text
room booking    close capability:room-booking#calendar-needs-a-mouse
cancellations   reach Beta, now Alpha
                close capability:cancellations#late-cancellations-refunded-in-full
check-out       close mechanism:deployment#migrations-only-go-forward
group bookings  reach Beta, now Prototype
room status     reach Beta, now Prototype
```

Closing those three gaps would make it 59%, Mostly ready. In Hotel Billing,
the manager has city tax at Alpha, deposits and daily takings at Beta, and
night audit at GA, with nothing unacceptable: (35 × 3 + 60 × 4 + 60 × 4 +
100 × 6) ÷ 17 = 1185 ÷ 17 ≈ 70%, Mostly ready, with only city tax left to
reach Beta. The night auditor has only night audit, at GA, so they're 100%,
Ready.

The spec has [how it's worked out](../../../spec/README.md#readiness).

## Not to be confused with

- [Maturity](maturity.md): how far along the work is, for planning. It's the
  same calculation with no gaps in it.
- [Stability level](stability-level.md): how much people can depend on one
  capability, declared.
- [Risk](risk.md): what's at stake in one gap. Readiness counts only the gaps
  that are unacceptable.
