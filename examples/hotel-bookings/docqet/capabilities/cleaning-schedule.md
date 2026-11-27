---
docqet: capability
id: cleaning-schedule
name: Cleaning schedule
description: Housekeepers see which rooms to clean today, with early arrivals first.
stability: prototype
within: feature:housekeeping
solves: [problem:arrivals-wait-for-rooms]
uses: [concept:room]
decisions:
  - question: >-
      Is ordering by arrival time enough, or do housekeepers plan by
      floor?
---
