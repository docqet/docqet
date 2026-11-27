---
docqet: capability
id: check-out
name: Check-out
description: >-
  Clerks check guests out on their departure day and take payment for anything
  still owed.
stability: ga
within: feature:front-desk
solves: [problem:guests-queue-at-the-desk, problem:guests-leave-owing]
uses: [concept:booking]
---

## Includes

- Clerks see today's departures.

## Success

- The front desk closes the day with every departure settled.
