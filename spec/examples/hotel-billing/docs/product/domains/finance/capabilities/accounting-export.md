---
name: Accounting export
summary: >-
  Bookkeepers export each closed day's takings to the hotel's accounting
  software.
stability: alpha
personas: [bookkeeper]
rules: [night-audit/closed-days-dont-change]
concepts: [business-day]
decisions:
  - question: >-
      Is a day at a time what the accountant wants, or one export a month?
---
