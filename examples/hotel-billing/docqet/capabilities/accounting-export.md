---
docqet: capability
id: accounting-export
name: Accounting export
description: >-
  Bookkeepers export each closed day's takings to the hotel's accounting
  software.
stability: alpha
within: feature:closing-the-day
solves: [problem:takings-rekeyed-by-hand]
follows: [rule:closed-days-dont-change]
uses: [concept:business-day]
decisions:
  - question: >-
      Is a day at a time what the accountant wants, or one export a month?
---
