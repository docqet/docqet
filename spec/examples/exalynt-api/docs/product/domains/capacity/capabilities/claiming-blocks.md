---
id: claiming-blocks
name: Claiming blocks
description: >-
  Engineers see their weeks on My Schedule beside what their team's clients
  have scheduled that nobody's on, and claim the blocks that fit their
  availability, or unclaim one until its week starts.
stability: beta
personas: [persona:exalynt-engineer-1, persona:exalynt-engineer-2]
rules:
  - rule:listing-an-engineers-blocks
  - rule:claiming-staffs-the-block-directly
  - rule:claiming-requires-eligibility
  - rule:claims-must-fit-availability
  - rule:unclaiming-before-the-week-starts
  - rule:warned-before-stranding-another-block
  - rule:new-blocks-start-unstaffed
  - rule:exalynt-staff-assign-engineers
  - rule:only-capacity-managers-assign-engineers
  - rule:taking-an-engineer-off-a-block
  - rule:one-engineer-per-block
  - rule:assignment-requires-eligibility
  - rule:assignment-must-fit-availability
  - rule:engineers-are-never-overbooked
  - rule:admins-resolve-cross-team-conflicts
  - rule:no-claiming-an-assigned-block
  - rule:leaving-a-clients-teams-releases-its-upcoming-blocks
  - rule:late-claims-during-the-preferred-week
  - rule:lapsed-blocks-must-be-moved-first
  - rule:in-progress-blocks-cant-be-moved
concepts:
  - concept:capacity-block
  - concept:shared-queue
  - concept:eligible-engineer
  - concept:preferred-week
  - concept:effective-availability
  - concept:team
gaps:
  - id: no-letting-go-once-started
    name: Can't let go once the week starts
    impact: inconvenient
    description: >-
      Once a block's week has started, an engineer can't let go of it. They
      ask an admin, who takes them off it.
    when: An engineer needs to let go of a block whose week has started.
  - id: no-claim-notifications
    name: No notice of claims or unclaims
    impact: inconvenient
    description: Nobody is told when a block is claimed or unclaimed.
  - id: taken-off-untold
    name: Engineers not told when taken off
    impact: inconvenient
    description: >-
      An engineer isn't told when a client's move or unschedule takes them off
      a block, so a client can take an engineer off by moving a block away and
      back. My Schedule shows it the next time it's read.
    when: A client moves or unschedules a claimed block.
  - id: stranded-block-client-untold
    name: Clients not told of stranded blocks
    impact: inconvenient
    description: >-
      When a claim leaves another block with nobody who can take it, that
      block's client isn't told, and it surfaces as a missed week an admin
      rebooks.
    when: A claim leaves another block with nobody who can take it.
  - id: blocks-read-once
    name: Others' claims show only on reading again
    impact: inconvenient
    description: >-
      An engineer's blocks and their clients' blocks are read once on opening,
      so someone else's claim shows only on reading again, or when claiming
      the block is refused.
  - id: about-a-year-ahead
    name: Blocks beyond about a year not shown
    impact: inconvenient
    description: >-
      An engineer's weeks go about a year ahead, from the start of this month.
      A block scheduled further out isn't shown.
    when: A client schedules a block more than about a year ahead.
  - id: clicking-unclaims
    name: Clicking a block unclaims it
    impact: inconvenient
    description: >-
      Before a block's week starts, clicking it on My Schedule unclaims it, so
      an engineer can't open its page from there until the week starts.
  - id: no-teammates-weeks
    name: Teammates' weeks not visible
    impact: inconvenient
    description: >-
      An engineer can't see their teammates' weeks: who's on what, or how much
      room each has. A block's own page says who's on it.
  - id: unscheduled-blocks-unseen
    name: Unscheduled blocks not visible
    impact: inconvenient
    description: >-
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
