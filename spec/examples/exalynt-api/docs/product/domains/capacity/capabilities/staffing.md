---
name: Staffing
description: >-
  Each scheduled block gets one engineer: an eligible engineer claims it from
  the client's shared queue, as [Claiming blocks](claiming-blocks.md) covers,
  or an admin assigns it.
stability: alpha
personas: [exalynt-admin]
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
  - id: placeholder-staffing-view
    summary: >-
      The admin's week-by-week view of every team's capacity runs on
      placeholder data, with its own placeholder teams, so its preference for
      a client's teams isn't real yet. Assigning there changes nothing, and an
      admin has no real way to staff a block in the admin app yet.
  - id: no-releasing
    summary: >-
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
    summary: >-
      Nobody can spot urgent or overdue blocks. A block still unclaimed when
      its preferred week starts isn't flagged as urgent to team leads and
      admins, or kept urgent once that week ends: admins spot overbooked
      blocks and scheduled but unassigned blocks, and watch the unassigned
      ones by week.
  - id: no-team-lead-staffing
    summary: >-
      Team leads have no part in staffing beyond claiming blocks like any
      engineer, and an admin assigns, reassigns, unassigns and moves blocks.
      Leads can't yet see their supported clients' shared queues with urgent
      blocks flagged, assign a block from one to an eligible engineer on their
      own team who has the availability for it that week, reassign a block
      between their engineers, coordinate a cross-team transfer with another
      lead or ask an admin to make it, or be alerted when an engineer releases
      a supported client's block, to arrange coverage.
  - id: leads-cant-move-weeks
    summary: >-
      Team leads can't move the preferred week of a block bought by a client
      their team supports. They're to be able to until the block is in
      progress, without the client's approval: the client is told and can
      choose another available week, and the commitment to fulfill or refund
      the block stands.
  - id: moving-takes-the-engineer-off
    summary: >-
      Moving a block always takes its engineer off. It's to keep its engineer
      if they can fit it in the new week, and only otherwise go back to the
      client's shared queue for that week, with the engineer told.
  - id: overbooking-not-flagged-per-team
    summary: >-
      The admin's overview flags a week only when all of Exalynt's bookings
      exceed all of its availability, so one team's overbooked week can be
      hidden by another's spare time, or by engineers on no team. Nothing is
      done about a week a team change overbooks, and a block that can't be
      fitted surfaces as a missed week, which an admin rebooks.
  - id: assignment-eligibility-unchecked
    rule: staffing/assignment-requires-eligibility
    summary: >-
      An admin putting an engineer on a block isn't checked for that
      engineer's eligibility.
  - id: assignment-availability-unchecked
    rule: staffing/assignment-must-fit-availability
    summary: >-
      An admin putting an engineer on a block isn't checked for that
      engineer's availability.
tradeoffs:
  - id: leads-manage-only-their-own-team
    summary: >-
      A lead manages assignments directly only for their own team's engineers,
      and can't take a block from another team's engineer or assign one to
      them.
    drawbacks:
      - >-
        A cross-team transfer needs the other lead's coordination or an admin,
        or the current engineer releases the block so an engineer on the other
        team can claim it.
  - id: no-lead-owns-a-queue
    summary: >-
      No lead owns a client's shared queue. A queued block doesn't belong to a
      lead's team just because the lead can see it.
    drawbacks:
      - >-
        No one lead answers for a queued block, so who escalates one that's
        urgent is still open.
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
