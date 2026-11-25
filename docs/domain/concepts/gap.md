# Gap

A known shortfall in what the software does, or in how it's built, that needs
work nobody has done yet: building, deciding, designing or testing. It's
written down rather than hidden, so people see it before they depend on what
it's in. We intend to close it, and when and how is up to us: Docket lists it
so we know about it.

## Details

Who would notice it decides where it's recorded:

- **A product gap** is something someone using the product would notice, such
  as the room calendar not being usable from the keyboard. It's on the
  [capability](capability.md), in the domain's words.
- **A technical gap** is something only someone working on the code would
  notice, such as nothing testing a correction of a correction in the ledger.
  It's on the [mechanism](mechanism.md) or [component](component.md), in the code's
  words, and shows on every capability that relies on it. Technical debt is a
  technical gap.

When a gap has a visible effect and a technical cause, the effect is the
product gap, and the technical doc's body explains the cause. It's never
written as two gaps.

- **It can name what it falls short of**: a
  [stability checklist](stability-checklist.md) outcome, which then shows as
  not met, or a [rule](rule.md) the capability doesn't hold to yet, which the
  rule then shows. City tax is added for children, so it doesn't yet hold to
  "children pay no city tax". When a gap is really about something that must
  always hold, and no rule says so, write the rule and name it: the rule is
  what we intend, and the gap is the part not done yet. Several gaps can name
  one rule, each a part of it.
- **It says what's at stake**: its impact, how bad it is for those it
  reaches, from `negligible` to `damaging`; its likelihood, how likely it is
  to bite within a year, from `certain` to `unlikely`; and its reach, how many
  of the people the software serves it would reach, from `all` to `few`. From
  them and the capability's level, Docket works out its [risk](risk.md). A
  gap that only bites in certain conditions says what they are in its
  description, and its likelihood says how likely they are.

A capability that's missing altogether isn't a gap: it's a draft capability.
Relying on a capability at a lower level isn't a gap either, such as
referrals relying on Partnerships at Alpha: that capability's level already
says how much can be counted on, so a gap saying so would count it twice.

A gap is never just what its own level already says. Being behind a flag,
open only to those who opt in, not yet in production, or still changing is
what Prototype and Alpha mean, so none of it is a gap. It becomes one when
the level says otherwise, such as a Beta capability that still isn't
available to the people it serves.

A bug usually isn't a gap. When the software is meant to do something and
simply doesn't, fixing the code closes it, so it belongs in the issue
tracker. A gap is a shortfall that needs work nobody has done yet: building,
deciding, designing or testing. A known bug becomes a gap only when it won't
be fixed soon and changes what people can rely on.

## Lifecycle

Open → Closed

A closed gap is deleted, and git has its history. A gap we decide never to
close is deleted too, and written as a [tradeoff](tradeoff.md), with its
drawback.

## In the spec

Gaps are listed in the frontmatter of the doc they're on, each with an `id`
unique in that doc, a `name` saying in a few words what falls short, a
`description` of a sentence or two, and optionally the `outcome` or `rule` it
falls short of, its `impact`, its `likelihood`, `certain` when left out, and
its `reach`, `all` when left out. On [city tax](../../../spec/examples/hotel-billing/docket/domains/billing/capabilities/city-tax.md):

```yaml
gaps:
  - id: children-corrected-by-hand
    name: City tax charged for children
    rule: rule:children-pay-no-city-tax
    impact: inconvenient
    description: >-
      Guests' ages aren't recorded, so city tax is added for every guest on a
      stay, and clerks correct it by hand for children.
```

A technical gap on the [ledger](../../../spec/examples/hotel-billing/docket/components/ledger.md)
names an outcome. It's `expected`, since someone is likely to change how
corrections work within a year, and reaches `few`, since only a
twice-corrected charge is at stake:

```yaml
gaps:
  - id: corrections-of-corrections-untested
    name: Corrections of corrections untested
    outcome: maintainability/ga/others-can-change
    impact: damaging
    likelihood: expected
    reach: few
    description: >-
      Nothing tests correcting a line that is itself a correction, so a change
      to how corrections work in `correct` could stop a twice-corrected charge
      netting to zero without anything failing.
```

Its ID is `component:ledger#corrections-of-corrections-untested`, and the code it
shows in points at it, in place of a bare TODO:

```ts
// docket:gap component:ledger#corrections-of-corrections-untested
export function correct(bill: Bill, line: Line, id: string, businessDay: string): void {
```

## Not to be confused with

- [Tradeoff](tradeoff.md): something we've decided to live with, and don't
  intend to close.
- [Open decision](open-decision.md): what's intended isn't settled yet.
- A draft [capability](capability.md): a whole result of value not started
  yet.
- A bug: the software meant to do something and doesn't, closed by fixing
  the code, in the issue tracker. A gap needs work nobody has done yet.
- A task: Docket doesn't say when or how a gap is closed. Planning that is a
  task tracker's job. [Risk](risk.md) says what's at stake, not what to do
  first.
