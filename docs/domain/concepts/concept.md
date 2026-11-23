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
own domain's, else the only one with that ID, unless it names a domain as
`booking@guest-stays`.

## In the spec

A concept is a doc in its domain's `concepts/` folder, with sections for its
details, its lifecycle, and what it's not to be confused with.
[`booking.md`](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/concepts/booking.md)
in Guest stays:

```markdown
# Booking

A guest's hold on one room for a stay, from a check-in date to a check-out date.

## Details

A booking is for one [room](room.md). Its nights run from the check-in date up
to, but not including, the check-out date.

## Lifecycle

Confirmed → Checked in → Checked out

A confirmed booking can instead be Cancelled, any time before check-in.
```

## Not to be confused with

- [Rule](rule.md): what must or can't happen to something. A concept only says
  what it is.
- The same word in another domain: a definition of its own, shown beside this
  one.
