---
docqet: rule
id: only-named-guests
name: Only named guests' bills go to a company
uses: [concept:company-account, concept:bill]
respects: [constraint:company-credit-agreements]
---

A bill can move to a company's account only if the company has named the guest
as someone whose stays it pays for.
