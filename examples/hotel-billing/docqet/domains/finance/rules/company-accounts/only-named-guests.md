---
docqet: rule
id: only-named-guests
domain: finance
name: Only named guests' bills go to a company
concepts: [concept:company-account, concept:bill@billing]
respects: [constraint:company-credit-agreements]
---

A bill can move to a company's account only if the company has named the guest
as someone whose stays it pays for.
