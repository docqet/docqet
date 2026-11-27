---
docqet: capability
id: check-out
name: Check-out
description: >-
  Guests settle their bill as they leave, so nothing is left owing once
  they've gone.
stability: alpha
feature: feature:front-desk
solves:
  - problem:guests-queue-at-the-desk
  - problem:guests-leave-owing
  - problem:settling-up-holds-guests-up
rules: [rule:closed-bills-dont-change]
concepts: [concept:bill, concept:billed-stay]
decisions:
  - question: >-
      Do guests want their bill emailed as they leave, or printed at the
      desk?
---

## Includes

- Clerks see a departing guest's bill, with every night and charge on it.
- Clerks take payment for the balance, and close the bill.
