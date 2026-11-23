---
id: bookings
name: Bookings
description: >-
  Where a room is held for a stay, and where no double-booking is enforced.
capabilities: [capability:room-booking, capability:group-bookings, capability:check-in]
gaps:
  - id: clashes-logged-as-unknown
    name: Booking clashes logged as unknown errors
    outcome: observability/beta/hears-of-errors
    impact: inconvenient
    description: >-
      `saveBooking` passes every database error up as it is, so a clash that
      only the exclusion constraint caught is logged as an unknown failure,
      not as a double booking that was refused.
    when: Two bookings for the same room arrive at once.
tradeoffs:
  - id: constraint-not-lock
    name: Database constraint, not an app lock
    impact: inconvenient
    description: >-
      The database refuses overlapping bookings with an exclusion
      constraint, rather than the app locking the room while it checks.
    benefit: >-
      No two bookings can overlap, however they arrive at once, without the
      app having to get locking right. The check in the app is only there to
      give clerks a clear message first.
    drawback: >-
      Bookings need Postgres with `btree_gist`, so they can't move to a
      database without it.
    when: Bookings move to another database.
---

The app checks the room is free (`assertRoomFree`) so it can tell the clerk
why it can't be booked. The bookings table's exclusion constraint is what
actually guarantees it, since two clerks can pass the app's check at the same
moment.

A stay is a half-open date range: the check-out date isn't a night of the
stay. `daterange` in Postgres is half-open by default, and `overlaps` in the
app agrees with it.
