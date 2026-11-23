# Capability

The software's ability to produce one particular result of value, either by
itself or by letting someone produce it, as part of a feature's job.

## Details

Room booking is a capability of Reservations. Its result is a guest with a
room held for their stay. Cancellations is another, and its result is a
booking ended and the guest refunded what the policy allows.

A capability is stated in one sentence, its summary, in one of two forms:

- **Who does what**: "Clerks book a free room for a guest's stay."
- **What the software does**: "The software reminds each guest of their stay
  the day before they arrive."

The sentence can add a condition that limits it, or to what end, when that
helps: "Clerks move a guest's bill to their company's account at check-out, so
the guest leaves without paying." It names the people the business's way, and
the capability links the [personas](persona.md) it serves: who does it, or who
it's done for. What it doesn't do is said elsewhere. What must always or never
happen is a [rule](rule.md) it follows, what's missing for now is a known
[gap](gap.md), and what's limited by choice is a [tradeoff](tradeoff.md).
Anything else it includes, when the sentence doesn't show it, is listed under
what it covers, each a sentence of its own.

Something is a capability when:

- **It produces a result of value on its own.** If it were the only thing that
  shipped, someone would be better off, or the software would get something
  done for them.
- **Its result is distinct.** The actions that lead to the same result are
  part of one capability. Seeing which rooms are free, booking one, and moving
  a booking to new dates all lead to a guest with a room held for their stay,
  under the same rules. So they're all room booking, listed under what it
  covers. Cancelling leads to a different result under different rules, so
  it's a capability of its own.
- **It can be depended on by itself.** People can rely on room booking while
  group bookings is still a prototype. That's why the stability level belongs
  to the capability and not to the feature.

The capability is Docket's unit of dependability:

- **It's the only thing with a [stability level](stability-level.md).** When
  you need to know whether you can rely on something, you check the
  capability.
- **It has a level in each domain that builds part of it.** A capability that
  spans domains can be further along in one than another: check-out is GA in
  Guest stays, where clerks check guests out, and Alpha in Billing, where
  settling the bill is still taking shape. Where they differ, its level in
  short is the lowest, since that's what you can count on everywhere.
- **It's in at most one [feature](feature.md).** A capability in no feature is
  allowed, and shows on its own.
- **It's what connects rules, concepts and code to the product.** A capability
  lists the rules it must follow, the [concepts](concept.md) it works with, and
  where its code lives. Rules and concepts aren't the capability's own: other
  capabilities can list the same ones.
- **It holds the product's known gaps**, and most of its tradeoffs and
  [open decisions](open-decision.md). The technical gaps of the
  [systems](system.md) and [components](component.md) it relies on show on it
  too.
- **It can be declared before it's started**, as a **draft**: what we intend
  the software to do, with no work done yet. The waitlist is a draft in
  Reservations. A missing capability is written down this way, so it has its
  people, rules and open decisions from the start.

## Lifecycle

Draft → Prototype → Alpha → Beta → GA

A draft becomes a Prototype when work on it starts. After that, it moves only
when someone decides to promote or demote it.

## In the spec

A capability is a doc in its domain's `capabilities/` folder.
[`room-booking.md`](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/room-booking.md):

```markdown
---
stability: beta
personas: [front-desk-clerk]
rules:
  - booking/no-double-booking
  - booking/minimum-stay
  - booking/same-day-turnover
concepts: [booking, room]
code: [src/booking/**]
gaps:
  - id: calendar-needs-a-mouse
    until: ga
    outcome: usability/beta/everyone
    text: >-
      The room calendar can't be used from the keyboard, so clerks need a
      mouse to pick dates.
tradeoffs:
  - id: one-room-per-booking
    text: A booking holds one room, not several.
    cost: >-
      A family that needs two rooms makes two bookings. Group bookings is
      where several rooms under one name is being explored.
---

# Room booking

Clerks book a free room for a guest's stay.

## Covers

- Clerks see which rooms are free for a stay.
- Clerks move a booking to new dates.

## Success

- The front desk stops keeping the paper diary alongside the app.
```

A draft is written the same way, with `stability: draft`.
[`waitlist.md`](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/waitlist.md)
has its people, rules and an open decision before any code exists:

```markdown
---
stability: draft
personas: [front-desk-clerk]
rules: [booking/no-double-booking]
concepts: [booking, room]
---

# Waitlist

Clerks put a guest on a waitlist when every room is taken, and offer them the
first room that frees up for their stay.
```

## Not to be confused with

- [Feature](feature.md): the job a capability is part of.
- [Rule](rule.md): a constraint capabilities do their jobs under, not a result
  of value.
- A step, screen or quality: see
  [feature, capability or neither?](../overview.md#feature-capability-or-neither)
