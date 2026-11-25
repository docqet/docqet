# Risk

What's at stake in leaving a [gap](gap.md) open: a score from 0 to 100,
worked out from what the gap could do (its impact, how likely it is and how
many it reaches) and from how much people rely on each capability it shows
on (its [stability level](stability-level.md), and whether the gap breaks a
claim made there), with a verdict on whether that's acceptable. Gaps
are ordered by it, riskiest first. Nobody writes it down. Across some
capabilities, what their gaps put at stake is their
[exposure](exposure.md).

## Details

A long list of gaps says nothing about which ones to care about. Docket can't
know how a running system is used, but it can tell what's at stake from the
judgement written down beside it. Three parts are about the gap, and rated by
hand on it, since only people know them:

- **Impact**: how bad it is for those it reaches when it bites.
- **Likelihood**: how likely it is to bite within a year.
- **Reach**: how many of the people the software serves it would reach.

Two are about what it's in, and worked out:

- **Stability**: the level of each capability it shows on. A product gap
  shows on its capability, and a technical gap on every capability that
  relies on its mechanism or component. The level says how much people are
  entitled to rely on that capability, and how much its gaps can cost them:
  a Prototype is opt-in and its data may be fake, while people have built on
  a GA capability with real data.
- **Whether it breaks a claim there**, for each capability: it affects a
  [rule](rule.md) that capability follows, or a
  [stability checklist](stability-checklist.md) outcome that capability's
  level expects. Following a rule claims it holds, and declaring a level
  claims what it expects, so people depending on that capability are
  relying on something that isn't true yet. How much that matters grows with
  the level: nobody relies on a Prototype's claims, which is opt-in and
  whose data may be fake, while people have built on what GA says.

The gap's three ratings describe the gap, so they never change when its
capability is promoted. Only what it's in changes, so the same gap's risk
grows as its capability moves up, and nobody re-rates it.

On each capability it shows on, a gap scores:

```text
impact × likelihood × reach  ×  level weight × claim factor if it breaks a claim there
└── what the gap could do ─┘    └───── how much people rely on what it's in ─────┘
```

| Impact         | Step |     | Likelihood | Factor |     | Reach  | Factor |     | Level     | Weight | Claim factor |
| -------------- | ---- | --- | ---------- | ------ | --- | ------ | ------ | --- | --------- | ------ | ------------ |
| `negligible`   | 1    |     | `certain`  | 1      |     | `all`  | 1      |     | Prototype | 2      | 1            |
| `inconvenient` | 2    |     | `expected` | ¾      |     | `most` | ¾      |     | Alpha     | 3      | 1.125        |
| `blocking`     | 3    |     | `possible` | ½      |     | `some` | ½      |     | Beta      | 4      | 1.25         |
| `damaging`     | 4    |     | `unlikely` | ¼      |     | `few`  | ¼      |     | GA        | 6      | 1.5          |

Breaking a claim adds nothing on a Prototype, and more at each level after
it, up to half as much again on GA.

It's put on 0 to 100 by a log scale and rounded to a whole number. 0 is a
certain negligible gap reaching everyone on a Prototype, 1 × 2 = 2, and 100 a
certain damaging gap reaching everyone that breaks a claim on GA,
4 × 6 × 1.5 = 36:

```text
score = 100 × ln(raw ÷ 2) ÷ ln(36 ÷ 2), and never below 0
```

Since the raw score multiplies its parts, the log scale makes each of them
add a steady amount instead: each step of impact or level, and breaking a
claim at a given level, moves the score the same way wherever it starts. A gap that's less
likely, or reaches fewer, scores lower, down to 0. A certain gap reaching
everyone, which is what a gap is when it says neither, scores as impact and
level alone.

A draft weighs nothing, since it claims nothing, so a gap scores 0 there.
The gap's **risk** is its highest score: what's at stake where it matters
most. A gap with no impact rated has no risk, and comes after every gap
that's rated.

Stability can outweigh impact: a certain damaging gap on a Prototype, where
data may be fake, scores 48, below a certain blocking gap on GA at 76. And
likelihood can outweigh stability: the same damaging gap on GA, if it's
unlikely, scores 38.

### Verdict

