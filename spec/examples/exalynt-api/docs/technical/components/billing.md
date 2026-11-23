---
id: billing
name: Billing
description: >-
  How the API charges for capacity through a payment provider. Clients handle
  payment methods, billing details, and invoices on the provider's own pages.
  How a provider plugs in is in the [provider boundary
  doc](../mechanisms/provider-boundary.md).
capabilities: [capability:billing, capability:capacity-purchasing]
meets: [reliability/beta/fails-clearly]
tradeoffs:
  - id: provider-is-source-of-truth
    name: Payment provider is the source of truth
    impact: inconvenient
    description: >-
      The provider is the source of truth for invoices and billing details,
      and our row only links to it: we keep the least needed to find an
      invoice and relate its blocks.
    drawback: >-
      Reading an invoice is a call to the provider, and a provider without
      hosted pages doesn't fit.
  - id: tax-inside-payments-provider
    name: Tax handled by the payments provider, not its own
    impact: inconvenient
    description: >-
      Tax is part of the payments provider, not a provider of its own: the
      provider already holds the billing address tax is worked out from, and
      issues the invoice the tax goes on, so a separate tax provider would
      pull billing details out of it and push tax lines back in.
    drawback: >-
      A payments provider that can't work out tax has to call a tax service
      inside its own implementation.
    when: A payments provider that can't work out tax is added.
---

The API keeps only the organization's customer with the provider, and an
`invoices` row: `provider`, `external_id`, `status`, and the purchase's
`idempotency_key`. Each block points at its invoice, which is how a webhook
finds the blocks an invoice settles, and how a retry finds what it bought.

`POST /v1/billing-sessions` sends a client to the provider. Its `page` names
what the client is doing, never one of the provider's pages, and the provider
opens what it has. `GET /v1/invoices/{id}` reads everything but the row from
the provider each time. Provider links to an invoice's page expire, so they're
read when opened and never stored.

A billing session's URL is a short-lived credential for the organization's
billing. It's never cached or logged, and its return address comes from
`APP_URL`, never the request.

**A purchase** asks the provider for the default, charges it on an invoice of
its own, and only then records the invoice and blocks. The provider works out
the tax on it and adds it; `GET /v1/capacity-quote` asks it for the same
invoice's totals without charging, and a purchase sent with that total as
`quoted_total_cents` is refused if the provider's total differs.

- The charge happens before the invoice is written, and webhooks for an
  invoice the API has no record of are acknowledged and ignored. The log line
  says "charged but not recorded on invoice".
- Retrying with the same `Idempotency-Key` records the blocks without charging
  again, for as long as the provider keeps the key, at least 24 hours.
- A default deleted between the check and the charge reads as a decline: the
  invoice is voided and nothing is owed.
- Provider calls happen while the organization's row is locked, so each has a
  timeout. With Stripe that's 10 seconds, retried twice on a network error, so
  half a minute at most.

**Later status changes** come from the provider's webhook, or
`api sync invoices`, each reading the provider's current state in a
transaction that locks the organization's row.

- A webhook redelivered or out of order is safe, as it always reads current
  state. A failed write catches up on the next webhook or `api sync invoices`.
- `api sync invoices` only compares statuses, and only walks invoices the API
  recorded.
- The webhook acts as the API itself (`billing:sync`), and only on the invoice
  its event names.
