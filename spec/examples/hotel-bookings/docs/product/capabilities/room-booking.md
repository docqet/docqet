---
stability: Beta
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
---

# Room booking

Clerks book a room for a guest's stay, so that each room has at most one guest
on any night.

## What people can do

### Front desk clerk

- See which rooms are free for a stay.
- Book a free room for a guest.
- Move a booking to new dates, if its room is free for them.

## Success

- The front desk stops keeping the paper diary alongside the app.
