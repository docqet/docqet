---
docqet: capability
id: group-bookings
name: Group bookings
description: >-
  Clerks hold several rooms at once for a group travelling together, under one
  name.
stability: prototype
within: feature:reservations
solves: [problem:groups-hard-to-keep-together]
included-in: [initiative:busy-season]
follows:
  - rule:no-double-booking
  - rule:minimum-stay
uses: [concept:booking]
decisions:
  - question: >-
      Do groups want one booking with many rooms, or many bookings linked
      together?
---
