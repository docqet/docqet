---
docqet: concept
id: risk
domain: reporting
name: Risk
description: >-
  What's at stake in leaving a [gap](../../authoring/concepts/gap.md), or a rated
  [open decision](../../authoring/concepts/open-decision.md), open: a score from 0 to 100,
  worked out from what it could do (its impact, how likely it is and how
  many it reaches) and from how much people rely on each capability it shows
  on (its [stability level](../../authoring/concepts/stability-level.md), and whether it breaks a
  claim made there), with a verdict on whether that's acceptable. Gaps and
  decisions are ordered by it, riskiest first. Nobody writes it down. Across
  some capabilities, what their gaps and decisions put at stake is their
  [exposure](exposure.md).
confused-with:
  - concept: "concept:exposure"
    summary: >-
      what the gaps and decisions on some capabilities put at stake together, as a percentage. Risk is one gap's or decision's.
  - concept: "concept:stability-level@authoring"
    summary: >-
      how much you can depend on a capability, as declared. Risk, and exposure, say what's at stake in the gaps still open against it, and never change it.
  - concept: "concept:readiness"
    summary: >-
      how ready people can rely on the software being. It's maturity less the exposure.
  - term: "A priority"
    summary: >-
      Docqet doesn't say when a gap is closed. Risk says what's at stake; deciding what to do first is up to the people doing it.
---

A long list of gaps says nothing about which ones to care about. Docqet can't
know how a running system is used, but it can tell what's at stake from the
judgement written down beside it, so readers score each gap's risk and the
ones that matter are read first. Three parts are about the gap, and rated by
hand on every gap, since only people know them:

- **Impact**: how bad it is for those it reaches when it bites.
- **Likelihood**: how likely it is to bite within a year.
- **Reach**: how many of the people the software serves it would reach.

