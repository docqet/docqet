---
docqet: capability
id: daily-takings
name: Daily takings
description: >-
  Managers see each closed day's takings, for rooms, food and drink, and tax.
stability: beta
within: feature:closing-the-day
solves: [problem:takings-late-and-moving]
follows: [rule:closed-days-dont-change]
uses: [concept:business-day, concept:charge]
---

## Includes

- Managers compare a day with the same day last year.
