---
docqet: concept
id: payout
domain: pay
name: Payout
description: >-
  Money sent to a payee, made up of earnings. A payout is always current or
  historical, never in the future: what's still to come is earnings.
confused-with:
  - concept: concept:payout-share
    summary: >-
      what someone is owed from a block, which exists from when the block
      is assigned. A payout is the money that pays it.
---

A payout is made up of earnings, which come from [payout shares](payout-share.md)
among other things, and has no kind of its own. It goes to the payee's payout
account, which is one bank account.

## Lifecycle

1. Processing
2. Paid, or Failed, or Canceled. A Paid payout can still become Failed if the
   bank returns it.

A separate lifecycle that starts once a block is fulfilled. Each of its payout
shares (engineer, team support, team lead, partnership) moves through its own
payout and payment statuses. A fulfilled block isn't necessarily paid out.
