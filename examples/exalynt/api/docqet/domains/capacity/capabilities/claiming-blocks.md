---
docqet: capability
id: claiming-blocks
domain: capacity
name: Claiming blocks
description: >-
  Engineers see their weeks on My Schedule beside what their team's clients
  have scheduled that nobody's on, and claim the blocks that fit their
  availability, or unclaim one until its week starts.
stability: beta
solves: [problem:taking-on-work-blind]
initiatives: [initiative:mvp]
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
  - id: taken-off-untold
    name: Engineers not told when taken off
    impact: inconvenient
    likelihood: possible
    reach: few
    description: >-
      An engineer isn't told when a client's move or unschedule takes them off
      a block, so a client can take an engineer off by moving a block away and
      back. My Schedule shows it the next time it's read.
  - id: stranded-block-client-untold
    name: Clients not told of stranded blocks
    impact: inconvenient
    likelihood: unlikely
    reach: few
    description: >-
      When a claim leaves another block with nobody who can take it, that
      block's client isn't told, and it surfaces as a missed week an admin
      rebooks.
  - id: clicking-unclaims
    name: Clicking a block unclaims it
    impact: inconvenient
    likelihood: certain
    reach: some
    description: >-
      Before a block's week starts, clicking it on My Schedule unclaims it, so
      an engineer can't open its page from there until the week starts.
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
