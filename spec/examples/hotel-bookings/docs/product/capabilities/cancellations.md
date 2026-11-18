---
stability: Alpha
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

## What people can do

### Front desk clerk

- Tell a guest what they'd be refunded if they cancelled now.
- Cancel a booking for a guest.

## Open decisions

- **No-shows:** is a guest who never arrives treated as a late cancellation, or
  charged for the whole stay?
