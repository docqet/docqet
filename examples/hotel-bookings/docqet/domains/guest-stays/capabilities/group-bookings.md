---
docqet: capability
id: group-bookings
domain: guest-stays
name: Group bookings
description: >-
  Clerks hold several rooms at once for a group travelling together, under one
  name.
stability: prototype
solves: [problem:groups-hard-to-keep-together]
initiatives: [initiative:busy-season]
rules:
  - rule:no-double-booking
  - rule:minimum-stay
concepts: [concept:booking]
decisions:
  - question: >-
      Do groups want one booking with many rooms, or many bookings linked
      together?
---
