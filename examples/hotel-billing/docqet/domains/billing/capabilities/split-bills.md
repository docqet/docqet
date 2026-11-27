---
docqet: capability
id: split-bills
domain: billing
name: Split bills
description: >-
  Clerks split a bill between guests sharing a room, or move charges onto
  another guest's bill.
stability: prototype
solves: [problem:guests-billed-more-than-they-owe]
rules: [rule:moving-charges-keeps-the-total]
concepts: [concept:bill, concept:charge]
decisions:
  - question: Do guests split evenly, or charge by charge?
---