A risk's **verdict** says whether it's OK to leave the gap open at the level
it's at, by the third its score falls in. A gap that's `unacceptable` on a
capability is left to close before that capability is
[ready](readiness.md):

| Verdict        | Score     | What it means                                    |
| -------------- | --------- | ------------------------------------------------ |
| `acceptable`   | 0 to 32   | Fine to leave open.                              |
| `tolerable`    | 33 to 66  | OK to leave for now, but worth closing.          |
| `unacceptable` | 67 to 100 | Not OK to leave open at the level it's at.       |

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

Where there's more than one gap, as in a capability, feature, domain,
persona, initiative or component, each is scored on the capabilities there, and they're
shown as their highest risk and how many fall in each verdict.

### Spread

A gap's **spread** is how its risk spreads across the capabilities it shows
on: how many have each score, highest first, such as
`76 on 1 · 48 on 2 · 38 on 1`. Of two gaps with the same risk, the one with
more capabilities at that score comes first; if they're level there, the one
with more at the next score, and so on. A gap in something many capabilities
rely on spreads further than one on a single capability.

### Exposure

What the gaps still open on some capabilities put at stake, as in a
feature, a domain, a project, an initiative or what serves a persona, is
their [exposure](exposure.md): a percentage of the most they could be exposed
to, from the riskiest gap on each, with a band that says what it means.

### Rating a gap

All three ratings are judgement, in that software's circumstances, and none
of them needs to be exact. Each is rated as if people relied on the
capability, whatever its level, since risk weighs the level already. Where in
the code a gap is doesn't change them, so a gap in a background job, a
library or a deploy script is rated the same way as one on a screen.

#### Impact

How bad it is for those it reaches, if it bit. It's one of four, from least
to most, each taking more than the one before:

| Impact         | What's lost                   | The test                                                                                                                                                                                                              |
| -------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `negligible`   | Nothing                       | Nothing anyone relies on changes. At most, someone notices it.                                                                                                                                                        |
| `inconvenient` | Time                          | What people rely on still comes out right, but it takes them extra time, a step by hand, or a workaround.                                                                                                            |
| `blocking`     | The outcome                   | Someone, or some group of people, can't get done what they rely on it for, by any route available, until it's closed. They know it, and it waits.                                                                     |
| `damaging`     | Something they can't get back | It leaves something wrong that can't be fully put right, or that someone acts on without knowing, at a cost: data lost or kept wrong, money moved wrongly, legal or financial exposure, someone able to do what they shouldn't. |

Ask these in order, and stop at the first yes:

1. Could it leave something wrong that can't be fully put right, or that
   someone acts on without knowing, at a cost? It's `damaging`.
2. Could it stop someone getting done what they rely on it for, with no way
   around it? It's `blocking`.
3. Does it cost someone time, a step by hand, or a workaround, while what
   they get is still right? It's `inconvenient`.
4. Otherwise, it's `negligible`.

Where the lines fall:

- **A wrong result someone notices and puts right is `inconvenient`**: clerks
  correcting children's city tax by hand. It's `damaging` only once nobody
  catches it, or it can't be taken back.
- **Only people count.** A gap that changes nothing for anyone yet, such as
  records that are never cleaned up, is `negligible`, however untidy it is.
- **It's never lowered for being rare or reaching few.** That's what
  likelihood and reach are for. A calendar that needs a mouse is `blocking`
  for anyone who can't use one, however few they are.
- **When torn between two, pick the lower** unless the higher one's test is
  plainly met. That keeps `damaging` rare, so it means something.

#### Likelihood

How likely it is to bite within the next year. Left out, it's `certain`:

| Likelihood | The test                                             |
| ---------- | ---------------------------------------------------- |
| `certain`  | It's happening, or it definitely will within a year. |
| `expected` | You'd bet on it happening within a year.             |
| `possible` | It could happen, but you wouldn't bet on it.         |
| `unlikely` | It would surprise you.                               |

A gap that's biting today is `certain`. One that bites only in some
condition, such as untested corrections that matter only when someone changes
them, is rated by how likely that condition is, and its description says what
the condition is. When torn between two, pick the higher.

#### Reach

How many of the people the software serves it would reach, if it bit: the
people its capabilities' [personas](persona.md) stand for, and whoever runs
it, builds on it, or depends on what it produces. Left out, it's `all`:

