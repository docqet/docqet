---
docqet: concept
id: readiness
domain: understanding
name: Readiness
description: >-
  Our view of how ready the software is to serve people in production, based on
  the engineering judgement written down beside it: each capability's
  [stability level](../../authoring/concepts/stability-level.md), and its [gaps](../../authoring/concepts/gap.md), rated
  [open decisions](../../authoring/concepts/open-decision.md) and their [risk](risk.md). It's a percentage, with its
  improvements, what would raise it, and a recommendation: people judge.
  Nobody writes it down.
confused-with:
  - concept: "concept:maturity@understanding"
    summary: >-
      how far along the work is, for planning. Readiness is maturity less the exposure.
  - concept: "concept:stability-level@authoring"
    summary: >-
      how much people can depend on one capability, declared.
  - concept: "concept:exposure@understanding"
    summary: >-
      what the open gaps and rated decisions put at stake. Readiness takes it off maturity.
---

Readiness is the [maturity](maturity.md) of some capabilities less their
[exposure](exposure.md): how far along the work is, less what the gaps and
decisions still open on it put at stake.

```text
readiness = maturity × (1 − exposure)
```

A feature 60% mature with 20% exposure is 48% ready. Both are worked out from
the same capabilities, each counted once at its level in short, its lowest
across the domains that build it, with the same weights and drafts left out,
so readiness can be read from the two numbers shown beside it.

For a domain, a project or a product, that's the maturity of its
capabilities themselves, each weighted by its level, not the domain's or
project's own [maturity](maturity.md), which weighs parts or features by their
bands. The two can differ: Hotel Bookings is 60% mature, but its readiness
counts its capabilities' 52%.

Every gap lowers it, and so does every rated open decision, through the
riskiest gap or decision on each capability. Impact, likelihood, reach,
stability and broken claims all come in through exposure, so a tolerable
gap or decision lowers readiness a little, and an unacceptable one a lot. A
gap lowers it because something falls short; a decision because its answer
could change what people rely on. A decision with no ratings doesn't lower
it.

## What it counts

| Readiness of                                        | Counts                                 |
| --------------------------------------------------- | -------------------------------------- |
| A capability                                        | Itself                                 |
| A feature                                           | Its capabilities                       |
| A domain                                            | Every capability with a part in it     |
| A project, a product, or several projects shown     | Every capability showing               |
| A persona                                           | Every capability that lists them       |
| A feature, for a persona                            | The capabilities in it that serve them |
| An initiative                                       | Every capability that lists it         |

Showing one [initiative](../../authoring/concepts/initiative.md) narrows every
capability showing to its own, the way showing only some projects does, so
every readiness counts only those.

## Its quarters

Something with no started capabilities has no readiness. Otherwise it falls
in a quarter of its own, so it's never mistaken for maturity, and readers
draw it as a straight bar in the text's color: never a ring, which is
maturity's, nor in a level's color.

| Readiness | From | What it recommends                                                                        |
| --------- | ---- | ----------------------------------------------------------------------------------------- |
| Unready   | 0%   | Most of what they need is still being explored, or what's open on it puts a lot at stake. |
| Partial   | 25%  | Some of it can be used, but much of what they need is still taking shape.                 |
| Viable    | 50%  | Enough is settled for them to rely on day to day.                                         |
| Ready     | 75%  | What they need is mostly stable, and little is at stake in what's still open.             |

The quarter comes from the percentage alone. An unacceptable gap or
decision lowers it a lot, through exposure, but doesn't cap it.

## Its improvements

Readers show with it what would raise it, and by how much, most first:
its [improvements](../capabilities/improvements.md). Each is one thing
that could be done:

- **Promoting** a started capability to its next level, which raises
  maturity, and can raise exposure where a gap or decision breaks a claim
  the new level makes.
- **Closing** the riskiest gap on a capability, which lowers its exposure
  to the next riskiest gap or decision on it.
- **Answering** the riskiest rated decision on a capability, the same way.

