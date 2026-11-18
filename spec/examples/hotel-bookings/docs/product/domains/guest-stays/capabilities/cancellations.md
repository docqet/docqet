---
stability: alpha
personas: [front-desk-clerk]
rules:
  - cancellations/free-cancellation-window
  - cancellations/late-cancellation-fee
concepts: [booking]
code: [src/cancellations/**]
gaps:
  - id: late-cancellations-refunded-in-full
    kind: to-close-later
    text: >-
      The late-cancellation fee isn't charged yet, so every cancellation is
      refunded in full.
---

# Cancellations

Clerks cancel a booking when a guest's plans change, and the guest is refunded
what the cancellation policy allows.

## Covers

- Clerks tell a guest what they'd be refunded if they cancelled now.

## Open decisions

- **No-shows:** is a guest who never arrives treated as a late cancellation, or
  charged for the whole stay?
