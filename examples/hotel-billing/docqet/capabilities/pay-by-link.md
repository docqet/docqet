---
docqet: capability
id: pay-by-link
name: Pay by link
description: >-
  Guests pay their bill by card from a link the hotel sends them, without
  coming to the desk.
stability: alpha
feature: feature:payments
solves: [problem:settling-up-holds-guests-up, problem:guests-queue-at-the-desk]
rules:
  - rule:card-numbers-are-never-kept
  - rule:closed-bills-dont-change
concepts: [concept:payment, concept:bill]
tradeoffs:
  - id: hotels-currency-only
    name: Hotel's currency only
    description: Guests pay in the hotel's currency, not their own.
    benefit: >-
      The bill, the payment and the hotel's books are all in one currency,
      with no exchange rates to keep.
    drawback: >-
      Their card provider converts it, at its own rate, so the amount on
      their statement can differ from the bill.
decisions:
  - question: Do guests pay before they leave, or wait until they're home?
---

## Includes

- Clerks send a guest a link to pay what they owe.
