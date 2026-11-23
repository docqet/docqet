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
  It's on the [system](system.md) or [component](component.md), in the code's
  words, and shows on every capability that relies on it. Technical debt is a
  technical gap.

When a gap has a visible effect and a technical cause, the effect is the
product gap, and the technical doc's body explains the cause. It's never
written as two gaps.

- **It can name what it falls short of**: a
  [stability checklist](stability-checklist.md) outcome, which then shows as
  not met, or a [rule](rule.md) the capability doesn't hold to yet, which the
  rule then shows. City tax is added for children, so it doesn't yet hold to
  "children pay no city tax".
- **It can't excuse the security and privacy baseline.** That holds at every
  level, and is never a known gap.

A capability that's missing altogether isn't a gap: it's a draft capability.

## Lifecycle

Open → Closed

A closed gap is deleted, and git has its history. A gap we decide never to
close becomes a [tradeoff](tradeoff.md), with its cost.

## In the spec

Gaps are listed in the frontmatter of the doc they're on, each with an `id`
unique in that doc, `text`, and optionally the `outcome` or `rule` it
falls short of. On [city tax](../../../spec/examples/hotel-billing/docs/product/domains/billing/capabilities/city-tax.md):

```yaml
gaps:
  - id: children-corrected-by-hand
    rule: tax/children-pay-no-city-tax
    text: >-
      Guests' ages aren't recorded, so city tax is added for every guest on a
      stay, and clerks correct it by hand for children.
```

A technical gap on the [ledger](../../../spec/examples/hotel-billing/docs/technical/systems/ledger.md)
names an outcome:

```yaml
gaps:
  - id: corrections-of-corrections-untested
    outcome: maintainability/ga/others-can-change
    text: >-
      Nothing tests correcting a line that is itself a correction, ...
```

Its ID is `system:ledger#corrections-of-corrections-untested`, and the code it
shows in points at it, in place of a bare TODO:

```ts
// docket:gap system:ledger#corrections-of-corrections-untested
export function correct(bill: Bill, line: Line, id: string, businessDay: string): void {
```

## Not to be confused with

- [Tradeoff](tradeoff.md): something we've decided to live with, and don't
  intend to close.
- [Open decision](open-decision.md): what's intended isn't settled yet.
- A draft [capability](capability.md): a whole result of value not started
  yet.
- A task: Docket doesn't say when or how a gap is closed. Planning that is a
  task tracker's job.
