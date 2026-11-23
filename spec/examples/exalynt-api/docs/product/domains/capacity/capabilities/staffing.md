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
  - id: placeholder-staffing-view
    name: Staffing view runs on placeholder data
    impact: inconvenient
    description: >-
      The admin's week-by-week view of every team's capacity runs on
      placeholder data, with its own placeholder teams, so its preference for
      a client's teams isn't real yet. Assigning there changes nothing, and an
      admin has no real way to staff a block in the admin app yet.
  - id: no-releasing
    name: Engineers can't release blocks
    impact: inconvenient
    description: >-
      An engineer can't release a block assigned to them that they can't
      fulfill: they ask an admin, who reassigns or unassigns it. Releasing is
      to need no approval, their lead's included, and to send the block
      straight back to the client's shared queue with eligible leads and
      admins notified, without moving its preferred week, cancelling it, or
      refunding it. It's to be separate from reducing availability, and to
      work on a block in progress too, which goes back to the queue still in
      progress for whoever claims it next to carry on, and can be claimed even
      after its week ends, since that week can't move.
  - id: no-urgent-or-overdue-blocks
    name: Urgent and overdue blocks not flagged
    impact: inconvenient
    description: >-
      Nobody can spot urgent or overdue blocks. A block still unclaimed when
      its preferred week starts isn't flagged as urgent to team leads and
      admins, or kept urgent once that week ends: admins spot overbooked
      blocks and scheduled but unassigned blocks, and watch the unassigned
      ones by week.
  - id: no-team-lead-staffing
    name: Team leads can't staff blocks
    impact: inconvenient
    description: >-
      Team leads have no part in staffing beyond claiming blocks like any
      engineer, and an admin assigns, reassigns, unassigns and moves blocks.
      Leads can't yet see their supported clients' shared queues with urgent
      blocks flagged, assign a block from one to an eligible engineer on their
      own team who has the availability for it that week, reassign a block
      between their engineers, coordinate a cross-team transfer with another
      lead or ask an admin to make it, or be alerted when an engineer releases
      a supported client's block, to arrange coverage.
  - id: leads-cant-move-weeks
    name: Leads can't move preferred weeks
    impact: inconvenient
    description: >-
      Team leads can't move the preferred week of a block bought by a client
      their team supports. They're to be able to until the block is in
      progress, without the client's approval: the client is told and can
      choose another available week, and the commitment to fulfill or refund
      the block stands.
  - id: moving-takes-the-engineer-off
    name: Moving a block drops its engineer
    impact: inconvenient
    description: >-
      Moving a block always takes its engineer off. It's to keep its engineer
      if they can fit it in the new week, and only otherwise go back to the
      client's shared queue for that week, with the engineer told.
    when: A block with an engineer is moved to another week.
  - id: overbooking-not-flagged-per-team
    name: Overbooking not flagged per team
    impact: inconvenient
    description: >-
      The admin's overview flags a week only when all of Exalynt's bookings
      exceed all of its availability, so one team's overbooked week can be
      hidden by another's spare time, or by engineers on no team. Nothing is
      done about a week a team change overbooks, and a block that can't be
      fitted surfaces as a missed week, which an admin rebooks.
    when: One team is overbooked in a week when another team has time to spare.
  - id: assignment-eligibility-unchecked
    name: Assignments not checked for eligibility
    rule: rule:assignment-requires-eligibility
    impact: damaging
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
    description: >-
      An admin putting an engineer on a block isn't checked for that
      engineer's availability.
    when: >-
      An admin puts an engineer on a block they don't have the availability
      for.
tradeoffs:
  - id: leads-manage-only-their-own-team
    name: Leads assign only their own team
    impact: inconvenient
    description: >-
      A lead manages assignments directly only for their own team's engineers,
      and can't take a block from another team's engineer or assign one to
      them.
    drawback: >-
      A cross-team transfer needs the other lead's coordination or an admin,
      or the current engineer releases the block so an engineer on the other
      team can claim it.
    when: A block needs to move to an engineer on another team.
  - id: no-lead-owns-a-queue
    name: No lead owns a shared queue
    impact: inconvenient
    description: >-
      No lead owns a client's shared queue. A queued block doesn't belong to a
      lead's team just because the lead can see it.
    drawback: >-
      No one lead answers for a queued block, so who escalates one that's
      urgent is still open.
    when: A queued block becomes urgent.
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
    gaps: [no-urgent-or-overdue-blocks]
---

## Includes

- Admins see capacity purchases, and upcoming and current assignments, across
  all clients and teams.
- Admins spot overbooked blocks, and blocks that are scheduled but unassigned.
- Admins reassign or unassign a scheduled block.
