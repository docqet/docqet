---
docqet: capability
id: direct-billing
domain: finance
name: Direct billing
description: >-
  Clerks move a guest's bill to their company's account at check-out, so the
  guest leaves without paying.
stability: alpha
personas: [persona:front-desk-clerk, persona:guest]
rules:
  - rule:credit-limit
  - rule:only-named-guests
concepts: [concept:bill@billing, concept:company-account]
tradeoffs:
  - id: whole-bill-moves
    name: Whole bills move, not single charges
    description: A bill moves to a company's account whole, not charge by charge.
    benefit: >-
      Clerks move a bill in one step at check-out, and a company's account
      only ever holds whole bills.
    drawback: >-
      A guest who pays for their own extras pays for them before their bill
      moves.
---
