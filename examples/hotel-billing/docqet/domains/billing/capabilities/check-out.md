---
docqet: capability
id: check-out
domain: billing
name: Check-out
description: >-
  Guests settle their bill as they leave, so nothing is left owing once
  they've gone.
stability: alpha
personas: [persona:front-desk-clerk, persona:guest]
rules: [rule:closed-bills-dont-change]
concepts: [concept:bill, concept:booking]
decisions:
  - question: >-
      Do guests want their bill emailed as they leave, or printed at the
      desk?
---

## Includes

- Clerks see a departing guest's bill, with every night and charge on it.
- Clerks take payment for the balance, and close the bill.
