# Risk

What's at stake in leaving a [gap](gap.md) open: a score from 0 to 100,
worked out from its impact, the [stability level](stability-level.md) of
each capability it shows on, and whether it breaks the promise that level
makes, with a verdict on whether that's acceptable. Gaps are ordered by it,
riskiest first. Nobody writes it down.

## Details

A long list of gaps says nothing about which ones to care about. Docket can't
know how a running system is used, but it can tell what's at stake from what's
written down:

- **Impact**, declared on the gap: what happens to whoever relies on it when
  it bites. It's the one part of risk written by hand, since only people know
  the consequence.
- **Stability**, derived: the level of each capability it shows on. A
  product gap shows on its capability, and a technical gap on every
  capability that relies on its mechanism or component. Stable capabilities
  weigh more than early ones, since more people depend on them, and on real
  data.
- **Whether it breaks that level's promise**, derived, for each capability:
  it names a [rule](rule.md) that capability follows, or a
  [stability checklist](stability-checklist.md) outcome that capability's
  level expects. People depending on that level are relying on something
  that isn't true yet.

On each capability it shows on, a gap scores:

```text
impact × level weight × 1.5 if it breaks that level's promise
```

put on 0 to 100 by a log scale, rounded to a whole number. 0 is the least
there is, a negligible gap on a Prototype, 1 × 2 = 2, and 100 the most, a
damaging gap that breaks a promise on GA, 4 × 6 × 1.5 = 36:

```text
score = 100 × ln(raw ÷ 2) ÷ ln(36 ÷ 2)
```

Since the raw score multiplies its parts, the log scale makes each of them
add a steady amount instead: each step of impact or level, and breaking a
promise, moves the score the same way wherever it starts. Equal distances on
the scale mean equal multiples of what's at stake, so the verdicts can be
even thirds of it.

| Impact         | Step |     | Level     | Weight |
| -------------- | ---- | --- | --------- | ------ |
| `negligible`   | 1    |     | Prototype | 2      |
| `inconvenient` | 2    |     | Alpha     | 3      |
| `blocking`     | 3    |     | Beta      | 4      |
| `damaging`     | 4    |     | GA        | 6      |

A draft weighs nothing, since it promises nothing, so a gap scores 0 there.
The gap's **risk** is its highest score: what's at stake where it matters
most. A gap with no impact rated has no risk, and comes after every gap
that's rated.

Stability can outweigh impact: a damaging gap on a Prototype, where data may
be fake, scores 48, below a blocking gap on GA at 76.

### Verdict

A risk's **verdict** says whether it's OK to leave the gap open at the level
it's at, by the third its score falls in. A capability with a gap that's
`unacceptable` on it counts for nothing in [readiness](readiness.md) until
it's closed:

| Verdict        | Score     | What it means                                    |
| -------------- | --------- | ------------------------------------------------ |
| `acceptable`   | 0 to 32   | Fine to leave open.                              |
| `tolerable`    | 33 to 66  | OK to leave for now, but worth closing.          |
| `unacceptable` | 67 to 100 | Not OK to leave open at the level it's at.       |

Every score there is, with the score where it breaks that level's promise
after it:

| Impact         | Prototype | Alpha   | Beta    | GA       |
| -------------- | --------- | ------- | ------- | -------- |
| `damaging`     | 48 / 62   | 62 / 76 | 72 / 86 | 86 / 100 |
| `blocking`     | 38 / 52   | 52 / 66 | 62 / 76 | 76 / 90  |
| `inconvenient` | 24 / 38   | 38 / 52 | 48 / 62 | 62 / 76  |
| `negligible`   | 0 / 14    | 14 / 28 | 24 / 38 | 38 / 52  |

Where there's more than one gap, as in a capability, feature, domain,
persona or component, each is scored on the capabilities there, and they're
shown as their highest risk and how many fall in each verdict.

### Exposure

A gap's **exposure** is how its risk spreads across the capabilities it
shows on: how many carry each score, highest first, such as
`100 on 1 · 72 on 1 · 62 on 2`. Of two gaps with the same risk, the one with
more capabilities at that score comes first; if they're level there, the one
with more at the next score, and so on. A gap in something many capabilities
rely on is more exposed than one on a single capability.

### Impact

Impact is one of four, from least to most. It's always about the people the
software serves: the people its capabilities' [personas](persona.md) stand
for, and whoever runs it, builds on it, or depends on what it produces. It's
set in two steps, by judgement, in that software's circumstances:

1. **What it takes from those of them it would affect**, by the test below.
2. **What share of them it would affect**, if it bit. Only a few of them
   steps it down one; none of them makes it `negligible`.

So the same gap can rate differently in different software: a calendar that
needs a mouse blocks a public booking site's guests who can't use one, and is
`inconvenient` or less in an office tool whose staff all can. Where in the
code a gap is doesn't change it, so a gap in a background job, a library or a
deploy script is rated the same way as one on a screen. It's never set by how
likely the gap is to bite, or by the capability's level: rate it as if people
relied on the capability, whatever its level, since risk weighs it by that
level already. So the same gap's risk grows as its capability is promoted,
and nobody re-rates it. Each step takes more from them than the one before:

