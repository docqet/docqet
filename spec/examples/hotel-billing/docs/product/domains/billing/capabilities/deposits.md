---
name: Deposits
description: The software takes a deposit on the guest's card when a stay is booked.
stability: beta
personas: [manager, front-desk-clerk]
rules:
  - payments/deposit-is-the-first-night
  - payments/deposit-counts-towards-the-bill
  - payments/card-numbers-are-never-kept
concepts: [payment, bill]
decisions:
  - topic: Long stays
    question: Is a week's stay still secured by one night's deposit?
---

## Includes

- Clerks see whether a stay's deposit has been paid.
- Clerks take a deposit again when the guest's card was declined.
