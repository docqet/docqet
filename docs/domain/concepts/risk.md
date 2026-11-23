# Risk

Which [gaps](gap.md) matter most: an order worked out from each gap's impact,
whether it breaks a promise a level makes, and its exposure. Nobody writes it
down.

## Details

A long list of gaps says nothing about which ones to care about. Docket can't
know how a running system is used, but it can tell what's at stake from what's
written down:

- **Impact**, declared on the gap: what happens to whoever relies on it when
  it bites. It's the one part of risk written by hand, since only people know
  the consequence.
- **Whether it breaks a promise**, derived: it names a [rule](rule.md) the
  capability follows, or a [stability checklist](stability-checklist.md)
  outcome that the level of a capability it shows on expects. People
  depending on that level are relying on something that isn't true yet.
- **Exposure**, derived: how much depends on it. A product gap shows on its
  capability, and a technical gap on every capability that relies on its
  mechanism or component, so a gap in something many capabilities rely on
  weighs more. Stable capabilities weigh more than early ones, as they do in
  [maturity](maturity.md), since more people depend on them.

Impact comes first: a damaging gap on one capability matters more than an
inconvenient one across twenty. Within an impact, a gap that breaks a
promise comes before one that doesn't, then the more exposed before the less.
A gap with no impact rated comes last.

### Impact

Impact is one of four, from least to most. It's set by what happens to
whoever relies on what the gap is in: the people who use the software, run
it, build on it, or depend on what it produces. It's never set by how likely
the gap is to bite, or by what kind of software it's in, so a gap in a
background job, a library or a deploy script is rated the same way as one on
a screen. Each step takes more from them than the one before:

| Impact         | What's lost                   | The test                                                                                                                                                                                                              |
| -------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `negligible`   | Nothing                       | Nothing anyone relies on changes. At most, someone notices it.                                                                                                                                                        |
| `inconvenient` | Time                          | What people rely on still comes out right, but it takes them extra time, a step by hand, or a workaround.                                                                                                            |
| `blocking`     | The outcome                   | Someone, or some group of people, can't get done what they rely on it for, by any route available, until it's closed. They know it, and it waits.                                                                     |
| `damaging`     | Something they can't get back | It leaves something wrong that can't be fully put right, or that someone acts on without knowing, at a cost: data lost or kept wrong, money moved wrongly, legal or financial exposure, someone able to do what they shouldn't. |

To rate a gap, ask these in order, and stop at the first yes:

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
- **Blocking some people is `blocking`**: a room calendar that can't be used
  from the keyboard blocks the clerks who can't use a mouse, though others get
  by.
- **Only people count.** A gap that changes nothing for anyone yet, such as
  records that are never cleaned up, is `negligible`, however untidy it is.
- **When torn between two, pick the lower** unless the higher one's test is
  plainly met. That keeps `damaging` rare, so it means something.

A gap that can only bite in certain conditions, such as an untested
correction, or a design that slows down as bills grow, is rated by what would
happen if it bit. Its `when` says what makes it bite, as context for people.
It's never part of risk, since Docket has no way to know whether the condition
holds in the running system.

A [tradeoff](tradeoff.md) rates its drawback the same way, so the choices we
live with can be ordered by what we've accepted. It's ordered by impact, then
exposure: one that names an outcome falls short on purpose, so it breaks no
promise. An [open decision](open-decision.md) has no impact of its own, since
a question doesn't happen to anyone, but it shows the worst impact among the
gaps riding on it.

## In the spec

Each gap's `impact` is in its doc. The ledger's untested corrections are
`damaging`, when someone changes how corrections work. They name
`maintainability/ga/others-can-change`, which extra charges, at GA, expects,
so they break a promise. The ledger is relied on by extra charges at GA,
deposits at Beta, check-out and direct billing at Alpha, and split bills at
Prototype, so their exposure is:

```text
6 + 4 + 3 + 3 + 2 = 18
```

City tax's children corrected by hand are `inconvenient`, name a rule city tax
follows, and show only on city tax, at Alpha: an exposure of 3. The ledger's
gap comes first.

Readers work out risk once projects are put together, since a mechanism that
applies across a platform shows on every project's capabilities. Nothing is
written for it in [state](state.md). The spec has
[how it's worked out](../../../spec/README.md#risk).

## Not to be confused with

- [Stability level](stability-level.md): how much you can depend on a
  capability. Risk orders what's left before you can.
- A priority: Docket doesn't say when a gap is closed. Risk says what's at
  stake; deciding what to do first is up to the people doing it.
