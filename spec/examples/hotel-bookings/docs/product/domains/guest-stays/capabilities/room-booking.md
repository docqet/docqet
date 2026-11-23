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
