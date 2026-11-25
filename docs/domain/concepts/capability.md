# Capability

The software's ability to produce one particular result of value, either by
itself or by letting someone produce it, as part of a feature's job.

## Details

Room booking is a capability of Reservations. Its result is a guest with a
room held for their stay. Cancellations is another, and its result is a
booking ended and the guest refunded what the policy allows.

A capability is stated in one sentence, its description, in one of two forms:

- **Who does what**: "Clerks book a free room for a guest's stay."
- **What the software does**: "The software reminds each guest of their stay
  the day before they arrive."

The sentence can add a condition that limits it, or to what end, when that
helps: "Clerks move a guest's bill to their company's account at check-out, so
the guest leaves without paying." It names the people the business's way, and
the capability links the [personas](persona.md) it serves: who does it, or who
it's done for, and any [initiatives](initiative.md) it's part of. What it
doesn't do is said elsewhere. What must always or never happen is a
[rule](rule.md) it follows, what's missing for now is a known [gap](gap.md),
and what's limited by choice is a [tradeoff](tradeoff.md).
The other things people do with it, or the software does for them, when the
sentence doesn't show them, can be said in its body, each a sentence of its
own: "Clerks move a booking to new dates." Each is something this capability
does that nothing else on it says:

- **It adds to the description**, and never says it again in other words. If
  the description shows everything, the capability includes nothing more.
- **It's something done, not a limit on doing it.** What must or can't
  happen is a rule, even when it's about one action. An item that says
  "only", "never", "can't", "without" or "before they can" is a rule in
  disguise: the capability lists that rule, writing it if there isn't one, and
  the item goes.
- **It's this capability's.** What another capability does is said there, and
  not here as a pointer to it.

Something is a capability when:

- **It produces a result of value on its own.** If it were the only thing that
  shipped, someone would be better off, or the software would get something
  done for them.
- **Its result is distinct.** The actions that lead to the same result are
  part of one capability. Seeing which rooms are free, booking one, and moving
  a booking to new dates all lead to a guest with a room held for their stay,
  under the same rules. So they're all room booking. Cancelling leads to a different result under different rules, so
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
  [mechanisms](mechanism.md) and [components](component.md) it relies on show on it
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

A capability is a doc in its domain's `capabilities/` folder. Its name and
description, its level and its links are frontmatter. It names no code: the
mechanisms that apply to it and the components that list it say where it's
built. Questions building
it should answer are open decisions. Its body is for anything more about what
it does, such as what else it includes or how we'll know it works, and can be
left out.
[`room-booking.md`](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/room-booking.md):

```markdown
---
id: room-booking
name: Room booking
description: Clerks book a free room for a guest's stay.
stability: beta
personas: [persona:front-desk-clerk]
rules:
  - rule:no-double-booking
  - rule:minimum-stay
  - rule:same-day-turnover
concepts: [concept:booking, concept:room]
gaps:
  - id: calendar-needs-a-mouse
    name: Calendar needs a mouse
    outcome: usability/beta/everyone
    impact: blocking
    description: >-
      The room calendar can't be used from the keyboard, so clerks need a
      mouse to pick dates.
tradeoffs:
  - id: one-room-per-booking
    name: One room per booking
    impact: inconvenient
    description: A booking holds one room, not several.
    benefit: >-
      Booking, changing and cancelling stay simple: each booking is one room
      for one stay.
    drawback: >-
      A family that needs two rooms makes two bookings. Group bookings is
      where several rooms under one name is being explored.
---

## Includes

- Clerks see which rooms are free for a stay.
- Clerks move a booking to new dates.

## Success

- The front desk stops keeping the paper diary alongside the app.
```

A draft is written the same way, with `stability: draft`.
[`waitlist.md`](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/waitlist.md)
has its people, its initiative, rules and an open decision before any code
exists:

```markdown
---
id: waitlist
name: Waitlist
description: >-
  Clerks put a guest on a waitlist when every room is taken, and offer them
  the first room that frees up for their stay.
stability: draft
personas: [persona:front-desk-clerk]
initiatives: [initiative:busy-season]
rules: [rule:no-double-booking]
concepts: [concept:booking, concept:room]
decisions:
  - topic: Who goes first
    question: Whoever asked first, or whoever's stay fits the free nights best?
---
```

## Not to be confused with

- [Feature](feature.md): the job a capability is part of.
- [Rule](rule.md): a constraint capabilities do their jobs under, not a result
  of value.
- A step, screen or quality: see
  [feature, capability or neither?](../overview.md#feature-capability-or-neither)
