# Feature

A job the software does for its users or the business: an outcome of value
that someone comes to the software for.

## Details

Reservations is a feature: "taking bookings and handling changes to them,
before the guest arrives". So is Housekeeping: "keeping rooms ready for the
next guest".

- **It's named for its outcome**, not for how it's delivered: Reservations,
  not "the booking screen" or "the bookings service".
- **It provides value only through its [capabilities](capability.md).** The
  feature is the job, and its capabilities are what the software can do toward
  it. A feature with no capabilities is a job the software doesn't do yet.
- **It keeps its identity** as its capabilities come, go and change. Adding
  group bookings means Reservations does more of its job. It's still
  Reservations.
- **What it won't do is a [tradeoff](tradeoff.md) on it**: a capability we've
  decided never to build. Reservations takes bookings at the front desk, not
  from online travel agencies.
- **What it should do but doesn't yet is a draft capability**, never a gap on
  the feature. The waitlist is a draft in Reservations.
- **It can span domains.** Each [domain](domain.md) that does part of the job
  writes its own doc of the feature, and contributes its part.
- **It has no stability level.** It has a [maturity](maturity.md), worked out
  from its capabilities' levels.

Whether some work is a feature, a capability or neither is set out in the
[overview](../overview.md#feature-capability-or-neither).

## In the spec

A feature is a doc in its domain's `features/` folder. It lists its
capabilities, in the order to show them, and its tradeoffs.
[`reservations.md`](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/features/reservations.md):

```markdown
---
name: Reservations
description: Taking bookings and handling changes to them, before the guest arrives.
capabilities:
  - room-booking
  - cancellations
  - group-bookings
  - waitlist
tradeoffs:
  - id: front-desk-bookings-only
    summary: >-
      Bookings are taken at the front desk, not from online travel agencies.
    drawback: Clerks enter each agency booking by hand, as it arrives by email.
---
```

A feature lists no rules: its rules are the ones its capabilities follow. Its
maturity is worked out, never written here.

## Not to be confused with

- [Capability](capability.md): one result of value toward the job. The reason
  someone comes to the software is a feature; what they get done while they're
  there is a capability.
- [Domain](domain.md): the part of the business whose words the feature is in.
