---
name: Earnings
description: >-
  What engineers, leads, and partnerships earn on fulfilled blocks, recorded
  as each is fulfilled.
capabilities: [earnings, partner-earnings, partner-clients, partner-home]
gaps:
  - id: person-earnings-not-paged
    outcome: efficiency/beta/bounded
    summary: >-
      A person's earnings aren't paged: they load whole, and what's upcoming
      is worked out afresh on every read.
---

An earning has exactly one payee, `user_id` or `partnership_id`, which
`earnings_one_payee` enforces. A referral earning's `UserID` is `uuid.Nil` in
the model, so earnings are grouped or filtered by payee type, never by
`UserID` alone.

**Which partnership a block earns for** is `capacities.partnership_id`, set by
`CapacityService.Create` from the attribution at purchase and never updated.
It isn't worked out from `partnership_clients`, which only says where the
client is attributed now. Migration 00094 filled it in for blocks bought
before it, but only those bought since their client was attributed.

**The earning window** has no column of its own: it opens at the earliest of
the client's blocks with that `partnership_id`. Deleting a block, as voiding
its invoice does, can move it.

**A partnership's earnings** are read on the platform connection once
`ReachPartnership` has let the caller in, as its clients' blocks and names are
theirs, and `api_partner` reaches no organization's rows. They're paged a block
at a time (`PagePartnership`): each of its blocks but pending ones, with its
referral earning, or with none for the service to work out what it would pay.
A block bought after its client's window closed pays nothing and is dropped
after the query, so a page can be short. The terms are read once and the
windows once a page, rather than calling `referralShare` per block.

`PagePartnership` doesn't read the block's engineer, and the resource never
shows one on a referral earning: partners aren't told who worked a block.

The `Earning` resource, `EarningRepository` and
`GET /partnerships/{id}/earnings` are shared with partner earnings, which is
Beta, so they hold to Beta even though a person's earnings is Alpha.
