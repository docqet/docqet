---
name: Capacity block
description: >-
  One purchase of Engineering Capacity, scheduled into a single week. Its type
  sets its size: **Flex** is 1 [unit](capacity-unit.md), **Core** 2, and
  **Dedicated** 4.
lifecycle:
  states:
    - Pending payment (while the client's payment clears)
    - Unscheduled
    - Scheduled, unassigned (in the client's shared queue)
    - Assigned
    - In progress (once its engineer starts it, from the start of its week)
    - Fulfilled (once its engineer marks it fulfilled)
  text: >-
    Purchasing, scheduling, assignment, starting, and fulfilling are
    separate steps. Nobody reviews a block: it's [fulfilled](fulfilled.md)
    once its engineer marks it so.
confused-with:
  - concept: capacity-unit
    text: a quarter of one engineer's week, the size a block is measured in.
  - concept: payout@pay
    text: >-
      a separate lifecycle that starts once a block is fulfilled. A
      fulfilled block isn't necessarily paid out.
---

A block belongs to the [organization](../../accounts/concepts/organization.md) that bought it, and is
numbered in turn within it, keeping its number, such as BLK-0001. Once
scheduled, it has a [preferred week](preferred-week.md), and it sits in the
client's [shared queue](shared-queue.md) until it has an engineer. It can have a
[focus](focus.md) saying what its work is about.
