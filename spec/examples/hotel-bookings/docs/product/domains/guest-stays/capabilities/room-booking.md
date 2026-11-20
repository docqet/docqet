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
  - id: no-waitlist
    kind: to-close-later
    text: >-
      When every room is taken there's no waitlist. Clerks note the guest's
      details outside the app and call them if a room frees up.
  - id: one-room-per-booking
    kind: accepted-tradeoff
    text: >-
      A booking holds one room, so a family that needs two rooms makes two
      bookings.
  - id: calendar-needs-a-mouse
    kind: to-close-later
    outcome: usability/beta/everyone
    text: >-
      The room calendar can't be used from the keyboard, so clerks need a
      mouse to pick dates.
---

# Room booking

Clerks book a free room for a guest's stay.

## Covers

- Clerks see which rooms are free for a stay.
- Clerks move a booking to new dates.

## Success

- The front desk stops keeping the paper diary alongside the app.
