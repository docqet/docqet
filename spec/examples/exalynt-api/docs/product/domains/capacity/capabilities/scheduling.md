---
id: scheduling
name: Scheduling
description: >-
  Clients schedule each block into a week that has room, against what the
  engineers on their organization's teams offer, and can move it to another
  week, or take it back out, until that week starts.
stability: beta
personas:
  - persona:client-admin-founder
  - persona:client-admin-operations
  - persona:client-member
  - persona:exalynt-admin
initiatives: [initiative:mvp]
rules:
  - rule:scheduling-comes-before-work
  - rule:unscheduled-blocks-reserve-no-room
  - rule:room-comes-from-assigned-teams
  - rule:clients-of-a-team-share-room
  - rule:no-scheduling-into-a-full-week
  - rule:clients-move-blocks-until-the-week-starts
  - rule:clients-unschedule-blocks-until-the-week-starts
  - rule:last-in-first-out-with-an-exact-fit-first
  - rule:only-what-cant-fit-comes-out
  - rule:weeks-are-never-overbooked
  - rule:exalynt-can-move-lapsed-blocks
  - rule:starting-means-work-has-begun
  - rule:the-preferred-week-is-a-target
concepts:
  - concept:capacity-block
  - concept:preferred-week
  - concept:shared-queue
  - concept:eligible-engineer
  - concept:team
gaps:
  - id: no-moving-in-the-admin-app
    name: No moving blocks in the admin app
    impact: inconvenient
    likelihood: possible
    reach: few
    description: An admin has no way to move a block in the admin app yet.
  - id: moving-takes-the-engineer-off
    name: Moving a block drops its engineer
    impact: inconvenient
    likelihood: expected
    reach: some
    description: >-
      Moving a block always takes its engineer off. Whoever moves it, it's to
      keep its engineer if they can fit it in the new week, and only otherwise
      go back to the shared queue for that week.
  - id: room-counts-the-whole-team
    name: Room counts the whole team's availability
    impact: inconvenient
    likelihood: unlikely
    reach: few
    description: >-
      A week has room when the team's combined availability covers a block,
      though capacity a client buys is never split across engineers, so it's
      to need one eligible engineer who can fit the whole block alone. An
      admin sorts out a block no single engineer can fit. That shows when no
      single eligible engineer can fit a block into a week the team has room
      in.
  - id: team-changes-can-overbook
    name: Team changes can overbook a week
    rule: rule:weeks-are-never-overbooked
    impact: inconvenient
    likelihood: unlikely
    reach: few
    description: >-
      Team changes aren't checked against bookings, so a week can end up
      overbooked after it was booked. The admin's overview flags it only
      across all of Exalynt, not per team, and nothing else happens. An
      engineer offering less takes blocks out instead.
  - id: unscheduled-by-reduction-untold
    name: Clients not told of unscheduled blocks
    impact: inconvenient
    likelihood: possible
    reach: few
    description: >-
      A client isn't told when an engineer's reduction unschedules one of
      their blocks. It's back among the blocks they have to schedule.
decisions:
  - topic: Rescheduling window
    question: >-
      Until when can a client move or take back a scheduled block? Any
      time before its week starts, or only up to some point before it?
  - topic: Unscheduled capacity
    question: >-
      Do clients get reminders to schedule? Can admins or leads schedule
      on a client's behalf? What happens to capacity that's never
      scheduled?
  - topic: Preferred-week moves
    question: >-
      Is a reason shown to the client? Should moving the week of a block
      that has an assigned engineer require someone to acknowledge
      coverage?
---

## Includes

- Clients see each block's preferred week, its assigned engineer if there is
  one, and that engineer's team.
- The software takes an engineer off a block the client takes back out of its
  week.
- Admins move a block's preferred week.
