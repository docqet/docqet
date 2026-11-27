---
docqet: capability
id: cancellations
name: Cancellations
description: >-
  Clerks cancel a booking when a guest's plans change, and the guest is
  refunded what the cancellation policy allows.
stability: alpha
within: feature:reservations
solves: [problem:late-cancellations-leave-rooms-empty]
follows:
  - rule:free-cancellation-window
  - rule:late-cancellation-fee
uses: [concept:booking]
gaps:
  - id: late-cancellations-refunded-in-full
    name: Late cancellations refunded in full
    affects:
      - rule:late-cancellation-fee
    impact: damaging
    likelihood: certain
    reach: all
    description: >-
      The late-cancellation fee isn't charged yet, so every cancellation is
      refunded in full.
decisions:
  - topic: No-shows
    question: >-
      Is a guest who never arrives treated as a late cancellation, or
      charged for the whole stay?
---

## Includes

- Clerks tell a guest what they'd be refunded if they cancelled now.
