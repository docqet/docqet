---
name: Scheduling
description: >-
  Clients schedule each block into a week that has room, against what the
  engineers on their organization's teams offer, and can move it to another
  week, or take it back out, until that week starts.
stability: beta
personas:
  - client-admin-founder
  - client-admin-operations
  - client-member
  - exalynt-admin
rules:
  - scheduling/scheduling-comes-before-work
  - scheduling/unscheduled-blocks-reserve-no-room
  - scheduling/room-comes-from-assigned-teams
  - scheduling/clients-of-a-team-share-room
  - scheduling/no-scheduling-into-a-full-week
  - scheduling/clients-move-blocks-until-the-week-starts
  - scheduling/clients-unschedule-blocks-until-the-week-starts
  - scheduling/last-in-first-out-with-an-exact-fit-first
  - scheduling/only-what-cant-fit-comes-out
  - scheduling/weeks-are-never-overbooked
  - scheduling/exalynt-can-move-lapsed-blocks
  - scheduling/starting-means-work-has-begun
  - scheduling/the-preferred-week-is-a-target
concepts:
  - capacity-block
  - preferred-week
  - shared-queue
  - eligible-engineer
  - team
gaps:
  - id: clients-cant-spot-overbooking
    name: Clients can't spot overbooked or unassigned blocks
    impact: inconvenient
    description: >-
      Clients can't spot blocks that are overbooked, or scheduled but not
      assigned to an engineer. They see whether a scheduled block has an
      engineer yet, and an admin resolves overbooking.
  - id: no-asking-for-an-engineer
    name: Clients can't ask for an engineer
    impact: inconvenient
    description: >-
      Clients can't ask to keep working with a particular engineer, knowing no
      engineer is guaranteed in a given week. They tell Exalynt outside the
      product.
  - id: leads-cant-move-weeks
    name: Leads can't move preferred weeks
    impact: inconvenient
    description: >-
      A lead of a team assigned to the organization can't move a block's
      preferred week without the client's approval. Only an admin or the
      client moves a preferred week.
  - id: moves-told-outside-the-product
    name: Moves told outside the product
    impact: inconvenient
    description: >-
      A client isn't told in the product when Exalynt moves a block's
      preferred week, and can't pick another available week instead. They're
      always to be told, never silently rescheduled, so the admin who moves a
      block tells them outside the product, and nobody is emailed.
  - id: no-moving-in-the-admin-app
    name: No moving blocks in the admin app
    impact: inconvenient
    description: An admin has no way to move a block in the admin app yet.
  - id: moving-takes-the-engineer-off
    name: Moving a block drops its engineer
    impact: inconvenient
    description: >-
      Moving a block always takes its engineer off. Whoever moves it, it's to
      keep its engineer if they can fit it in the new week, and only otherwise
      go back to the shared queue for that week.
    when: A block with an engineer is moved to another week.
  - id: room-counts-the-whole-team
    name: Room counts the whole team's availability
    impact: inconvenient
    description: >-
      A week has room when the team's combined availability covers a block,
      though capacity a client buys is never split across engineers, so it's
      to need one eligible engineer who can fit the whole block alone. An
      admin sorts out a block no single engineer can fit.
    when: >-
      No single eligible engineer can fit a block into a week the team has room
      in.
  - id: shared-team-room-understated
    name: Room understated for shared teams
    impact: inconvenient
    description: >-
      For a client with several teams, an unstaffed block of a client sharing
      just one of them is counted in full, which understates its room.
    when: A client with several teams shares one of them with another client.
  - id: team-changes-can-overbook
    name: Team changes can overbook a week
    rule: scheduling/weeks-are-never-overbooked
    impact: inconvenient
    description: >-
      Team changes aren't checked against bookings, so a week can end up
      overbooked after it was booked. The admin's overview flags it only
      across all of Exalynt, not per team, and nothing else happens. An
      engineer offering less takes blocks out instead.
    when: A team change takes away availability a week was booked against.
  - id: unscheduled-by-reduction-untold
    name: Clients not told of unscheduled blocks
    impact: inconvenient
    description: >-
      A client isn't told when an engineer's reduction unschedules one of
      their blocks. It's back among the blocks they have to schedule.
    when: An engineer's reduction unschedules a client's block.
  - id: far-weeks-bookable-outside-portal
    name: Far weeks bookable outside the portal
    impact: inconvenient
    description: >-
      A far future week can be booked outside the portal, which offers about
      a year.
    when: Someone books a week more than about a year ahead outside the portal.
  - id: weeks-are-utc
    name: Weeks roll over early in the Americas
    impact: inconvenient
    description: >-
      Weeks are UTC, so they roll over a few hours early on Sunday evening in
      the Americas.
  - id: loads-every-block
    name: Every block loaded to show capacity
    outcome: efficiency/beta/bounded
    impact: inconvenient
    description: Seeing capacity and the schedule loads every block.
    when: Blocks build up over time.
  - id: room-read-once
    name: A week's room read once
    impact: inconvenient
    description: >-
      A week's room is read once, so another client taking it shows only when
      scheduling into that week is refused.
    when: Another client takes a week's room while the page is open.
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
