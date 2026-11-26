---
docqet: concept
id: tradeoff
domain: authoring
name: Tradeoff
description: >-
  Something we chose over an alternative, with its benefit and its drawback,
  and decided to live with.
confused-with:
  - concept: "concept:gap"
    summary: >-
      something we intend to close.
  - concept: "concept:rule"
    summary: >-
      a constraint of the business. A tradeoff is a choice we made about the software, and could make differently.
---

A booking holds one room, not several, so a family that needs two rooms makes
two bookings. It's a decision, not something left to do. It says what we
chose, its benefit, and its drawback. We accept both together: they're what
came with the choice.

- **One tradeoff is one choice.** When a choice has two drawbacks, its
  drawback says both, rather than the choice being written twice.
- **Its benefit is what makes it a choice.** Without it, there's nothing to
  weigh the drawback against, so readers show a tradeoff with no `benefit` as
  missing it.
- **It's on the thing the choice was made about**, as
  [Where gaps and tradeoffs go](gap.md#where-gaps-and-tradeoffs-go) lays out:
  one room per booking on room booking, taking no bookings from online travel
  agencies on Reservations, and working out a bill's balance every time it's
  asked for on the ledger.

## No risk

A tradeoff isn't rated and carries no
[risk](../../reporting/concepts/risk.md). Risk asks whether it's OK to leave
something open, and a tradeoff is the answer: someone weighed its drawback
against its benefit and chose to live with it. Its drawback says what was
accepted, in words.

A drawback that only bites in certain conditions says what they are. A
choice that's fine until something changes, such as a quicker design that
slows down as bills grow, says so in its drawback, which is also when it's
worth looking at again.

A drawback that starts to worry someone means the choice isn't settled any
more. Either an [open decision](open-decision.md) that affects it reopens
it, and it stays the current choice until that's answered, or it's turned
back into a gap, which is rated.

## What it affects

A tradeoff answers the question code can't: is this deliberate? Code that
looks wrong on purpose points at its tradeoff, so neither a person nor an
agent "fixes" it.

When the choice means falling short of a [stability rubric](rubric.md)
outcome on purpose, the tradeoff [affects](gap.md#affects) it, and the
outcome shows as not met by choice rather than met, so it's neither claimed
nor taken for a gap.

A tradeoff can't affect a [rule](rule.md). A rule is a constraint of the
business, so not holding it can't be a choice: either the rule changes, or
it's a gap.

## Lifecycle

A tradeoff we reverse is deleted, or replaced by the new one.

## How it's written

Tradeoffs are listed in the `tradeoffs` frontmatter field of the doc they're
on. Each has:

- **`id`**: its key, unique among the gaps and tradeoffs of that doc, as for
  a [gap](gap.md#how-its-written).
- **`name`**: what we chose, in a few words, such as
  `Front desk bookings only`.
- **`description`**: what we chose, and what we didn't.
- **`benefit`**: what we hope to get by choosing it.
- **`drawback`**: what we give up or risk in return.
- **Optionally, `affects`**: the rubric's outcomes it falls short of.

The description, benefit and drawback are each a sentence or two. On the
[ledger](../../../../examples/hotel-billing/docqet/components/ledger.md):

```yaml
tradeoffs:
  - id: balance-worked-out-on-read
    name: Balance summed on read, not stored
    affects:
      - outcome:efficiency/beta/bounded
    description: >-
      A bill's balance is added up from its lines every time it's asked for,
      not stored on the bill.
    benefit: >-
      The balance can never disagree with the lines, and there's nothing to
      keep in step when a line is added.
    drawback: >-
      Opening a bill gets slower as lines are added to it, which shows once a
      bill grows to thousands of lines, as on a long company stay.
```

The code it explains points at it with an [annotation](annotation.md):

```ts
// docqet:tradeoff component:ledger#balance-worked-out-on-read
export function balance(bill: Bill): number {
```

A feature's tradeoff is a non-goal, written the same way, on
[Reservations](../../../../examples/hotel-bookings/docqet/domains/guest-stays/features/reservations.md):

```yaml
tradeoffs:
  - id: front-desk-bookings-only
    name: Front desk bookings only
    description: >-
      Bookings are taken at the front desk, not from online travel agencies.
    benefit: >-
      No agency integrations to build or keep working, while most bookings
      come straight to the desk.
    drawback: Clerks enter each agency booking by hand, as it arrives by email.
```
