---
capabilities: [room-booking]
code: [src/booking/**]
gaps:
  - id: availability-loads-every-booking
    text: >-
      Checking whether a room is free loads every booking for that room and
      compares them in memory. That's fine at one small hotel's volume.
    until:
      capability: room-booking
      reaches: GA
---

# Bookings

Booking a room and checking it's free. Start reading at `assertRoomFree` in
`src/booking/availability.ts`.

## Gotchas

- Stays are half-open: the check-out date isn't a night of the stay. `overlaps`
  depends on this, and comparing with `<=` would break
  [same-day turnover](../../../product/domain/rules/booking/same-day-turnover.md).
