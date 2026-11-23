---
stability: alpha
personas: [guest, front-desk-clerk]
rules:
  - payments/card-numbers-are-never-kept
  - bills/closed-bills-dont-change
concepts: [payment, bill]
tradeoffs:
  - id: hotels-currency-only
    text: Guests pay in the hotel's currency, not their own.
    cost: >-
      Their card provider converts it, at its own rate, so the amount on
      their statement can differ from the bill.
---

# Pay by link

Guests pay their bill by card from a link the hotel sends them, without
coming to the desk.

## Covers

- Clerks send a guest a link to pay what they owe.

## Learning

- Do guests pay before they leave, or wait until they're home?
