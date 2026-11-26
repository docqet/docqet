---
docqet: capability
id: deposits
domain: billing
name: Deposits
description: The software takes a deposit on the guest's card when a stay is booked.
stability: beta
personas: [persona:manager, persona:front-desk-clerk]
rules:
  - rule:deposit-is-the-first-night
  - rule:deposit-counts-towards-the-bill
  - rule:card-numbers-are-never-kept
concepts: [concept:payment, concept:bill]
decisions:
  - topic: Long stays
    question: Is a week's stay still secured by one night's deposit?
---

## Includes

- Clerks see whether a stay's deposit has been paid.
- Clerks take a deposit again when the guest's card was declined.
