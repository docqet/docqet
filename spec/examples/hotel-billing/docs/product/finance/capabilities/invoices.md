---
stability: Alpha
rules: [invoices/invoice-numbers-run-in-sequence]
concepts: [company-account]
code: [src/invoices/**]
gaps:
  - id: no-payment-reminders
    kind: to-close-later
    text: >-
      Nothing reminds a company when an invoice is overdue. The bookkeeper
      checks the unpaid invoices each week and chases them by email.
---

# Invoices

Bookkeepers invoice each company once a month for its staff's stays.

## What people can do

### Bookkeeper

- Invoice every company for last month's stays.
- Record a company's payment against its invoice.
