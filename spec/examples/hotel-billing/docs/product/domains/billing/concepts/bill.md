---
name: Bill
description: >-
  Everything a guest owes for one stay, and everything they've paid towards
  it.
lifecycle:
  states:
    - Open
    - Closed
  text: >-
    A bill closes when its balance is zero, or when it moves to a company's
    account.
confused-with:
  - term: Invoice
    text: what a company is sent for a month of its staff's bills.
---

A bill is made of [charges](charge.md) and [payments](payment.md). Its balance
is what's been charged less what's been paid. A guest's bill can move to their
[company's account](../../finance/concepts/company-account.md), which then owes it instead.
