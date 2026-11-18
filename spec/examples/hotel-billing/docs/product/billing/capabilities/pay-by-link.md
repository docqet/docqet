---
stability: Alpha
personas: [guest, front-desk-clerk]
rules:
  - payments/card-numbers-are-never-kept
  - bills/closed-bills-dont-change
concepts: [payment, bill]
gaps:
  - id: hotels-currency-only
    kind: accepted-tradeoff
    text: >-
      Guests pay in the hotel's currency. Their card provider converts it, at
      its own rate.
---

# Pay by link

Guests pay their bill by card from a link the hotel sends them, without
coming to the desk.

## Covers

- Clerks send a guest a link to pay what they owe.

## Learning

- Do guests pay before they leave, or wait until they're home?
