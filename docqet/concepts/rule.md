---
docqet: concept
id: rule
name: Rule
description: >-
  A business rule: a promise the software keeps while its capabilities do
  their jobs, often one the business chose. It's something that must always
  be true, or must never happen, in the business's words, such as "a room can't be double-booked" or "cancelling
  48 hours ahead is free".
confused-with:
  - concept: "concept:open-decision"
    summary: >-
      something not committed to yet. It becomes a rule once the business decides.
  - concept: "concept:concept"
    summary: >-
      what a word means. A rule says what must hold, in those words.
  - concept: "concept:constraint"
    summary: >-
      something imposed from outside that the rule keeps to. The constraint would hold whatever the rules said.
---

Each rule says what it is and why, and nothing about how the code enforces it.

A rule isn't a preference, a default or a guideline. It holds every time, for
everyone it covers, and software that lets it be broken is wrong. Something
that's only usually true, that someone can choose to override, or that's
still being decided isn't a rule. Write it as what the capability does, or as
an [open decision](open-decision.md), until the business commits to it. When
the business does allow an exception, such as a manager waiving a cancellation
fee, the exception is part of the rule, and the rule still holds every time.

## It belongs to the product

A rule belongs to the product as a whole, not to a capability, a feature or
an [area](area.md). A capability refers to the rules it follows, and that's
the only link between a rule and the product:

- **A rule can apply to many capabilities**, in one feature or several. It's
  written once and applies to every [capability](capability.md) that lists
  it. No double-booking applies to room booking and group bookings in
  Reservations, and to check-in in Front desk.
- **A feature has no rules of its own.** Its rules are the ones its
  capabilities follow. Features don't list rules, and `state.json` doesn't
  either: a reader works them out from the feature's capabilities.
- **It keeps its ID as capabilities start or stop following it.**
- **Its [evidence](evidence.md) is the rule's, wherever it applies.** What
  verifies no double-booking is about every capability that follows it, even
  if it only goes through room booking.
- **Its ID is one across the product.** Any capability, in any feature,
  area or project, follows it by naming it, so one rule can govern work that
  crosses parts of the business. Two rules that say different things have
  different IDs.
- **It holds no gaps, tradeoffs or open decisions.** A rule is decided once
  its doc exists. Where a capability doesn't hold to it yet, that's a
  [gap](gap.md) on the capability, which affects the rule, and the rule
  shows it.

## Following it claims it holds

For each capability that follows it, a rule has a standing:

- **Not held**, when one of the capability's gaps affects it.
- **Held with evidence**, when anything verifies or implements it.
- **Held on trust**, when no gap affects it and nothing points at it.

A gap wins over evidence. A rule written before it's built is followed with a
gap on each capability that doesn't hold to it yet, and closing those gaps
leaves the rule in place.

## How it's written

A rule is one doc whose `docqet` is `rule`. Its frontmatter, in order, is
`docqet`, `id`, `name`, `uses`, `respects` and `why`:

- **`name`** is the rule in a few words.
- **`respects`**, optional, lists the [constraints](constraint.md) it's there
  to keep to: "invoice numbers run in sequence" respects the tax office's
  requirement. A rule the business chose for itself respects none.
- **`why`** says why the rule holds, so whoever meets a case it didn't foresee
  can judge it.
- **It has no `description`.** Its body, if it has one, states the rule in
  full where the name doesn't say it all, and gives examples or how it plays
  out.

Its ID is its `id` field, such as `no-double-booking`, so it stays the same if
the file moves. Rules can be kept in folders of their own, such as one for
each topic, like `rules/booking/`, but never one for a capability or a
feature. The folders are for people and mean nothing to tools.
[`no-double-booking.md`](../../examples/hotel-bookings/docqet/rules/booking/no-double-booking.md):

```markdown
---
docqet: rule
id: no-double-booking
name: A room can't be double-booked
uses: [concept:booking, concept:room]
respects: [constraint:one-stay-a-room-a-night]
---

Two bookings for the same room can't share a night. A cancelled booking no
longer holds its nights.
```

[`late-cancellation-fee.md`](../../examples/hotel-bookings/docqet/rules/cancellations/late-cancellation-fee.md)
says why:

```yaml
why: The room usually can't be rebooked at such short notice.
```

Capabilities follow it by listing it, as room booking does with
`follows: [rule:no-double-booking, ...]`. Places in the repository point at it
as evidence, such as this Gherkin rule:

```gherkin
  # docqet:verifies rule:no-double-booking
  Rule: A room can't be double-booked
```
