---
name: Group bookings
summary: >-
  Clerks hold several rooms at once for a group travelling together, under one
  name.
stability: prototype
personas: [front-desk-clerk]
rules:
  - booking/no-double-booking
  - booking/minimum-stay
concepts: [booking]
decisions:
  - question: >-
      Do groups want one booking with many rooms, or many bookings linked
      together?
---
