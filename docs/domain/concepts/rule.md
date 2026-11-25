# Rule

A business rule of the domain: a constraint the business and its software
operate under. It's something that must always be true, or must never happen,
in the domain's words, such as "a room can't be double-booked" or "cancelling
48 hours ahead is free".

## Details

Each rule says what it is and why, and nothing about how the code enforces it.

A rule isn't a preference, a default or a guideline. It holds every time, for
everyone it covers, and software that lets it be broken is wrong. Something
that's only usually true, that someone can choose to override, or that's
still being decided isn't a rule. Write it as what the capability does, or as
an [open decision](open-decision.md), until the business commits to it. When
the business does allow an exception, such as a manager waiving a cancellation
fee, the exception is part of the rule, and the rule still holds every time.

A rule belongs to the [domain](domain.md), not to a capability or a feature:

- **Capabilities refer to the rules they follow.** A rule is written once and
  applies to every [capability](capability.md) that lists it. No
  double-booking applies to room booking and group bookings in Reservations,
  and to check-in in Front desk.
- **Features reach rules only through their capabilities.** A feature's rules
  are the rules its capabilities follow. Nobody lists them on the feature.
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
- **Following it claims it holds.** For each capability that follows it, a
  rule is not held yet, when one of the capability's gaps affects it; held
  with evidence, when something verifies or implements it; or held on trust,
  when nothing says either way. A gap wins over evidence. A rule written
  before it's built is followed with a gap on each capability that doesn't
  hold to it yet, and closing those gaps leaves the rule in place.

## In the spec

A rule is one doc whose `docket` is `rule`, with its `domain`, and its file can
be in folders of its own, such as one per topic. Its ID is its `id` field, such
as `no-double-booking`, so it stays the same if the file moves between folders.
Its `name` is the rule in a few words, and `why` says why it holds, so
whoever meets a case it didn't foresee can judge it. It has no `description`: its
body, if it has one, states the rule in full where the name doesn't, and gives
examples or how it plays out.
[`no-double-booking.md`](../../../spec/examples/hotel-bookings/docket/domains/guest-stays/rules/booking/no-double-booking.md):

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

[`late-cancellation-fee.md`](../../../spec/examples/hotel-bookings/docket/domains/guest-stays/rules/cancellations/late-cancellation-fee.md)
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

## Not to be confused with

- [Open decision](open-decision.md): something not committed to yet. It
  becomes a rule once the business decides.
- [Concept](concept.md): what a word means. A rule says what must hold, in
  those words.
