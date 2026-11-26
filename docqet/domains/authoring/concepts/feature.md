---
docqet: concept
id: feature
domain: authoring
name: Feature
description: >-
  A job the software does for its users or the business: an outcome of value
  that someone comes to the software for.
confused-with:
  - concept: "concept:capability"
    summary: >-
      one result of value toward the job. The reason someone comes to the software is a feature; what they get done while they're there is a capability.
  - concept: "concept:domain"
    summary: >-
      the part of the business whose words the feature is in.
---

Reservations is a feature: "taking bookings and handling changes to them,
before the guest arrives". So is Housekeeping: "keeping rooms ready for the
next guest".

- **It's named for its outcome**, not for how it's delivered: Reservations,
  not "the booking screen" or "the bookings service".
- **It provides value only through its [capabilities](capability.md).** The
  feature is the job, and its capabilities are what the software can do toward
  it, such as cancelling a booking. A feature with no capabilities is a job
  the software doesn't do yet.
- **It keeps its identity** as its capabilities and implementation come, go
  and change. Adding group bookings means Reservations does more of its job.
  It's still Reservations.
- **A capability is in at most one feature.** One in none is allowed, and
  shows on its own.
- **What it won't do is a [tradeoff](tradeoff.md) on it**: a capability we've
  decided never to build. Reservations takes bookings at the front desk, not
  from online travel agencies.
- **What it should do but doesn't yet is a draft capability**, never a gap on
  the feature. The waitlist is a draft in Reservations.
- **It can span domains.** Each [domain](domain.md) a project writes a doc of
  the feature in contributes that domain's part of the job. Front desk is in
  Guest stays, with check-in and check-out, and in Billing, with settling the
  bill at check-out.
- **It has no stability level.** Each of its capabilities has its own. It has
  a [maturity](../../reporting/concepts/maturity.md), how far along it is, and
  a [readiness](../../reporting/concepts/readiness.md), how ready people can
  rely on it being, both worked out from its capabilities. Nobody writes them
  down.

## Feature or capability

To tell them apart, ask whether the work helps an existing feature do its job,
or gives the product a new job. The first is a capability of that feature, and
the second is a new feature. Work that only changes how something is built is
neither. The full test is in
[feature, capability or neither?](../domain.md#feature-capability-or-neither)

## How it's written

A feature is a doc whose `docqet` is `feature`, with its `domain`. Its
frontmatter, in order, is `docqet`, `id`, `domain`, `name`, `description`,
`capabilities` (required), `tradeoffs` and `decisions`. It lists its
capabilities in the order to show them. Its body, if it has one, is anything
more about the job.
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
