# Concept

What a term in the domain means, such as a booking: "a guest's hold on one
room for a stay".

## Details

A concept says what something is, what it's made of, how it relates to other
concepts and what states it moves through. [Capabilities](capability.md) list
the concepts they work with, and [rules](rule.md) the ones they're written in.

A concept means what it says within its [domain](domain.md). Billing's booking
is "what a guest is charged for a stay", and that's a second definition of the
word, not a mistake in Guest stays' or Billing's. A link to a concept means its
own domain's, unless it names another domain, as
`concept:booking@guest-stays`.

## In the spec

A concept is a doc whose `docket` is `concept`, and whose `domain` is the one
it means what it says in. Besides those, its frontmatter has only its name, its
`description`, which defines it, and `confused-with`, what it's easily
mistaken for. Everything else is its body, in whatever shape suits it: what it's made of, how it relates to other concepts, and the states it
moves through.
[`booking.md`](../../../spec/examples/hotel-bookings/docket/domains/guest-stays/concepts/booking.md)
in Guest stays:

```markdown
---
docket: concept
id: booking
domain: guest-stays
name: Booking
description: >-
  A guest's hold on one room for a stay, from a check-in date to a check-out
  date.
---

A booking is for one [room](room.md). Its nights run from the check-in date up
to, but not including, the check-out date.

## Lifecycle

1. Confirmed
2. Checked in
3. Checked out

A confirmed booking can instead be Cancelled, any time before check-in.
```

Each item in `confused-with` has a `summary` saying how they differ, and either
`concept`, a [link](link.md) to that concept written as any concept link is,
or `term`, for a word that isn't a concept in the docs. Billing's
[bill](../../../spec/examples/hotel-billing/docket/domains/billing/concepts/bill.md)
isn't an invoice:

```yaml
confused-with:
  - term: Invoice
    summary: what a company is sent for a month of its staff's bills.
```

## Not to be confused with

- [Rule](rule.md): what must or can't happen to something. A concept only says
  what it is.
- The same word in another domain: a definition of its own, shown beside this
  one.
