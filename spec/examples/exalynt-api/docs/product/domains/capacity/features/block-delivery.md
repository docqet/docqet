---
id: block-delivery
name: Block delivery
description: >-
  Getting each block a client buys scheduled into a week, staffed by an
  engineer, and worked until it's fulfilled.
capabilities:
  - capability:scheduling
  - capability:claiming-blocks
  - capability:staffing
  - capability:fulfillment
---

## How it goes

1. The client schedules the block for a preferred week that has room.
2. An engineer claims it from the client's shared queue, or an admin assigns
   an eligible engineer to it.
3. The engineer starts it, any time from the start of its week, and can add a
   focus saying what its work is about, unless the client already has.
4. The engineer marks it fulfilled. Nobody reviews it, and the client sees it
   go from in progress to fulfilled.
5. The people who earned from it see what it earned them, and are paid once an
   admin releases the week's payouts. That's
   [Getting paid](../../pay/features/getting-paid.md).

A block the client moves before its week starts comes off its engineer and goes
back to the shared queue for its new week. A block nobody is on when its week
ends stays scheduled and still owed, and an admin moves it to a coming week.
