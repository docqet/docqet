---
id: room-booking
name: Room booking
description: Clerks book a free room for a guest's stay.
stability: beta
personas: [persona:front-desk-clerk]
rules:
  - rule:no-double-booking
  - rule:minimum-stay
  - rule:same-day-turnover
concepts: [concept:booking, concept:room]
gaps:
  - id: calendar-needs-a-mouse
    name: Calendar needs a mouse
    outcome: usability/beta/everyone
    impact: blocking
    description: >-
      The room calendar can't be used from the keyboard, so clerks need a
      mouse to pick dates.
tradeoffs:
  - id: one-room-per-booking
    name: One room per booking
    description: A booking holds one room, not several.
    benefit: >-
      Booking, changing and cancelling stay simple: each booking is one room
      for one stay.
    drawback: >-
      A family that needs two rooms makes two bookings. Group bookings is
      where several rooms under one name is being explored.
---

## Includes

- Clerks see which rooms are free for a stay.
- Clerks move a booking to new dates.

## Success

- The front desk stops keeping the paper diary alongside the app.