An open decision can be rated with the same three, read about what its
answer could change rather than about something biting, and then has a risk
worked out the same way: see [Decisions](#decisions).

Two are about what it's in, and worked out:

- **Stability**: the level of each capability it shows on. A product gap
  shows on its capability, and a technical gap on every capability that
  relies on its mechanism or component. The level says how much people are
  entitled to rely on that capability, and how much its gaps can cost them:
  a Prototype is opt-in and its data may be fake, while people have built on
  a GA capability with real data.
- **Whether it breaks a claim there**, for each capability: it
  [affects](../../authoring/concepts/gap.md) a
  [rule](../../authoring/concepts/rule.md) that capability follows, or an
  outcome that capability's level
  [expects](../../authoring/concepts/rubric.md), so that outcome shows
  as not met there. Following a rule claims it holds, and declaring a level
  claims what it expects, so people depending on that capability are
  relying on something that isn't true yet. How much that matters grows with
  the level: nobody relies on a Prototype's claims, which is opt-in and
  whose data may be fake, while people have built on what GA says. A draft
  claims nothing.

The gap's three ratings describe the gap, so they never change when its
capability is promoted. Only what it's in changes, so the same gap's risk
grows as its capability moves up, and nobody re-rates it.

## How it's worked out

On each capability it shows on, a gap scores what it could do, times how
much people rely on what it's in:

```text
impact step × likelihood × reach  ×  level weight × claim factor if it breaks a claim there
└──── what the gap could do ───┘     └───── how much people rely on what it's in ─────┘
```

| Impact         | Step |     | Likelihood | Factor |     | Reach  | Factor |     | Level     | Weight | Claim factor |
| -------------- | ---- | --- | ---------- | ------ | --- | ------ | ------ | --- | --------- | ------ | ------------ |
| `negligible`   | 1    |     | `certain`  | 1      |     | `all`  | 1      |     | Prototype | 2      | 1            |
| `inconvenient` | 2    |     | `expected` | ¾      |     | `most` | ¾      |     | Alpha     | 3      | 1.125        |
| `blocking`     | 3    |     | `possible` | ½      |     | `some` | ½      |     | Beta      | 4      | 1.25         |
| `damaging`     | 4    |     | `unlikely` | ¼      |     | `few`  | ¼      |     | GA        | 6      | 1.5          |

- **Every gap rates all three.** None has a default, so every gap has a
  risk. A certain gap reaching everyone scores as impact and level alone.
- **The level weight is [maturity's](maturity.md#how-its-worked-out).** A
  draft weighs 0, since it claims nothing, so a gap scores 0 there.
- **Breaking a claim adds nothing on a Prototype**, and more at each level
  after it, up to half as much again on GA.

It's put on 0 to 100 by a log scale, rounded to a whole number, and never
below 0. 0 is a certain negligible gap reaching everyone on a Prototype,
1 × 2 = 2, and 100 a certain damaging gap reaching everyone that breaks a
claim on GA, 4 × 6 × 1.5 = 36:

```text
score = 100 × ln(raw ÷ 2) ÷ ln(36 ÷ 2), and never below 0
```

Since the raw score multiplies its parts, the log scale makes each of them
add a steady amount instead: each step of impact or level, and breaking a
claim at a given level, moves the score the same way wherever it starts. A
gap that's less likely, or reaches fewer, scores lower, down to 0.

The gap's **risk** is its highest score: what's at stake where it matters
most.

Stability can outweigh impact: a certain damaging gap on a Prototype, where
data may be fake, scores 48, below a certain blocking gap on GA at 76. And
likelihood can outweigh stability: the same damaging gap on GA, if it's
unlikely, scores 38.

Where there's more than one gap, as in a capability, feature, domain,
persona, initiative or component, each is scored only on the capabilities
there, and they're shown as their highest risk and how many fall in each
verdict.

## Verdict

A risk's **verdict** says whether it's OK to leave the gap open at the level
it's at, by the third its score falls in. A gap that's `unacceptable` on a
capability isn't OK to leave open there, and lowers its
[readiness](readiness.md) a lot:

| Verdict        | Score     | What it means                              |
| -------------- | --------- | ------------------------------------------ |
| `acceptable`   | 0 to 32   | Fine to leave open.                        |
| `tolerable`    | 33 to 66  | OK to leave for now, but worth closing.    |
| `unacceptable` | 67 to 100 | Not OK to leave open at the level it's at. |

Every score for a certain gap reaching everyone, with the score where it
breaks a claim there after it:

| Impact         | Prototype | Alpha   | Beta    | GA       |
| -------------- | --------- | ------- | ------- | -------- |
| `damaging`     | 48 / 48   | 62 / 66 | 72 / 80 | 86 / 100 |
| `blocking`     | 38 / 38   | 52 / 56 | 62 / 70 | 76 / 90  |
| `inconvenient` | 24 / 24   | 38 / 42 | 48 / 56 | 62 / 76  |
| `negligible`   | 0 / 0     | 14 / 18 | 24 / 32 | 38 / 52  |

Each step down in likelihood or reach takes off 10 for `expected` or `most`,
24 for `possible` or `some`, and 48 for `unlikely` or `few`, never going below
0. A damaging gap on Beta is 72 when certain, 62 when expected, 48 when
possible and 24 when unlikely.

## Spread

A gap's **spread** is how its risk spreads across the capabilities it shows
on: how many have each score, highest first, such as
`76 on 1 · 48 on 2 · 38 on 1`. Readers order gaps by risk, highest first,
then by spread: of two gaps with the same risk, the one with more
capabilities at that score comes first; if they're level there, the one with
more at the next score, and so on. A gap in something many capabilities
rely on spreads further than one on a single capability.

## Exposure

What the gaps still open on some capabilities put at stake, as in a
feature, a domain, a project, an initiative or what serves a persona, is
their [exposure](exposure.md): a percentage of the most they could be exposed
to, from the riskiest gap on each, with a band that says what it means.

## Rating a gap

Risk is worked out from each gap's `impact`, `likelihood` and `reach`. How to
rate each, with the tests and where the lines fall, is on
[gap](../../authoring/concepts/gap.md#whats-at-stake).

## Decisions

An [open decision](../../authoring/concepts/open-decision.md) rated with
`impact`, `likelihood` and `reach` has a risk, worked out exactly as a
gap's is, with the same steps, factors, weights, scale and verdicts, so the
two are ordered together, riskiest first. One with no ratings has none.

The numbers are the same, but what they're about isn't. A gap's risk is
what's at stake while something falls short. A decision's is what's at
stake in its answer changing what people rely on now:

| Rating         | On a gap                                       | On a decision                                                        |
| -------------- | ---------------------------------------------- | -------------------------------------------------------------------- |
| **Impact**     | How bad it is for those it reaches, if it bit. | How bad it is for those it reaches, if the answer changes it.        |
| **Likelihood** | How likely it is to bite within a year.        | How likely it is that the answer changes what the software does now. |
| **Reach**      | How many of the people served it would reach.  | How many of the people served the change would reach.                |

The two parts worked out are read the same way for both:

- **Stability** is the level of each capability it counts on: for a
  decision, the capability it's on, or every capability of the feature,
  domain, component or mechanism it's on.
- **It breaks a claim** where it affects an outcome that capability's level
  expects. For a gap, the outcome isn't met. For a decision, whether it's
  met isn't settled, so nobody can vouch for it yet.

So a question costs little on a Prototype, where questions are expected and
nobody relies on what it does, and a lot on GA, which promises that what
people rely on stays as it is. A decision's verdict reads as a gap's does:
whether it's OK to leave the question open at the level it's at.

What a decision affects, such as a gap waiting on its answer, never gives it
risk, and the gap keeps its own. How to rate a decision is on
[open decision](../../authoring/concepts/open-decision.md#whats-at-stake).

## Tradeoffs

A [tradeoff](../../authoring/concepts/tradeoff.md) has no risk. Risk asks
whether it's OK to leave a gap open, and a tradeoff is someone's answer: they
weighed its drawback and chose to live with it.

## Examples

Hotel Bookings'
[deployment](../../../../examples/hotel-bookings/docqet/mechanisms/deployment.md)
has migrations with no down step, so undoing a release that changed the
schema means restoring last night's database. Its gap,
`migrations-only-go-forward`, is `damaging`, `possible`, since a release like
that seldom needs undoing, and it reaches everyone. It affects
`outcome:reliability/ga/recovery`, which only GA expects. Shown on its own,
Hotel Bookings relies on deployment for check-out at GA, room booking and
check-in at Beta, cancellations at Alpha, and group bookings, room status,
cleaning and the rate calendar at Prototype, so it scores:

```text
check-out       GA, breaks a claim       4 × ½ × 1 × 6 × 1.5 = 18  → 76
room booking    Beta                     4 × ½ × 1 × 4       =  8  → 48
check-in        Beta                     4 × ½ × 1 × 4       =  8  → 48
cancellations   Alpha                    4 × ½ × 1 × 3       =  6  → 38
four more       Prototype                4 × ½ × 1 × 2       =  4  → 24
```

Its risk is 76, `unacceptable`, and its spread
`76 on 1 · 48 on 2 · 38 on 1 · 24 on 4`. Shown with Hotel Billing, check-out
is Alpha, the lowest across the domains that build it, so its risk there is
48, `tolerable`.

The [ledger](../../../../examples/hotel-billing/docqet/components/ledger.md)'s
`corrections-of-corrections-untested` is `damaging` too, but only a
twice-corrected charge is at stake, so it reaches `few`, and it's `expected`,
since someone is likely to change how corrections work: 4 × ¾ × ¼ = 0.75
before its level. On extra charges at GA, where it breaks a claim, that's
6.75, or 42, `tolerable`. On split bills at Prototype it's 1.5, below the
least there is, so 0.

City tax's children corrected by hand are `inconvenient` and happening now,
so `certain`, reach every clerk, affect a rule city tax follows, and show
only on city tax, at Alpha: 2 × 3 × 1.125 = 6.75, or 42, `tolerable`. That's
the ledger's risk too, and the ledger's gap comes first, since it spreads
further: `42 on 1 · 14 on 1 · 4 on 2 · 0 on 1`, to city tax's `42 on 1`.

Together, the gaps on Reservations' capabilities give it an exposure of
78%, `high`: [exposure](exposure.md#example) shows how.

## How it's written

Each gap's `impact`, `likelihood` and `reach` are written in its doc, on the
[gap](../../authoring/concepts/gap.md), and a rated decision's on the
[decision](../../authoring/concepts/open-decision.md). Nothing else is
written for risk, and
it isn't in [state](../../authoring/concepts/state.md): readers work it out
once projects are put together, since a mechanism that applies across a
product shows on every project's capabilities.
