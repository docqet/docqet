---
name: Pay by link
description: >-
  Guests pay their bill by card from a link the hotel sends them, without
  coming to the desk.
stability: alpha
personas: [guest, front-desk-clerk]
rules:
  - payments/card-numbers-are-never-kept
  - bills/closed-bills-dont-change
concepts: [payment, bill]
tradeoffs:
  - id: hotels-currency-only
    summary: Guests pay in the hotel's currency, not their own.
    benefits:
      - The bill, the payment and the hotel's books are all in one currency.
      - There are no exchange rates to keep.
    drawbacks:
      - >-
        Their card provider converts it, at its own rate, so the amount on
        their statement can differ from the bill.
decisions:
  - question: Do guests pay before they leave, or wait until they're home?
---

## Includes

- Clerks send a guest a link to pay what they owe.
