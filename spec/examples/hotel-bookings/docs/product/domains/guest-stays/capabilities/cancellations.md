---
name: Cancellations
description: >-
  Clerks cancel a booking when a guest's plans change, and the guest is
  refunded what the cancellation policy allows.
stability: alpha
personas: [front-desk-clerk]
rules:
  - cancellations/free-cancellation-window
  - cancellations/late-cancellation-fee
concepts: [booking]
gaps:
  - id: late-cancellations-refunded-in-full
    rule: cancellations/late-cancellation-fee
    impact: damaging
    summary: >-
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
