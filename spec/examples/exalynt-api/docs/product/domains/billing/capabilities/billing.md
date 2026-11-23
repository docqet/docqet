---
id: billing
name: Billing
description: >-
  Clients pay for the capacity they buy with their default payment method, and
  each purchase issues an invoice.
stability: beta
personas:
  - persona:client-admin-founder
  - persona:client-admin-operations
  - persona:client-billing
  - persona:exalynt-admin
rules:
  - rule:who-manages-billing
  - rule:buying-requires-a-payment-method
  - rule:buying-charges-at-once
  - rule:the-payment-provider-works-out-the-tax
  - rule:purchases-are-quoted-with-their-tax
  - rule:a-changed-total-buys-nothing
  - rule:tax-needs-to-know-where-the-client-is
  - rule:declined-purchases-buy-nothing
  - rule:at-most-20-blocks-per-purchase
  - rule:paying-an-invoice-releases-its-capacity
  - rule:organizations-billing-stays-separate
  - rule:unpaid-invoices-are-paid-with-the-provider
  - rule:company-details-stay-untouched
  - rule:when-company-details-count-as-given
  - rule:capacity-fees-and-infrastructure-billed-separately
concepts: [concept:invoice, concept:capacity-block@capacity]
gaps:
  - id: no-fees-or-infrastructure-charges
    name: Operations and infrastructure charges not shown
    impact: inconvenient
    description: >-
      Clients can't see operations fees or infrastructure pass-through
      charges, each shown separately from capacity.
  - id: no-reminders-or-retries-for-unpaid-invoices
    name: No reminders or retries for unpaid invoices
    impact: inconvenient
    description: >-
      An unpaid invoice stays owed until it's paid or Exalynt voids it.
      Nobody is reminded of it, and nothing retries the payment.
  - id: charged-but-unrecorded-purchases
    name: Charged purchases can go unrecorded
    impact: damaging
    description: >-
      A purchase that was charged but not recorded has no invoice or blocks
      with Exalynt until it's retried, and the payment provider's updates
      about it are ignored, since Exalynt has no record of the invoice. If it
      can't be retried, it's sorted out by hand with the payment provider.
    when: A purchase is charged but recording it fails.
  - id: capacity-invoices-in-us-dollars-only
    name: Capacity invoices only, in US dollars
    impact: inconvenient
    description: >-
      Every invoice is for capacity, in US dollars. There are no invoices for
      the operations fee or infrastructure yet.
  - id: missed-provider-updates-leave-statuses-stale
    name: Missed provider updates leave statuses stale
    impact: inconvenient
    description: >-
      A missed update from the payment provider leaves an invoice's status,
      and so its blocks, stale until the provider sends it again or invoices
      are compared with the provider. That comparison only covers statuses,
      so a payment that failed on an invoice still open is only noticed
      through the provider's update.
    when: An update from the payment provider is missed.
  - id: voided-invoices-may-show-with-the-provider
    name: Voided invoices may show with the provider
    impact: negligible
    description: >-
      The payment provider's invoice list may also show the voided invoice
      left behind by each declined purchase, or each one whose total changed
      after it was quoted. That hasn't been checked.
    when: A purchase is declined, or its total changes after it's quoted.
  - id: invoices-keep-billing-details-as-issued
    name: Invoices miss billing details added later
    impact: damaging
    description: >-
      An invoice keeps the billing details its customer had when it was
      issued. Capacity can't be bought without a billing address, for its
      tax, but a company name or tax ID skipped when adding a card is missing
      from the invoices issued before it's added.
    when: A client skips their company name or tax ID when adding a card.
  - id: failed-payment-emails-need-a-provider-address
    name: Failed payment emails need a provider address
    impact: inconvenient
    description: >-
      Nobody is emailed about a failed payment, unless the payment provider
      has an address for the customer.
    when: The payment provider has no email address for the customer.
  - id: invoice-readers-cant-list-invoices
    name: Invoice readers can't list invoices
    impact: negligible
    description: >-
      Someone who can read invoices but not pay them, which only a custom
      role can be, can't list invoices, since the list is on the payment
      provider's pages.
    when: Someone is given a custom role that reads invoices but can't pay them.
  - id: payment-methods-set-with-the-provider
    name: Allowed payment methods set with the provider
    impact: inconvenient
    description: >-
      Which payment methods clients can add is the payment provider account's
      setting, so "cards only" is set there. A charge to anything else goes
      through the provider the same way, and the label for it is generic.
  - id: cards-but-no-default
    name: Cards can be left without a default
    impact: inconvenient
    description: >-
      A client can leave themselves with cards but no default, which the
      payment provider's pages may allow. Buying is refused until they choose
      one.
    when: A client removes their default card but keeps others.
  - id: needs-a-provider-with-hosted-pages
    name: Needs a provider with hosted pages
    impact: blocking
    description: >-
      A payment provider with no hosted pages for payment methods, such as one
      that only offers an embedded card form, can't be used without payment
      method screens of our own.
    when: >-
      Exalynt moves to a payment provider without hosted payment method pages.
  - id: default-payment-method-read-on-return-only
    name: Default payment method refreshed only on return
    impact: negligible
    description: >-
      The default payment method shown is read again on coming back from the
      payment provider, but not somewhere else that was left open.
    when: The default payment method is changed while another page is left open.
  - id: failed-load-says-to-reload
    name: No retry in place after a failed load
    outcome: usability/beta/recover
    impact: inconvenient
    description: >-
      A failed load says to reload, with no way to retry in place.
  - id: old-payment-method-records-remain
    name: Old payment method records not removed
    impact: negligible
    description: >-
      Exalynt's old records of payment methods are no longer used, and are
      still to be removed.
tradeoffs:
  - id: prices-listed-before-tax
    name: Prices listed before tax
    impact: inconvenient
    description: >-
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
