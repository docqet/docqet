---
stability: Beta
rules:
  - payments/deposit-is-the-first-night
  - payments/deposit-counts-towards-the-bill
  - payments/card-numbers-are-never-kept
concepts: [payment, bill]
code: [src/payments/deposit*.ts]
---

# Deposits

The software takes a deposit on the guest's card when a stay is booked, so the
hotel isn't left out of pocket by guests who never arrive.

## What people can do

### Front desk clerk

- See whether a stay's deposit has been paid.
- Take a deposit again when the guest's card was declined.

## Open decisions

- **Long stays:** is a week's stay still secured by one night's deposit?