| Impact         | What's lost                   | The test                                                                                                                                                                                                              |
| -------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `negligible`   | Nothing                       | Nothing anyone relies on changes. At most, someone notices it.                                                                                                                                                        |
| `inconvenient` | Time                          | What people rely on still comes out right, but it takes them extra time, a step by hand, or a workaround.                                                                                                            |
| `blocking`     | The outcome                   | Someone, or some group of people, can't get done what they rely on it for, by any route available, until it's closed. They know it, and it waits.                                                                     |
| `damaging`     | Something they can't get back | It leaves something wrong that can't be fully put right, or that someone acts on without knowing, at a cost: data lost or kept wrong, money moved wrongly, legal or financial exposure, someone able to do what they shouldn't. |

To rate what it takes, ask these in order, and stop at the first yes:

1. Could it leave something wrong that can't be fully put right, or that
   someone acts on without knowing, at a cost? It's `damaging`.
2. Could it stop someone getting done what they rely on it for, with no way
   around it? It's `blocking`.
3. Does it cost someone time, a step by hand, or a workaround, while what
   they get is still right? It's `inconvenient`.
4. Otherwise, it's `negligible`.

Then weigh how many of the people the software serves it would reach, if it
bit:

| It would reach                                 | Impact                                                    |
| ---------------------------------------------- | --------------------------------------------------------- |
| Most of them, or a meaningful share            | As rated                                                  |
| Only a few of them                             | One step lower                                            |
| None of them today                             | `negligible`, with `when` saying who would change that    |

Two kinds of `damaging` never step down, since one case is enough: legal or
contractual exposure the business really has, such as an accessibility duty,
and someone able to do what they shouldn't, such as seeing another tenant's
data.

Where the lines fall:

- **A wrong result someone notices and puts right is `inconvenient`**: clerks
  correcting children's city tax by hand. It's `damaging` only once nobody
  catches it, or it can't be taken back.
- **Blocking a meaningful share of them is `blocking`**: a room calendar that
  can't be used from the keyboard is `blocking` if some of the hotel's clerks
  can't use a mouse, though others get by. If none of them would, it's
  `negligible` until one joins.
- **Only people count.** A gap that changes nothing for anyone yet, such as
  records that are never cleaned up, is `negligible`, however untidy it is.
- **It's judgement, not arithmetic.** The share is how many of them it could
  reach, by who they are and what they do, not a count anyone has to know.
  When it's unclear, rate it as if it reached them, and say why in its
  description.
- **When torn between two, pick the lower** unless the higher one's test is
  plainly met. That keeps `damaging` rare, so it means something.

A gap that can only bite in certain conditions, such as an untested
correction, or a design that slows down as bills grow, is rated by what would
happen if it bit. Its `when` says what makes it bite, as context for people.
It's never part of risk, since Docket has no way to know whether the condition
holds in the running system.

A [tradeoff](tradeoff.md) rates its drawback the same way, so the choices we
live with can be ordered by what we've accepted. It's scored the same way,
without the promise: one that names an outcome falls short on purpose, so it
breaks no promise. An [open decision](open-decision.md) has no impact of its own, since
a question doesn't happen to anyone, but it shows the highest risk among the
gaps riding on it.

## In the spec

Each gap's `impact` is in its doc. The ledger's untested corrections are
`damaging`, when someone changes how corrections work. They name
`maintainability/ga/others-can-change`, which only GA expects. The ledger is
relied on by extra charges at GA, deposits at Beta, check-out and direct
billing at Alpha, and split bills at Prototype, so they score:

```text
extra charges   GA, breaks its promise   4 × 6 × 1.5 = 36  → 100
deposits        Beta                     4 × 4       = 16  →  72
check-out       Alpha                    4 × 3       = 12  →  62
direct billing  Alpha                    4 × 3       = 12  →  62
split bills     Prototype                4 × 2       =  8  →  48
```

Their risk is 100, unacceptable, and their exposure
`100 on 1 · 72 on 1 · 62 on 2 · 48 on 1`.

City tax's children corrected by hand are `inconvenient`, name a rule city tax
follows, and show only on city tax, at Alpha: 2 × 3 × 1.5 = 9, or 52,
tolerable. The ledger's gap comes first.

Readers work out risk once projects are put together, since a mechanism that
applies across a platform shows on every project's capabilities. Nothing is
written for it in [state](state.md). The spec has
[how it's worked out](../../../spec/README.md#risk).

## Not to be confused with

- [Stability level](stability-level.md): how much you can depend on a
  capability. Risk orders what's left before you can.
- [Readiness](readiness.md): how ready people can rely on the software
  being. It counts only the gaps that are `unacceptable`.
- A priority: Docket doesn't say when a gap is closed. Risk says what's at
  stake; deciding what to do first is up to the people doing it.
