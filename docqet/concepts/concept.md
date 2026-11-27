---
docqet: concept
id: concept
name: Concept
description: >-
  What a term in the business means, such as a booking: "a guest's hold on
  one room for a stay".
confused-with:
  - concept: "concept:rule"
    summary: >-
      what must or can't happen to something. A concept only says what it is.
  - term: "The same word, meaning something else"
    summary: >-
      another concept, with an ID of its own. Each lists the other here.
---

A concept says what something is, what it's made of, how it relates to other
concepts and what states it moves through. [Capabilities](capability.md) list
the concepts they work with, and [rules](rule.md) the ones they're written in.

A concept's ID is one across the product, so `concept:booking` means the same
thing in every doc, annotation and project. Docqet keeps no language
boundaries: there's no part of the product in which a word means something of
its own. Where a word means two things in two parts of the business, they're
two concepts, with different IDs, and each says in `confused-with` how it
differs from the other. To the booking app, a booking is "a guest's hold on
one room for a stay". To billing, it's "what a guest is charged for a stay",
so billing's is the billed stay, `concept:billed-stay`.

## How it's written

A concept is a doc whose `docqet` is `concept`. Its frontmatter, in order, is
`docqet`, `id`, `name`, `description` and `confused-with`:

- **`description`** defines it, in the business's words, in as many
  sentences as that takes.
- **`confused-with`** lists what it's easily mistaken for.

Everything else is its body, in whatever shape suits it: what it's made of,
how it relates to other concepts, and the states it moves through.
[`booking.md`](../../examples/hotel-bookings/docqet/concepts/booking.md):

```markdown
---
docqet: concept
id: booking
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

### What it's confused with

Each item in `confused-with` has a `summary` saying how they differ, and either
`concept`, a [link](link.md) to that concept written as any concept link is,
or `term`, for a word that isn't a concept in the docs. Billing's
[billed stay](../../examples/hotel-billing/docqet/concepts/billed-stay.md)
isn't the booking app's booking:

```yaml
confused-with:
  - concept: concept:booking
    summary: >-
      a guest's hold on a room. Billing doesn't keep rooms free or taken,
      only what each stay costs.
```

Its [bill](../../examples/hotel-billing/docqet/concepts/bill.md) isn't an
invoice, which isn't a concept in the docs:

```yaml
confused-with:
  - term: Invoice
    summary: what a company is sent for a month of its staff's bills.
```
