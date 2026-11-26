---
docket: concept
id: rule
domain: authoring
name: Rule
description: >-
  A business rule of the domain: a constraint the business and its software
  operate under. It's something that must always be true, or must never happen,
  in the domain's words, such as "a room can't be double-booked" or "cancelling
  48 hours ahead is free".
confused-with:
  - concept: "concept:open-decision"
    summary: >-
      something not committed to yet. It becomes a rule once the business decides.
  - concept: "concept:concept"
    summary: >-
      what a word means. A rule says what must hold, in those words.
---

Each rule says what it is and why, and nothing about how the code enforces it.

A rule isn't a preference, a default or a guideline. It holds every time, for
everyone it covers, and software that lets it be broken is wrong. Something
that's only usually true, that someone can choose to override, or that's
still being decided isn't a rule. Write it as what the capability does, or as
an [open decision](open-decision.md), until the business commits to it. When
the business does allow an exception, such as a manager waiving a cancellation
fee, the exception is part of the rule, and the rule still holds every time.

## It belongs to a domain

A rule belongs to the [domain](domain.md), not to a capability or a feature. A
capability refers to the rules it follows, and that's the only link between a
rule and the product:

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
- **It's its domain's.** A rule holds within the domain that declares it, in
  that domain's words. A capability in another domain can still follow it, by
  naming its domain, so one rule can govern work that crosses domains. Another
  domain can have a rule with the same ID that says something else.
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

A rule is one doc whose `docket` is `rule`, with its `domain`. Its
frontmatter, in order, is `docket`, `id`, `domain`, `name`, `concepts` and
`why`:

- **`name`** is the rule in a few words.
- **`why`** says why the rule holds, so whoever meets a case it didn't foresee
  can judge it.
- **It has no `description`.** Its body, if it has one, states the rule in
  full where the name doesn't say it all, and gives examples or how it plays
  out.

Its ID is its `id` field, such as `no-double-booking`, so it stays the same if
the file moves. Rules can be kept in folders of their own, such as one for
each part of the domain, like `rules/booking/`, but never one for a capability
or a feature. The folders are for people and mean nothing to tools.
[`no-double-booking.md`](../../../../examples/hotel-bookings/docket/domains/guest-stays/rules/booking/no-double-booking.md):

```markdown
---
docket: rule
id: no-double-booking
domain: guest-stays
name: A room can't be double-booked
concepts: [concept:booking, concept:room]
---

Two bookings for the same room can't share a night. A cancelled booking no
longer holds its nights.
```

[`late-cancellation-fee.md`](../../../../examples/hotel-bookings/docket/domains/guest-stays/rules/cancellations/late-cancellation-fee.md)
says why:

```yaml
why: The room usually can't be rebooked at such short notice.
```

Capabilities follow it by listing it, as room booking does with
`rules: [rule:no-double-booking, ...]`. A capability in another domain
names its domain: `rule:no-double-booking@guest-stays`. Places in the
repository point at it as evidence, such as this Gherkin rule:

```gherkin
  # docket:verifies rule:no-double-booking@guest-stays
  Rule: A room can't be double-booked
```
