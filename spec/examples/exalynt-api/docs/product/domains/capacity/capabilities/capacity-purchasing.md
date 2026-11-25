---
id: capacity-purchasing
name: Capacity purchasing
description: >-
  Clients buy engineering capacity in blocks, charged at once to their
  organization's default payment method on one invoice, to schedule now or
  later.
stability: beta
personas: [persona:client-admin-founder, persona:client-admin-operations]
initiatives: [initiative:mvp]
rules:
  - rule:blocks-stay-within-their-organization
  - rule:capacity-types-listed-smallest-first
  - rule:buying-only-defined-capacity-types
  - rule:capacity-is-never-shown-as-hours
  - rule:clients-never-choose-who-works
  - rule:buying-before-having-a-team
  - rule:blocks-are-bought-then-scheduled
  - rule:block-numbers-are-per-organization
  - rule:retrying-a-purchase-never-charges-twice
concepts: [concept:capacity-block, concept:capacity-unit, concept:invoice@billing]
gaps:
  - id: unknown-outcome-retry-while-open
    name: Unclear purchase retry safe only while open
    rule: rule:retrying-a-purchase-never-charges-twice
    impact: inconvenient
    likelihood: unlikely
    reach: few
    description: >-
      If it can't be told whether a purchase went through, the client is told
      so, and trying again can't charge twice, but only while that attempt is
      still open. Closing it, or reloading, starts a new purchase.
  - id: touch-and-screen-readers-untried
    name: Touch screens and screen readers untried
    outcome: usability/beta/everyone
    impact: inconvenient
    likelihood: possible
    reach: few
    description: >-
      Real touch screens and screen readers haven't been tried. That matters
      for someone buying blocks on a touch screen or with a screen reader.
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
