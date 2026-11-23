---
name: Waitlist
summary: >-
  Clerks put a guest on a waitlist when every room is taken, and offer them
  the first room that frees up for their stay.
stability: draft
personas: [front-desk-clerk]
rules: [booking/no-double-booking]
concepts: [booking, room]
decisions:
  - topic: Who goes first
    question: Whoever asked first, or whoever's stay fits the free nights best?
---

## Includes

- Clerks see who is waiting for each night.
