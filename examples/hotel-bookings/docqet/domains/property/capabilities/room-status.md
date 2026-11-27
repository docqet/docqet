---
docqet: capability
id: room-status
domain: property
name: Room status
description: >-
  Housekeepers mark rooms clean or dirty, so the front desk knows which are
  ready.
stability: prototype
solves: [problem:arrivals-wait-for-rooms]
initiatives: [initiative:busy-season]
concepts: [concept:room@guest-stays]
decisions:
  - question: >-
      Will housekeepers update a room's status as they go, or at the end
      of their round?
---

## Includes

- Clerks see which rooms are ready for arriving guests.
