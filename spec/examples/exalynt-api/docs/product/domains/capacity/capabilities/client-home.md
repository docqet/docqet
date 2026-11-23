---
name: Client home
description: >-
  Clients land on a page showing what's happening with their capacity, and
  what's waiting on them.
stability: beta
personas: [client-admin-founder, client-admin-operations, client-member]
rules:
  - scheduling/exalynt-can-move-lapsed-blocks
  - scheduling/the-preferred-week-is-a-target
concepts: [capacity-block]
gaps:
  - id: engineer-not-always-named
    summary: >-
      A block's engineer is named only when they're on one of the client's
      teams and the team has loaded. Otherwise it says an engineer at Exalynt.
  - id: no-retry-on-failed-section
    outcome: usability/beta/recover
    summary: A failed section says to reload. There's no retry on it.
  - id: changes-show-on-reopening
    summary: Changes show only when the page opens again.
  - id: custom-roles-and-session-end-unverified
    summary: >-
      Custom roles, and a session ending while the page is open, haven't been
      verified.
  - id: screen-readers-unverified
    outcome: usability/beta/everyone
    summary: Real screen readers haven't been verified.
tradeoffs:
  - id: status-not-work
    summary: >-
      A block shows who's on it and where it stands, not what was done on it.
    drawbacks:
      - >-
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
