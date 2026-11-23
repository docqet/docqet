---
stability: alpha
personas: [bookkeeper]
rules: [invoices/invoice-numbers-run-in-sequence]
concepts: [company-account]
code: [src/invoices/**]
gaps:
  - id: no-payment-reminders
    until: not-decided
    text: >-
      Nothing reminds a company when an invoice is overdue. The bookkeeper
      checks the unpaid invoices each week and chases them by email.
---

# Invoices

Bookkeepers invoice each company once a month for its staff's stays.

## Covers

- Bookkeepers record a company's payment against its invoice.
