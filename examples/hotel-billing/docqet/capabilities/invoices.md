---
docqet: capability
id: invoices
name: Invoices
description: Bookkeepers invoice each company once a month for its staff's stays.
stability: alpha
feature: feature:company-accounts
solves: [problem:company-debts-go-unwatched]
rules: [rule:invoice-numbers-run-in-sequence]
concepts: [concept:company-account]
gaps:
  - id: no-payment-reminders
    name: No reminders for overdue invoices
    impact: inconvenient
    likelihood: certain
    reach: all
    description: >-
      Nothing reminds a company when an invoice is overdue. The bookkeeper
      checks the unpaid invoices each week and chases them by email.
---

## Includes

- Bookkeepers record a company's payment against its invoice.
