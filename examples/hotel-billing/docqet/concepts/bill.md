---
docqet: concept
id: bill
name: Bill
description: >-
  Everything a guest owes for one stay, and everything they've paid towards
  it.
confused-with:
  - term: Invoice
    summary: what a company is sent for a month of its staff's bills.
---

A bill is made of [charges](charge.md) and [payments](payment.md). Its balance
is what's been charged less what's been paid. A guest's bill can move to their
[company's account](company-account.md), which then owes it instead.

## Lifecycle

1. Open
2. Closed

A bill closes when its balance is zero, or when it moves to a company's account.
