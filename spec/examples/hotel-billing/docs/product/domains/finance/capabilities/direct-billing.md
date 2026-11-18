---
stability: Alpha
personas: [front-desk-clerk, guest]
rules:
  - company-accounts/credit-limit
  - company-accounts/only-named-guests
concepts: [bill, company-account]
code: [src/companies/**]
gaps:
  - id: whole-bill-moves
    kind: accepted-tradeoff
    text: >-
      A bill moves to a company's account whole. A guest who pays for their
      own extras pays for them before their bill moves.
---

# Direct billing

Clerks move a guest's bill to their company's account at check-out, so the
guest leaves without paying.
