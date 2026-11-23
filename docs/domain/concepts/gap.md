# Gap

Something the software doesn't do yet, or doesn't do as intended, that we've
chosen to write down rather than hide. We intend to close it, and when and
how is up to us: Docket lists it so we know about it.

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
- **It says what's at stake**: its impact, what happens to whoever relies on
  it when it bites, from `negligible` to `damaging`, so Docket can work out
  its [risk](risk.md). A gap that only bites in certain conditions says when, as
  context for people.
- **It can be riding on an [open decision](open-decision.md)**: what it
  costs depends on how a question is answered. The decision names it, and
  shows what's at stake.

A capability that's missing altogether isn't a gap: it's a draft capability.

## Lifecycle

Open → Closed

A closed gap is deleted, and git has its history. A gap we decide never to
close becomes a [tradeoff](tradeoff.md), with its drawback.

## In the spec

Gaps are listed in the frontmatter of the doc they're on, each with an `id`
unique in that doc, a `name` saying in a few words what falls short, a
`description` of a sentence or two, and optionally the `outcome` or `rule` it
falls short of, its `impact`, and `when` it bites. On [city tax](../../../spec/examples/hotel-billing/docs/product/domains/billing/capabilities/city-tax.md):

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

A technical gap on the [ledger](../../../spec/examples/hotel-billing/docs/technical/components/ledger.md)
names an outcome, and only bites when someone changes the code:

```yaml
gaps:
  - id: corrections-of-corrections-untested
    name: Corrections of corrections untested
    outcome: maintainability/ga/others-can-change
    impact: damaging
    description: >-
      Nothing tests correcting a line that is itself a correction, ...
    when: Someone changes how corrections work.
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
- A task: Docket doesn't say when or how a gap is closed. Planning that is a
  task tracker's job. [Risk](risk.md) says what's at stake, not what to do
  first.
