---
name: Claiming blocks
summary: >-
  Engineers see their weeks on My Schedule beside what their team's clients
  have scheduled that nobody's on, and claim the blocks that fit their
  availability, or unclaim one until its week starts.
stability: beta
personas: [exalynt-engineer-1, exalynt-engineer-2]
rules:
  - staffing/listing-an-engineers-blocks
  - staffing/claiming-staffs-the-block-directly
  - staffing/claiming-requires-eligibility
  - staffing/claims-must-fit-availability
  - staffing/unclaiming-before-the-week-starts
  - staffing/warned-before-stranding-another-block
  - staffing/new-blocks-start-unstaffed
  - staffing/exalynt-staff-assign-engineers
  - staffing/only-capacity-managers-assign-engineers
  - staffing/taking-an-engineer-off-a-block
  - staffing/one-engineer-per-block
  - staffing/assignment-requires-eligibility
  - staffing/assignment-must-fit-availability
  - staffing/engineers-are-never-overbooked
  - staffing/admins-resolve-cross-team-conflicts
  - staffing/no-claiming-an-assigned-block
  - staffing/leaving-a-clients-teams-releases-its-upcoming-blocks
  - staffing/late-claims-during-the-preferred-week
  - staffing/lapsed-blocks-must-be-moved-first
  - staffing/in-progress-blocks-cant-be-moved
concepts:
  - capacity-block
  - shared-queue
  - eligible-engineer
  - preferred-week
  - effective-availability
  - team
gaps:
  - id: no-letting-go-once-started
    text: >-
      Once a block's week has started, an engineer can't let go of it. They
      ask an admin, who takes them off it.
  - id: no-claim-notifications
    text: Nobody is told when a block is claimed or unclaimed.
  - id: taken-off-untold
    text: >-
      An engineer isn't told when a client's move or unschedule takes them off
      a block, so a client can take an engineer off by moving a block away and
      back. My Schedule shows it the next time it's read.
  - id: stranded-block-client-untold
    text: >-
      When a claim leaves another block with nobody who can take it, that
      block's client isn't told, and it surfaces as a missed week an admin
      rebooks.
  - id: blocks-read-once
    text: >-
      An engineer's blocks and their clients' blocks are read once on opening,
      so someone else's claim shows only on reading again, or when claiming
      the block is refused.
  - id: about-a-year-ahead
    text: >-
      An engineer's weeks go about a year ahead, from the start of this month.
      A block scheduled further out isn't shown.
  - id: clicking-unclaims
    text: >-
      Before a block's week starts, clicking it on My Schedule unclaims it, so
      an engineer can't open its page from there until the week starts.
  - id: no-teammates-weeks
    text: >-
      An engineer can't see their teammates' weeks: who's on what, or how much
      room each has. A block's own page says who's on it.
  - id: unscheduled-blocks-unseen
    text: >-
      An engineer doesn't see a block a client hasn't scheduled yet, and can't
      ask the client to schedule it from the product.
decisions:
  - topic: Unclaiming window
    question: >-
      An engineer can unclaim until a block's week starts, even hours
      before, leaving it with nobody as the week begins. Keep that, or
      stop unclaiming some days before the week starts?
---

## Includes

- Engineers see their upcoming and current blocks, for any client.
- Engineers see their weeks a month at a time, each with their availability and
  the blocks they're on. What doesn't fit their availability shows too, greyed,
  with why.
- Engineers see what each block would earn them once it's fulfilled, by the
  Engineer Share in their agreement and the block's payout basis.
- Engineers see what's expected of them that week before claiming a block.
- Engineers claim a block late, after its preferred week has started.
- Before claiming, engineers see any other block that week the claim would leave
  with nobody who can take it, and can claim anyway.
- Engineers unclaim a block whether they claimed it or an admin put them on it.
  It goes back to the client's shared queue.
