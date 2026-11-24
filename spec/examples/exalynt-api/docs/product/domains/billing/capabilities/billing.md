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
    likelihood: possible
    reach: some
    description: >-
      Clients can't see operations fees or infrastructure pass-through
      charges, each shown separately from capacity.
  - id: charged-but-unrecorded-purchases
    name: Charged purchases can go unrecorded
    impact: inconvenient
    likelihood: unlikely
    reach: few
    description: >-
      A purchase that was charged but not recorded has no invoice or blocks
      with Exalynt until it's retried, and the payment provider's updates
      about it are ignored, since Exalynt has no record of the invoice. If it
      can't be retried, it's sorted out by hand with the payment provider.
tradeoffs:
  - id: prices-listed-before-tax
    name: Prices listed before tax
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