Only what would raise it is listed. A gap or decision that isn't the
riskiest on any capability raises nothing yet, so it isn't one until it is,
and a decision with no ratings never is. One that's the riskiest on several
capabilities is one improvement, counting all of them.

There's no finish line. Software that keeps growing is never done, and an
improvement says what could be done, not what has to be: whether it's
worth doing, and when to stop, is for people to judge. Something with no
improvements shows none, without saying it's done. Drafts are listed as
not started.

## Reading it

- **It's a recommendation, not a verdict.** A persona at 60% who can do
  without the one capability whose gaps put most at stake can start using
  the rest. That's for people to judge.
- **Promoting can lower it.** A capability's level counts for more once
  promoted, but where its gaps break a claim the new level makes, its
  exposure goes up too, and can outweigh it. That's what's at stake going
  up.
- **New work lowers it a little.** A new capability at Prototype weighs
  least, so starting one lowers readiness slightly without taking it away:
  five GA capabilities with no gaps and a new Prototype are 95%.
- **It's as good as what's written down.** A gap nobody wrote, or rated too
  low, leaves a capability counting in full. We live with that.

## Example

In Hotel Bookings, the front desk clerk has room booking and check-in at
Beta, cancellations at Alpha, check-out at GA, and group bookings and room
status at Prototype, so what serves them is 59% mature:

```text
(60 × 4 + 60 × 4 + 35 × 3 + 100 × 6 + 15 × 2 + 15 × 2) ÷ 21 = 1245 ÷ 21 ≈ 59%
```

Each capability is exposed to its riskiest gap's share of the most it could
be exposed to. Breaking a claim adds nothing at Prototype, so the
deployment's gap is the same share on the two there as on check-out at GA,
where it does:

```text
room booking    75%  calendar needs a mouse, blocking, breaks Beta's claim
cancellations  100%  late cancellations refunded in full, damaging, breaks a rule
check-in        40%  deployment's migrations go only forward, damaging, possible
check-out       50%  the same, which breaks GA's claim of recovery
group bookings  50%  the same
room status     50%  the same

exposure        (75 × 4 + 40 × 4 + 100 × 3 + 50 × 6 + 50 × 2 + 50 × 2) ÷ 21 = 60%
readiness       59% × (1 − 60%) ≈ 24%
```

That's Unready, just short of Partial. Its improvements, most first, are:

```text
 +14%  close deployment's migrations-only-go-forward   exposure 60% → 36%, on 4, makes it Partial
  +5%  close late-cancellations-refunded-in-full       exposure 60% → 52%, makes it Partial
  +4%  close calendar-needs-a-mouse                    exposure 60% → 53%, makes it Partial
  +4%  check-in reaching GA                            maturity 59% → 70%, exposure 61%, makes it Partial
  +3%  room booking reaching GA                        maturity 59% → 70%, exposure 61%, makes it Partial
  +1%  group bookings reaching Alpha                   maturity 59% → 60%
  +1%  room status reaching Alpha                      maturity 59% → 60%
 +<1%  cancellations reaching Beta                     maturity 59% → 63%, exposure 62%
```

Closing deployment's gap counts on four capabilities, since it's the
riskiest on each. Reaching GA raises exposure a little as well as maturity,
since deployment's gap breaks GA's claim of recovery. Closing deployment's
gap and the calendar's together would leave 26% exposure, mostly from late
cancellations, and make it 44%, Partial.

In Hotel Billing, the manager has city tax at Alpha, deposits and daily
takings at Beta, and night audit at GA: 1185 ÷ 17 ≈ 70% mature, with 18%
exposure, from city tax's children corrected by hand and deposits' provider
calls with no timeout, so 57%, Viable. The night auditor has only night audit, at GA, with no gaps, so
they're 100%, Ready.

## How it's written

Nothing is written for it, and it isn't in
[state](../../authoring/concepts/state.md): readers work it out, since it
depends on [risk](risk.md) and on each capability's level in short, and both
need projects put together.
