---
docqet: rule
id: credit-limit
domain: finance
name: A company can't go over its credit limit
concepts: [concept:company-account, concept:bill@billing]
respects: [constraint:company-credit-agreements]
---

A bill can't move to a company's account if it would take what the company owes
over its credit limit.
