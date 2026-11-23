---
name: Capacity purchasing
description: >-
  Clients buy engineering capacity in blocks, charged at once to their
  organization's default payment method on one invoice, to schedule now or
  later.
stability: beta
personas: [client-admin-founder, client-admin-operations]
rules:
  - capacity-purchasing/blocks-stay-within-their-organization
  - capacity-purchasing/capacity-types-listed-smallest-first
  - capacity-purchasing/buying-only-defined-capacity-types
  - capacity-purchasing/capacity-is-never-shown-as-hours
  - capacity-purchasing/clients-never-choose-who-works
  - capacity-purchasing/buying-before-having-a-team
  - capacity-purchasing/blocks-are-bought-then-scheduled
  - capacity-purchasing/block-numbers-are-per-organization
  - capacity-purchasing/retrying-a-purchase-never-charges-twice
concepts: [capacity-block, capacity-unit, invoice]
gaps:
  - id: block-list-filters-reset
    summary: >-
      The filters and sort on the list of blocks are cleared on coming back
      from a block.
  - id: no-failed-payment-email
    summary: >-
      A block whose payment fails shows that it failed until its invoice is
      paid, on the payment provider's page for it. Nobody is emailed about a
      failed payment.
  - id: retry-protection-expires
    rule: capacity-purchasing/retrying-a-purchase-never-charges-twice
    summary: >-
      A retried purchase is protected from charging twice only for as long as
      the payment provider keeps the attempt, at least 24 hours.
  - id: retry-repeats-provider-error
    summary: >-
      The payment provider repeats a failed attempt's result, so a retry after
      a provider error can fail the same way. It still can't charge twice.
  - id: unknown-outcome-retry-while-open
    rule: capacity-purchasing/retrying-a-purchase-never-charges-twice
    summary: >-
      If it can't be told whether a purchase went through, the client is told
      so, and trying again can't charge twice, but only while that attempt is
      still open. Closing it, or reloading, starts a new purchase.
  - id: real-payments-untried
    outcome: functionality/beta/unusual-input
    summary: >-
      A decline replayed by the real payment provider, and a real bank debit
      from start to finish, haven't been tried.
  - id: touch-and-screen-readers-untried
    outcome: usability/beta/everyone
    summary: Real touch screens and screen readers haven't been tried.
decisions:
  - topic: Buying without a call
    question: >-
      The site says blocks are "bought after a call, not from a card", but
      clients can purchase in the app. Does a client's first block, or
      every block, follow a call? A client can buy before it has a team,
      and Exalynt contacts a new client before its first block starts,
      outside the product.
  - topic: Refunds and cancellation
    question: >-
      We promise to fulfill or refund every block. When and how a refund
      happens, who can start one, and whether a client can cancel a block
      that hasn't been fulfilled are all still open. That includes what
      happens to unfulfilled blocks when a client closes their account,
      and whether a refunded first purchase still opens a partnership's
      earning window.
  - topic: Who sees the payout basis
    question: >-
      Each type of block's Capacity Payout Basis is listed with its price
      for anyone signed in, clients included, so engineers can see what a
      block would earn them before claiming it. Whether clients should see
      it, beside the price they pay, is still to be decided.
---

## Includes

- Clients review an order with its tax, as the payment provider works it out,
  before buying it for that total.
- Clients buy more than one block for the same week, to move separate work
  forward in parallel.
- Clients see every block they've bought in one table, sorted by any column and
  filtered by status, type, engineer, team, and when it was bought, each with
  its type, size, who's on it, its week, when it was bought, and what it needs
  from them next.
- Clients open any block to see it on its own, with its invoice.
