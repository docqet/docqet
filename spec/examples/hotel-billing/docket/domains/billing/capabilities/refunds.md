---
docket: capability
id: refunds
domain: billing
name: Refunds
description: >-
  Clerks refund a guest what they've paid over their bill, before the bill
  closes.
stability: draft
personas: [persona:front-desk-clerk, persona:guest]
rules: [rule:overpayments-are-refunded]
concepts: [concept:payment, concept:bill]
decisions:
  - topic: Where the money goes
    question: >-
      Always back to the card it came from, or to whichever card the guest
      has with them?
---
