---
docqet: capability
id: waitlist
name: Waitlist
description: >-
  Clerks put a guest on a waitlist when every room is taken, and offer them
  the first room that frees up for their stay.
stability: draft
feature: feature:reservations
solves: [problem:full-nights-turn-guests-away]
initiatives: [initiative:busy-season]
rules: [rule:no-double-booking]
concepts: [concept:booking, concept:room]
decisions:
  - topic: Who goes first
    question: Whoever asked first, or whoever's stay fits the free nights best?
---

## Includes

- Clerks see who is waiting for each night.
