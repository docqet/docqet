---
docket: concept
id: payout-share
domain: pay
name: Payout share
description: >-
  One part of a [capacity block](../../capacity/concepts/capacity-block.md)'s
  [capacity payout basis](capacity-payout-basis.md), owed to whoever earned
  it. Also called an earning.
confused-with:
  - concept: concept:payout
    summary: >-
      money sent, made up of earnings. A share is what's owed, and it
      exists before any payout does.
  - concept: concept:capacity-payout-basis
    summary: the whole amount a share is a percentage of.
---

A block can have these shares:

- **Engineer share**: for the engineer on the block.
- **Team support share**: for each teammate with availability in the block's
  week.
- **Team-lead share**: for the lead of that engineer's team.
- **Partnership share**: for the [partnership](../../partnerships/concepts/partnership.md) that introduced
  the client.

Each share is a percentage of the basis. An earning has a kind, and more kinds
of paid work may come. A [payout](payout.md) is made up of earnings.

## Lifecycle

1. Upcoming
2. Earned
3. Sent
4. Paid

A share is upcoming from when the block is assigned, and earned when the block
is fulfilled. An earned share can be on hold while its payee has no payout
account that can be paid. It's sent when a payout carries it, and paid once that
payout has arrived.
