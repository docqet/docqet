---
name: Refunds
summary: >-
  Clerks refund a guest what they've paid over their bill, before the bill
  closes.
stability: draft
personas: [front-desk-clerk, guest]
rules: [payments/overpayments-are-refunded]
concepts: [payment, bill]
decisions:
  - topic: Where the money goes
    question: >-
      Always back to the card it came from, or to whichever card the guest
      has with them?
---
