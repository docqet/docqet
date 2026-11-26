---
docqet: capability
id: client-home
domain: capacity
name: Client home
description: >-
  Clients land on a page showing what's happening with their capacity, and
  what's waiting on them.
stability: beta
personas: [persona:client-admin-founder, persona:client-admin-operations, persona:client-member]
initiatives: [initiative:mvp]
rules:
  - rule:exalynt-can-move-lapsed-blocks
  - rule:the-preferred-week-is-a-target
concepts: [concept:capacity-block]
tradeoffs:
  - id: status-not-work
    name: Block status, not the work done
    description: >-
      A block shows who's on it and where it stands, not what was done on it.
    drawback: >-
      A client can't tell from home what was done on a block, and opens the
      block's own page for that.
---

## Includes

- Clients see their blocks by week, each with the engineer on it, its type, and
  its status: this week's, with any from earlier weeks not finished yet, the
  next three weeks booked, and the last three weeks' completed.
- Clients open any block's own page from there.
- A block whose week passed with no work begun shows as missed, with Exalynt
  rebooking it.
- Clients see how many blocks are at each status, with scheduling what's waiting
  for a week and buying more a step away.
- Clients buy capacity from the top of the page.
- Clients see the capacity booked and how far it reaches, their team, and their
  account.

## Success

- A client opening the portal can tell what's being worked this week, what's
  booked next, and what's waiting on them, without opening another page.
