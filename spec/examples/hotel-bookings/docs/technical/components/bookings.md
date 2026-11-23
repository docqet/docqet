---
name: Bookings
summary: >-
  Where a room is held for a stay, and where no double-booking is enforced.
start: >-
  `src/booking/`, starting at `assertRoomFree` and `saveBooking`
capabilities: [room-booking, group-bookings, check-in]
code: [src/booking/**, db/migrations/001_bookings.sql]
gaps:
  - id: clashes-logged-as-unknown
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
    gain: >-
      No two bookings can overlap, however they arrive at once, without the
      app having to get locking right.
    cost: >-
      Bookings need Postgres with `btree_gist`, and the check in the app is
      only there to give clerks a clear message first.
---

The app checks the room is free (`assertRoomFree`) so it can tell the clerk
why it can't be booked. The bookings table's exclusion constraint is what
actually guarantees it, since two clerks can pass the app's check at the same
moment.

A stay is a half-open date range: the check-out date isn't a night of the
stay. `daterange` in Postgres is half-open by default, and `overlaps` in the
app agrees with it.
