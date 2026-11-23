---
name: Room booking
description: Clerks book a free room for a guest's stay.
stability: beta
personas: [front-desk-clerk]
rules:
  - booking/no-double-booking
  - booking/minimum-stay
  - booking/same-day-turnover
concepts: [booking, room]
gaps:
  - id: calendar-needs-a-mouse
    outcome: usability/beta/everyone
    summary: >-
      The room calendar can't be used from the keyboard, so clerks need a
      mouse to pick dates.
tradeoffs:
  - id: one-room-per-booking
    summary: A booking holds one room, not several.
    benefits:
      - >-
        Booking, changing and cancelling stay simple: each booking is one room
        for one stay.
    drawbacks:
      - >-
        A family that needs two rooms makes two bookings. Group bookings is
        where several rooms under one name is being explored.
decisions:
  - topic: Booking from the keyboard
    question: Must clerks be able to book from the keyboard alone at Beta?
    status: closed
    answer: >-
      Yes, since Beta expects everyone to be able to use it. The calendar
      doesn't support it yet, so it's a known gap.
    became: [capability:room-booking#calendar-needs-a-mouse]
---

## Includes

- Clerks see which rooms are free for a stay.
- Clerks move a booking to new dates.

## Success

- The front desk stops keeping the paper diary alongside the app.
