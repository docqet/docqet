---
id: staffing
name: Staffing
description: >-
  Each scheduled block gets one engineer: an eligible engineer claims it from
  the client's shared queue, as [Claiming blocks](claiming-blocks.md) covers,
  or an admin assigns it.
stability: alpha
personas: [persona:exalynt-admin]
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
  - id: assignment-eligibility-unchecked
    name: Assignments not checked for eligibility
    rule: rule:assignment-requires-eligibility
    impact: inconvenient
    likelihood: unlikely
    reach: few
    description: >-
      An admin putting an engineer on a block isn't checked for that
      engineer's eligibility.
    when: >-
      An admin puts an engineer on a block of a client their team doesn't
      support.
  - id: assignment-availability-unchecked
    name: Assignments not checked for availability
    rule: rule:assignment-must-fit-availability
    impact: inconvenient
    likelihood: unlikely
    reach: few
    description: >-
      An admin putting an engineer on a block isn't checked for that
      engineer's availability.
    when: >-
      An admin puts an engineer on a block they don't have the availability
      for.
decisions:
  - topic: Cross-team handoff
    question: >-
      Do leads confirm a handoff in the product, or coordinate outside the
      product and have the current engineer release the block?
  - topic: Urgent blocks
    question: >-
      Are there reminders before the preferred week starts, and who owns
      escalation once a block is urgent? Which channels carry release and
      urgent alerts?
---

## Includes

- Admins see capacity purchases, and upcoming and current assignments, across
  all clients and teams.
- Admins spot overbooked blocks, and blocks that are scheduled but unassigned.
- Admins reassign or unassign a scheduled block.
