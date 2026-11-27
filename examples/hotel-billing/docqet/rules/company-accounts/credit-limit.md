---
docqet: rule
id: credit-limit
name: A company can't go over its credit limit
uses: [concept:company-account, concept:bill]
respects: [constraint:company-credit-agreements]
---

A bill can't move to a company's account if it would take what the company owes
over its credit limit.
