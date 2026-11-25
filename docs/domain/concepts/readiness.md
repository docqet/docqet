# Readiness

Our view of how ready the software is to serve people in production, based on
the engineering judgement written down beside it: each capability's
[stability level](stability-level.md), and its [gaps](gap.md) and their
[risk](risk.md). It's a percentage, with what's still left, and
a recommendation: people judge. Nobody writes it down.

## Details

Readiness is [maturity](maturity.md) less the [exposure](exposure.md) of the
same capabilities: how far along the work is, less what the gaps still open
on it put at stake.

```text
readiness = maturity × (1 − exposure)
```

A feature 60% mature with 20% exposure is 48% ready. Both are worked out from
the same capabilities, each at its level in short, its lowest across the
domains that build it, with the same weights, so readiness can be read from
the two numbers shown beside it.

Impact, likelihood, reach, stability and broken promises all come in through
exposure, through the riskiest gap on each capability, so a tolerable
gap still lowers readiness a little, and an unacceptable one a lot.

| Readiness of             | Counts                                 |
| ------------------------ | -------------------------------------- |
| A capability             | Itself                                 |
| A feature                | Its capabilities                       |
| A domain                 | Every capability with a part in it     |
| A project, or a platform | Every capability showing               |
| A persona                | Every capability that lists them       |
| A feature, for a persona | The capabilities in it that serve them |
| An initiative            | Its capabilities                       |

Showing one [initiative](initiative.md) narrows every capability showing to
its own, the way choosing projects does, so each readiness counts only those.

Drafts don't count, and something with no started capabilities has no
readiness. It falls in a quarter of its own:

| Readiness     | From | What it recommends                                                                   |
| ------------- | ---- | ------------------------------------------------------------------------------------ |
| Unready       | 0%   | Most of what they need is still being explored, or its gaps put a lot at stake.      |
| Partial       | 25%  | Some of it can be used, but much of what they need is still taking shape.            |
| Viable        | 50%  | Enough is settled for them to rely on day to day.                                    |
| Ready         | 75%  | What they need is mostly stable, with nothing unacceptable left open.                |

- **It comes with what's left.** Each capability below Beta, the first level
  settled enough for real use, needs to reach Beta, and each gap that's
  unacceptable on one needs closing. A capability at Beta or GA with neither
  has nothing left. Lesser gaps still lower readiness, but aren't left to
  do: their verdict says they're fine to leave open.
- **It's a recommendation, not a verdict.** A persona at 60% who can do
  without the one capability whose gaps put most at stake can start using
  the rest. That's for people to judge.
- **Promoting can lower it.** A capability's level counts for more once
  promoted, but where its gaps break a promise the new level makes, its
  exposure goes up too, and can outweigh it. That's what's at stake going
  up.
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
status at Prototype, so what serves them is 59% mature. Each capability is
exposed to its riskiest gap's share of the most it could be exposed to:

```text
room booking    75%  calendar needs a mouse, blocking, breaks Beta's promise
cancellations  100%  late cancellations refunded in full, damaging, breaks a rule
check-in        33%  deployment's migrations go only forward, damaging, possible
check-out       50%  the same, which breaks GA's promise of recovery
group bookings  33%  the same
room status     33%  the same

exposure        (75 × 4 + 33 × 4 + 100 × 3 + 50 × 6 + 33 × 2 + 33 × 2) ÷ 21 ≈ 56%
readiness       59% × (1 − 56%) ≈ 26%
```

That's Partial, and what's left is:

```text
room booking    close capability:room-booking#calendar-needs-a-mouse
cancellations   reach Beta, now Alpha
                close capability:cancellations#late-cancellations-refunded-in-full
check-out       close mechanism:deployment#migrations-only-go-forward
group bookings  reach Beta, now Prototype
room status     reach Beta, now Prototype
```

Closing those three gaps would leave 11% exposure, from the bookings
component's unknown clashes, and make it 53%, Viable. In Hotel
Billing, the manager has city tax at Alpha, deposits and daily takings at
Beta, and night audit at GA: 70% mature, with 18% exposure, from city tax's
children corrected by hand and deposits' provider calls with no timeout, so
57%, Viable, with only city tax left to reach Beta. The night auditor
has only night audit, at GA, with no gaps, so they're 100%, Ready.

The spec has [how it's worked out](../../../spec/README.md#readiness).

## Not to be confused with

- [Maturity](maturity.md): how far along the work is, for planning.
  Readiness is maturity less the exposure.
- [Stability level](stability-level.md): how much people can depend on one
  capability, declared.
- [Exposure](exposure.md): what the open gaps put at stake.
  Readiness takes it off maturity.
