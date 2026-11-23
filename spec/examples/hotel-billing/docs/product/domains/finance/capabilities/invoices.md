---
name: Invoices
description: Bookkeepers invoice each company once a month for its staff's stays.
stability: alpha
personas: [bookkeeper]
rules: [invoices/invoice-numbers-run-in-sequence]
concepts: [company-account]
gaps:
  - id: no-payment-reminders
    summary: >-
      Nothing reminds a company when an invoice is overdue. The bookkeeper
      checks the unpaid invoices each week and chases them by email.
---

## Includes

- Bookkeepers record a company's payment against its invoice.
