---
docqet: capability
id: waitlist
name: Waitlist
description: >-
  Clerks put a guest on a waitlist when every room is taken, and offer them
  the first room that frees up for their stay.
stability: draft
within: feature:reservations
solves: [problem:full-nights-turn-guests-away]
included-in: [initiative:busy-season]
follows: [rule:no-double-booking]
uses: [concept:booking, concept:room]
decisions:
  - topic: Who goes first
    question: Whoever asked first, or whoever's stay fits the free nights best?
---

## Includes

- Clerks see who is waiting for each night.
