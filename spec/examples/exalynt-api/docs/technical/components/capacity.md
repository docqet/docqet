---
name: Capacity
description: >-
  Blocks of engineering capacity: bought, scheduled into a week, staffed,
  started, and fulfilled, each with at most one focus.
capabilities:
  - capacity-purchasing
  - client-home
  - scheduling
  - claiming-blocks
  - staffing
  - fulfillment
  - client-directory
gaps:
  - id: buying-and-scheduling-not-load-tested
    outcome: efficiency/beta/realistic-volumes
    summary: >-
      Buying and scheduling haven't been load-tested.
  - id: weeks-and-types-not-paged
    outcome: efficiency/beta/bounded
    summary: >-
      `GET /v1/capacity-weeks` and `GET /v1/capacity-types` aren't paged: the
      first's window is capped at 53 weeks, which acts as its page size, and
      there are three types.
tradeoffs:
  - id: combined-room
    summary: >-
      A week's room is combined, not per engineer: a block fits if the total
      covers it, even if no one engineer could do it alone, as the preferred
      week is a target and not a guarantee.
    drawbacks:
      - >-
        A block can be scheduled into a week where no single engineer can fit
        it, and an admin sorts it out.
---

A block moves `pending` → `available` → `scheduled` → `in_progress` →
`fulfilled`, and back from `scheduled` to `available` when it's unscheduled
before its week starts. `CapacityService.Start` moves it to `in_progress` and
`FulfillmentService.Fulfill` to `fulfilled`, setting `fulfilled_at` and earning
its shares in the same transaction.

A client's room in a week comes only from the engineers on teams assigned to
it. `GET /v1/capacity-weeks` reports it and scheduling checks it: what those
engineers offer, the client's own scheduled blocks, and other clients' blocks
taking from the same engineers. `GET /v1/capacity-weeks` reads across
organizations and returns only totals.

When an engineer's availability goes down, `fitWeeks` in `room_fitting.go`
takes blocks out of each week it went down in: the engineer's own blocks by
`staffed_at` (`pickToFree`), then blocks nobody's on by `scheduled_at`
(`pickToFit`). Whether those fit is a maximum flow from each client's blocks to
what the engineers on its teams have left, so a client with two teams isn't
counted in full against each. It covers only the clients linked to the
engineer's team through shared clients. `api capacity fit-weeks` runs the same
over every engineer and client, for weeks overbooked some other way.

**Locking.** Everything that changes a block reads it `FOR UPDATE` first,
including settling an invoice. Scheduling and claiming also take the same
advisory lock on the week before checking its room. The order is always row
lock first, then week lock. Fitting locks every block booked in the weeks it
covers, then the weeks, then lists again, so it keeps the row-then-week order
and still sees blocks scheduled in between. Block numbers come from a counter
on the organization's row, which that row's lock serializes.

**Fitting and scheduling disagree at the edges.**

- Fitting only unschedules blocks nobody's on, and only one whose removal
  makes the shortfall smaller. Blocks whose engineer is on no team count only
  against that engineer. What's still short after that is left, which a
  reduction then refuses.
- Scheduling still checks a client's room by `clientRoom`, which counts
  another client's open blocks in full, so it can refuse a week fitting would
  call room enough.
- The claim preview (`ClaimPreview`) takes no locks, and asks whether one
  engineer alone could take each other block, not whether the combined room
  covers it as scheduling does. So it can warn of a block
  `GET /v1/capacity-weeks` counts as fitting, and a claim made just after can
  strand a block it didn't name.

**Moving and unscheduling.** Moving a block takes any engineer off it, without
working out whether they fit the new week. Unscheduling one does too, and
takes no week lock, as freeing room can't overbook it. `scheduled_at` and
`staffed_at` are set by `Capacity.SetWeek` and `SetEngineer`, not the
repository, and anything writing a block's week or engineer goes through them,
or the latest-first order is wrong. Blocks booked before the column was added
took `updated_at` as their guess.

**Starting and fulfilling.** `Start` is gated by `capacity:manage`, so a lead
or admin who can manage a block can start it too, while `Fulfill` checks that
the caller is the block's engineer and no permission does. `Start` answers
forbidden, not not found, to someone who can read the block but not manage it,
and refuses before `WeekStart`, Monday in UTC. A fulfilled block can have no
`fulfilled_at`: one fulfilled before review existed has none. Migration 00087
dropped `capacity_review_events` and can't be undone, so code from before it
can't run against a database past it. Going back means restoring reviews from
a backup.

**Focuses.** The repository fills `Capacity.Focus` on every read of blocks, a
get or a list, with one more query, so anything reading blocks pays for it.
The rest of focuses is in [focuses](focuses.md).

**Purchases.** A purchase carries on if the caller goes away, so closing the
page can't leave a charge unrecorded. What the charge does is in the
[billing doc](billing.md). `Idempotency-Key` is stored on the invoice and sent
to the provider on each step. A repeat answers with what was bought, records
what was charged but not recorded, or is a `409` if the first is under way,
differs, or was voided. The portal keeps the key while the outcome is unknown,
and makes a new one when the choices change.

**Admins and claiming.** A caller acting in no organization, such as an admin,
sees every engineer's availability and every booking. That's what the admin's
overbooked-weeks note reads, so it only catches Exalynt-wide overbooking. Any
platform role other than Administrator needs `capacity:claim` granted at team
scope on the Roles page. Administrator holds `capacity:claim` at team scope,
the only scope it offers, so an admin claims only for clients their team
supports.
