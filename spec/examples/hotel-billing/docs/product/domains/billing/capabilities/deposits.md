---
stability: Beta
personas: [manager, front-desk-clerk]
rules:
  - payments/deposit-is-the-first-night
  - payments/deposit-counts-towards-the-bill
  - payments/card-numbers-are-never-kept
concepts: [payment, bill]
code: [src/payments/deposit*.ts]
---

# Deposits

The software takes a deposit on the guest's card when a stay is booked.

## Covers

- Clerks see whether a stay's deposit has been paid.
- Clerks take a deposit again when the guest's card was declined.

## Open decisions

- **Long stays:** is a week's stay still secured by one night's deposit?
