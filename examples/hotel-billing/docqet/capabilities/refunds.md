---
docqet: capability
id: refunds
name: Refunds
description: >-
  Clerks refund a guest what they've paid over their bill, before the bill
  closes.
stability: draft
feature: feature:payments
solves: [problem:guests-billed-more-than-they-owe]
rules: [rule:overpayments-are-refunded]
concepts: [concept:payment, concept:bill]
decisions:
  - topic: Where the money goes
    question: >-
      Always back to the card it came from, or to whichever card the guest
      has with them?
---
