---
name: Provider boundary
summary: >-
  How the API reaches third-party services so that one can be swapped or
  stubbed without its callers noticing. Each service's own setup and behavior
  has a provider doc.
---

Each type of provider is an interface in `internal/<type>`, with one
implementation per provider beneath it. An environment variable selects the
provider (the README's Configuration section lists them), and
`internal/bootstrap` builds it, refusing to start when the selected one is
missing a setting it requires. Payments, payouts, email, flags, and messaging
default to `noop` and storage to `memory`, so the local stack needs no third
party. Identity defaults to `clerk`, and has no stand-in.

In production, `.kube/configmap.yaml` selects each provider, and secrets are
GitHub secrets that `.github/workflows/deploy.yml` renders into
`.kube/secret.yaml`.

Every deploy's migrate Job (`.kube/migrate-job.yaml`) provisions what the code
defines, before the new pods start, and each step changes nothing when
everything is in step:

- `api migrate up`.
- `api provision payments stripe --apply`, for the capacity types' products
  and prices.
- `api provision roles --apply`, for the organization roles.
- `api access bootstrap --create --apply`, for the platform's own
  administrator.

Everything else in a provider doc's Setup is done by hand, and stays that way.

Each provider that reaches an external service has a check on
`GET /v1/healthz`, run every 30 seconds in the background. Noop, memory, and
local providers have none.

`/v1/readyz` leaves the providers out, so an outage at one never takes the API
out of rotation. Bootstrap checks only that settings are present. Nothing at
start-up checks that a key works, or that a domain or bucket is right: those
show up as failures when they're used.

**Adding a payments provider** needs, without changing the API's contract or
the front end:

- An implementation of `payments.Provider` (`internal/payments/provider.go`) in
  `internal/payments/<provider>`. Its package doc lists what a provider must
  support: hosted pages for payment methods, billing details, invoices and each
  invoice, charging a saved default off-session at once, working out, quoting,
  and collecting each invoice's tax, idempotency keys kept for at least 24
  hours, and statuses mapped onto the API's. A provider that can't work out tax
  calls a tax service from inside its own implementation. Callers only ever
  get the addresses of the provider's pages, and each `page` names what the
  client is doing.
- A webhook handler, with its own signature check and route, that calls
  `InvoiceService.Sync` when one of its invoices changes.
- Its settings in `internal/config` and `internal/bootstrap`, the README's
  variables, and a provider doc.

A provider with no hosted pages for payment methods, only an embedded card
form, doesn't fit: it would need payment method screens of our own.
