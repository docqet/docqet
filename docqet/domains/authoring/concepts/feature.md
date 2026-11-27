---
docqet: concept
id: feature
domain: authoring
name: Feature
description: >-
  A part of what the software offers its users or the business, with an
  identity that lasts: the part of the software someone comes to, and would
  name.
confused-with:
  - concept: "concept:capability"
    summary: >-
      one result the feature produces. The part of the software someone comes to is a feature; what they get done while they're there is a capability.
  - concept: "concept:problem"
    summary: >-
      why someone needs the software at all, said without naming it. A feature is part of the answer.
  - concept: "concept:domain"
    summary: >-
      the part of the business whose words the feature is in.
---

Reservations is a feature: "taking bookings and handling changes to them,
before the guest arrives". So is Housekeeping: "keeping rooms ready for the
next guest".

- **It's named for what it offers**, not for how it's delivered:
  Reservations, not "the booking screen" or "the bookings service".
- **It provides value only through its [capabilities](capability.md).** The
  feature is the part of the product, and its capabilities are what the
  software can do in it, such as cancelling a booking. A feature with no
  capabilities is a part the software doesn't have yet.
- **It keeps its identity** as its capabilities and implementation come, go
  and change. Adding group bookings means Reservations offers more. It's
  still Reservations.
- **A capability is in at most one feature.** One in none is allowed, and
  shows on its own.
- **What it won't do is a [tradeoff](tradeoff.md) on it**: a capability we've
  decided never to build. Reservations takes bookings at the front desk, not
  from online travel agencies.
- **What it should do but doesn't yet is a draft capability**, never a gap on
  the feature. The waitlist is a draft in Reservations.
- **Its problems are its capabilities'.** It solves no
  [problem](problem.md) of its own: one problem often needs capabilities in
  several features, so a feature's problems are those its capabilities solve.
- **It can span domains.** Each [domain](domain.md) a project writes a doc of
  the feature in contributes that domain's part of it. Front desk is in
  Guest stays, with check-in and check-out, and in Billing, with settling the
  bill at check-out.
- **It has no stability level.** Each of its capabilities has its own. It has
  a [maturity](../../understanding/concepts/maturity.md), how far along it is, and
  a [readiness](../../understanding/concepts/readiness.md), how ready people can
  rely on it being, both worked out from its capabilities. Nobody writes them
  down.

## Feature or capability

To tell them apart, ask whether the work produces a new result in a part of
the product that's already there, or gives the product a part it didn't
have. The first is a capability of that feature, and the second is a new
feature. Work that only changes how something is built is
neither. The full test is in
[feature, capability or neither?](../domain.md#feature-capability-or-neither)

## How it's written

A feature is a doc whose `docqet` is `feature`, with its `domain`. Its
frontmatter, in order, is `docqet`, `id`, `domain`, `name`, `description`,
`capabilities` (required), `tradeoffs` and `decisions`. It lists its
capabilities in the order to show them. Its body, if it has one, is anything
more about what it offers.
[`reservations.md`](../../../../examples/hotel-bookings/docqet/domains/guest-stays/features/reservations.md):

```markdown
---
docqet: feature
id: reservations
domain: guest-stays
name: Reservations
description: Taking bookings and handling changes to them, before the guest arrives.
capabilities:
  - capability:room-booking
  - capability:cancellations
  - capability:group-bookings
  - capability:waitlist
tradeoffs:
  - id: front-desk-bookings-only
    name: Front desk bookings only
    description: >-
      Bookings are taken at the front desk, not from online travel agencies.
    drawback: Clerks enter each agency booking by hand, as it arrives by email.
---
```

A feature lists no rules: its rules are the ones its capabilities follow. Its
maturity and readiness are worked out, never written here.
