---
name: Direct billing
summary: >-
  Clerks move a guest's bill to their company's account at check-out, so the
  guest leaves without paying.
stability: alpha
personas: [front-desk-clerk, guest]
rules:
  - company-accounts/credit-limit
  - company-accounts/only-named-guests
concepts: [bill, company-account]
tradeoffs:
  - id: whole-bill-moves
    text: A bill moves to a company's account whole, not charge by charge.
    gain: >-
      Clerks move a bill in one step at check-out, and a company's account
      only ever holds whole bills.
    cost: >-
      A guest who pays for their own extras pays for them before their bill
      moves.
    revisit: a company asks to pay for rooms only
---
