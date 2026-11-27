---
docqet: capability
id: night-audit
name: Night audit
description: >-
  The software closes each business day overnight, charging every guest in the
  hotel for that night's room.
stability: ga
within: feature:closing-the-day
solves:
  - problem:closing-the-day-takes-the-night
  - problem:takings-late-and-moving
follows:
  - rule:one-room-charge-per-night
  - rule:closed-days-dont-change
  - rule:charges-are-never-changed
uses: [concept:business-day, concept:bill, concept:charge]
---

## Includes

- Night auditors see whether tonight's audit has run, and what it charged.
- Night auditors start the audit by hand when it hasn't run.

## Success

- Every morning starts with yesterday closed, without anyone staying up for it.