| Reach  | The test                                           |
| ------ | -------------------------------------------------- |
| `all`  | Everyone the software serves.                      |
| `most` | Most of them: it's the usual case.                 |
| `some` | A real share of them, but not the usual case.      |
| `few`  | A small group with a particular need or situation. |

It's who they are and what they do, not a count anyone has to know. So the
same gap can reach differently in different software: a calendar that needs a
mouse reaches `some` of a public booking site's guests, and `few` of an
office tool's staff. When it's unclear, or when torn between two, pick the
higher, and say why in its description.

Two kinds of gap always reach `all`, since one case lands on everyone: legal
or contractual exposure the business really has, such as an accessibility
duty, and someone able to do what they shouldn't, such as seeing another
tenant's data.

### Tradeoffs and decisions

A [tradeoff](tradeoff.md) has no risk. Risk asks whether it's OK to leave a
gap open, and a tradeoff is someone's answer: they weighed its drawback and
chose to live with it. An [open decision](open-decision.md) has none either,
since a question doesn't happen to anyone: whatever the software does while
it's open is a gap, rated on its own. A decision is shown with the risk of
the riskiest gap waiting on it, the gaps it affects, so the questions with
most at stake can be asked first: deployment's question about undoing a
schema change has 76 waiting on it.

## In the spec

Each gap's `impact`, `likelihood` and `reach` are in its doc. Hotel
Bookings' [deployment](../../../examples/hotel-bookings/docket/mechanisms/deployment.md)
has migrations with no down step, so undoing a release that changed the
schema means restoring last night's database. That's `damaging`, `possible`,
since a release like that seldom needs undoing, and it reaches everyone. It
affects `outcome:reliability/ga/recovery`, which only GA expects. Shown on its own,
Hotel Bookings relies on deployment for check-out at GA, room booking and
check-in at Beta, cancellations at Alpha, and four capabilities at
Prototype, so it scores:

```text
check-out       GA, breaks a claim       4 × ½ × 1 × 6 × 1.5 = 18  → 76
room booking    Beta                     4 × ½ × 1 × 4       =  8  → 48
check-in        Beta                     4 × ½ × 1 × 4       =  8  → 48
cancellations   Alpha                    4 × ½ × 1 × 3       =  6  → 38
four more       Prototype                4 × ½ × 1 × 2       =  4  → 24
```

Its risk is 76, unacceptable, and its spread
`76 on 1 · 48 on 2 · 38 on 1 · 24 on 4`. Shown with Hotel Billing, check-out
is Alpha, the lowest across the domains that build it, so its risk there is
48, tolerable.

The [ledger](../../../examples/hotel-billing/docket/components/ledger.md)'s
untested corrections of corrections are `damaging` too, but only a
twice-corrected charge is at stake, so they reach `few`, and they're
`expected`, since someone is likely to change how corrections work: 4 × ¾ ×
¼ × 6 × 1.5 = 6.75 on extra charges at GA, or 42, tolerable.

City tax's children corrected by hand are `inconvenient` and happening now,
so `certain`, reach every clerk, affect a rule city tax follows, and show
only on city tax, at Alpha: 2 × 3 × 1.125 = 6.75, or 42, tolerable. That's
the ledger's risk too, and the ledger's gap comes first, since it spreads
further: `42 on 1 · 14 on 1 · 4 on 2`, to city tax's `42 on 1`.

Together, the gaps on Reservations' capabilities give it an exposure of
78%, `high`: [exposure](exposure.md#in-the-spec) shows how.

Readers work out risk once projects are put together, since a mechanism that
applies across a product shows on every project's capabilities. Nothing is
written for it in [state](state.md). The spec has
[how it's worked out](../../../spec/README.md#risk).

## Not to be confused with

- [Exposure](exposure.md): what the gaps on some capabilities put at stake
  together, as a percentage. Risk is one gap's.
- [Stability level](stability-level.md): how much you can depend on a
  capability, as declared. Risk, and exposure, say what's at stake in the
  gaps still open against it, and never change it.
- [Readiness](readiness.md): how ready people can rely on the software
  being. It's maturity less the exposure.
- A priority: Docket doesn't say when a gap is closed. Risk says what's at
  stake; deciding what to do first is up to the people doing it.
