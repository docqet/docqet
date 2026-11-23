---
name: Invoice
description: >-
  What a purchase of capacity issues. Exalynt keeps a small record of it that
  links it to the payment provider and to the
  [blocks](../../capacity/concepts/capacity-block.md) it bought; the provider
  holds everything else about it, including the tax it worked out and added to
  it.
---

Each block bought on an invoice points at it. An invoice's status is separate from
the status of any payment on it: one whose payment is clearing or has failed still
reads Open, and that payment shows on its blocks. Each payment provider's own
statuses map onto Exalynt's.

## Lifecycle

1. Draft
2. Open
3. Paid, Void, or Uncollectible

An invoice stays open if a payment on it didn't go through, or is still
clearing. Paying it makes it Paid. Voiding it makes it Void, and Uncollectible
means it's been written off.
