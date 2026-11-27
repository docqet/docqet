---
docqet: capability
id: accounting-export
name: Accounting export
description: >-
  Bookkeepers export each closed day's takings to the hotel's accounting
  software.
stability: alpha
feature: feature:closing-the-day
solves: [problem:takings-rekeyed-by-hand]
rules: [rule:closed-days-dont-change]
concepts: [concept:business-day]
decisions:
  - question: >-
      Is a day at a time what the accountant wants, or one export a month?
---
