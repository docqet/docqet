---
name: Billing
description: >-
  Clients pay for the capacity they buy with their default payment method, and
  each purchase issues an invoice.
stability: beta
personas:
  - client-admin-founder
  - client-admin-operations
  - client-billing
  - exalynt-admin
rules:
  - billing/who-manages-billing
  - billing/buying-requires-a-payment-method
  - billing/buying-charges-at-once
  - billing/the-payment-provider-works-out-the-tax
  - billing/purchases-are-quoted-with-their-tax
  - billing/a-changed-total-buys-nothing
  - billing/tax-needs-to-know-where-the-client-is
  - billing/declined-purchases-buy-nothing
  - billing/at-most-20-blocks-per-purchase
  - billing/paying-an-invoice-releases-its-capacity
  - billing/organizations-billing-stays-separate
  - billing/unpaid-invoices-are-paid-with-the-provider
  - billing/company-details-stay-untouched
  - billing/when-company-details-count-as-given
  - billing/capacity-fees-and-infrastructure-billed-separately
concepts: [invoice, capacity-block]
gaps:
  - id: no-fees-or-infrastructure-charges
    impact: blocking
    summary: >-
      Clients can't see operations fees or infrastructure pass-through
      charges, each shown separately from capacity.
  - id: no-reminders-or-retries-for-unpaid-invoices
    impact: inconvenient
    summary: >-
      An unpaid invoice stays owed until it's paid or Exalynt voids it.
      Nobody is reminded of it, and nothing retries the payment.
  - id: charged-but-unrecorded-purchases
    impact: damaging
    summary: >-
      A purchase that was charged but not recorded has no invoice or blocks
      with Exalynt until it's retried, and the payment provider's updates
      about it are ignored, since Exalynt has no record of the invoice. If it
      can't be retried, it's sorted out by hand with the payment provider.
    when: A purchase is charged but recording it fails.
  - id: capacity-invoices-in-us-dollars-only
    impact: blocking
    summary: >-
      Every invoice is for capacity, in US dollars. There are no invoices for
      the operations fee or infrastructure yet.
  - id: missed-provider-updates-leave-statuses-stale
    impact: inconvenient
    summary: >-
      A missed update from the payment provider leaves an invoice's status,
      and so its blocks, stale until the provider sends it again or invoices
      are compared with the provider. That comparison only covers statuses,
      so a payment that failed on an invoice still open is only noticed
      through the provider's update.
    when: An update from the payment provider is missed.
  - id: voided-invoices-may-show-with-the-provider
    impact: negligible
    summary: >-
      The payment provider's invoice list may also show the voided invoice
      left behind by each declined purchase, or each one whose total changed
      after it was quoted. That hasn't been checked.
    when: A purchase is declined, or its total changes after it's quoted.
  - id: invoices-keep-billing-details-as-issued
    impact: damaging
    summary: >-
      An invoice keeps the billing details its customer had when it was
      issued. Capacity can't be bought without a billing address, for its
      tax, but a company name or tax ID skipped when adding a card is missing
      from the invoices issued before it's added.
    when: A client skips their company name or tax ID when adding a card.
  - id: failed-payment-emails-need-a-provider-address
    impact: inconvenient
    summary: >-
      Nobody is emailed about a failed payment, unless the payment provider
      has an address for the customer.
    when: The payment provider has no email address for the customer.
  - id: invoice-readers-cant-list-invoices
    impact: blocking
    summary: >-
      Someone who can read invoices but not pay them, which only a custom
      role can be, can't list invoices, since the list is on the payment
      provider's pages.
    when: Someone is given a custom role that reads invoices but can't pay them.
  - id: payment-methods-set-with-the-provider
    impact: inconvenient
    summary: >-
      Which payment methods clients can add is the payment provider account's
      setting, so "cards only" is set there. A charge to anything else goes
      through the provider the same way, and the label for it is generic.
  - id: cards-but-no-default
    impact: inconvenient
    summary: >-
      A client can leave themselves with cards but no default, which the
      payment provider's pages may allow. Buying is refused until they choose
      one.
    when: A client removes their default card but keeps others.
  - id: needs-a-provider-with-hosted-pages
    impact: blocking
    summary: >-
      A payment provider with no hosted pages for payment methods, such as one
      that only offers an embedded card form, can't be used without payment
      method screens of our own.
    when: >-
      Exalynt moves to a payment provider without hosted payment method pages.
  - id: default-payment-method-read-on-return-only
    impact: inconvenient
    summary: >-
      The default payment method shown is read again on coming back from the
      payment provider, but not somewhere else that was left open.
    when: The default payment method is changed while another page is left open.
  - id: failed-load-says-to-reload
    outcome: usability/beta/recover
    impact: inconvenient
    summary: >-
      A failed load says to reload, with no way to retry in place.
  - id: tested-only-through-the-api
    outcome: functionality/beta/stays-correct
    impact: damaging
    summary: >-
      The workflow is tested end to end only through the API, and without a
      real payment provider.
    when: >-
      A change breaks paying in the portal, or with the real payment provider.
  - id: old-payment-method-records-remain
    impact: negligible
    summary: >-
      Exalynt's old records of payment methods are no longer used, and are
      still to be removed.
tradeoffs:
  - id: prices-listed-before-tax
    impact: inconvenient
    summary: >-
      Prices are listed before tax everywhere, such as on estimates and when
      choosing blocks.
    drawback: >-
      The tax is only known once an order is reviewed, since the payment
      provider works it out from the billing address.
---

## Includes

- The payment provider holds each organization's payment methods, billing
  details and invoices, and works out and collects the tax on each invoice from
  the organization's billing address.
- Clients add and remove payment methods, and set a default.
- Clients see the tax on a purchase, as the payment provider works it out,
  before buying, and pay it with the purchase on the same invoice.
- Clients see when a block is pending payment or its payment failed, and pay an
  unpaid invoice.
- Clients view and download invoices and see their payment statuses, on the
  payment provider's pages.
- Admins see purchases, invoices, and their payment statuses.
