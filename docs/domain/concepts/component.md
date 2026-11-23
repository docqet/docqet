# Component

One area of the code, and what to know before changing it, named the way the
code names it.

## Details

Hotel Bookings' bookings component is where a room is held and no
double-booking is enforced. Its scope follows the code, not the
[capability](capability.md), so one component can serve several capabilities:
bookings serves room booking, group bookings and check-in. When a second area
needs the same fact, it moves to a [system](system.md).

A component is a technical doc, as a system is, and has the same shape: the
capabilities that rely on it, its technical [gaps](gap.md),
[tradeoffs](tradeoff.md) and [open decisions](open-decision.md), and any
[checklist outcomes](stability-checklist.md) it meets. What it holds, and what
it leaves to the code, is in
[how it's built](../overview.md#how-its-built). Most areas of the code need
none.

## In the spec

A component is a doc in `docs/technical/components/`.
[`bookings.md`](../../../spec/examples/hotel-bookings/docs/technical/components/bookings.md):

```markdown
---
capabilities: [room-booking, group-bookings, check-in]
code: [src/booking/**, db/migrations/001_bookings.sql]
gaps:
  - id: clashes-logged-as-unknown
    until: room-booking@ga
    outcome: observability/beta/hears-of-errors
    text: >-
      `saveBooking` passes every database error up as it is, so a clash that
      only the exclusion constraint caught is logged as an unknown failure,
      not as a double booking that was refused.
tradeoffs:
  - id: constraint-not-lock
    text: >-
      The database refuses overlapping bookings with an exclusion
      constraint, rather than the app locking the room while it checks.
    cost: >-
      Bookings need Postgres with `btree_gist`, and the check in the app is
      only there to give clerks a clear message first.
---

# Bookings

Where a room is held for a stay, and where no double-booking is enforced.

**Code:** `src/booking/`, starting at `assertRoomFree` and `saveBooking`

## How it works

The app checks the room is free (`assertRoomFree`) so it can tell the clerk
why it can't be booked. The bookings table's exclusion constraint is what
actually guarantees it, since two clerks can pass the app's check at the same
moment.

## Gotchas

- Stays are half-open date ranges: the check-out date isn't a night of the
  stay. `daterange` in Postgres is half-open by default, and `overlaps` in the
  app has to agree with it.
```

## Not to be confused with

- [System](system.md): something several features rely on, where you need the
  whole picture to change it safely.
- [Capability](capability.md): a result of value. A component's scope follows
  the code, so it rarely lines up with one capability.
