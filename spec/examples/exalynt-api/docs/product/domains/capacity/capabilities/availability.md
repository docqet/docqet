---
name: Availability
description: >-
  Engineers set how much of each week they offer, in capacity units, and that
  adds up per team to decide which weeks have room, though clients never see
  it directly.
stability: beta
personas:
  - exalynt-engineer-1
  - exalynt-engineer-2
  - exalynt-team-lead
  - exalynt-admin
rules:
  - availability/how-a-weeks-availability-is-decided
  - availability/reductions-need-no-approval
  - availability/only-its-owner-sets-availability
  - availability/admins-set-their-own-availability
  - availability/who-sees-an-engineers-availability
  - availability/one-baseline-per-engineer
  - availability/adjustments-never-overlap
  - availability/removing-an-adjustment-restores-the-baseline
  - availability/availability-comes-in-quarter-weeks
  - availability/reductions-make-room-by-taking-blocks-out
  - availability/reductions-never-touch-started-work
  - availability/past-weeks-cant-change
concepts: [effective-availability, capacity-unit, capacity-block]
gaps:
  - id: no-spotting-overbooked-engineers
    impact: inconvenient
    summary: >-
      Nobody can spot overbooked engineers, or shortfalls caused by reduced
      availability, including scheduled blocks no one has claimed yet. Leads
      see their team's availability and assignments, and admins spot
      overbooked and unassigned blocks.
  - id: no-spotting-overdue-blocks
    impact: inconvenient
    summary: >-
      Nobody can spot overdue blocks, assigned but still not fulfilled after
      their week ended. Leads see their team's availability and assignments,
      and admins spot overbooked and unassigned blocks.
  - id: reductions-into-started-work-refused
    impact: inconvenient
    summary: >-
      A reduction only blocks under way would fit is refused, and the engineer
      asks an admin to sort it out.
    when: An engineer reduces a week that already has work under way.
  - id: unscheduled-by-reduction-untold
    impact: inconvenient
    summary: >-
      A client isn't told when a reduction unschedules one of their blocks.
      It's back among the blocks they have to schedule.
    when: A reduction takes a scheduled block out of a week.
  - id: browser-week-not-utc
    impact: inconvenient
    summary: >-
      Weeks are UTC, and the console's "this week" is the browser's. Around
      midnight on a Sunday, a change the console offers can be refused as
      past.
    when: Someone changes availability around midnight on a Sunday.
  - id: far-weeks-adjustable-outside-console
    impact: negligible
    summary: >-
      A far future week can be adjusted outside the console, as with a block.
    when: Someone adjusts availability by calling the API directly.
  - id: team-changes-can-overbook
    impact: inconvenient
    summary: >-
      A team change can still overbook a week, and that's only flagged across
      all of Exalynt.
    when: An engineer with claimed blocks moves to another team.
  - id: relies-on-staffing
    outcome: security/alpha/stable-dependencies
    impact: blocking
    summary: >-
      Seeing availability next to assignments, and a lead seeing their team's,
      depend on Staffing, which is only Alpha.
    when: Staffing makes a breaking change.
  - id: screen-readers-unreviewed
    outcome: usability/beta/everyone
    impact: blocking
    summary: Real screen readers haven't been reviewed.
    when: Someone sets availability with a screen reader.
  - id: deployment-and-team-access-unreviewed
    impact: damaging
    summary: >-
      The deployment setup, and how team-wide access resolves beyond the
      checks on leads, haven't been reviewed.
    when: >-
      Team-wide access resolves wider than intended, letting someone see or
      set availability that isn't theirs.
---

## Includes

- Engineers set a recurring weekly baseline.
- Engineers make a one-off adjustment for a particular week.
- Engineers see their effective availability by week, next to what's assigned or
  scheduled against it, across every client their team supports.
- Engineers see their teammates' availability.
- Engineers reduce their availability. Where that leaves less than a week's
  blocks need, they see which blocks it would take out, and confirm or keep the
  week as it was.
- Engineers change a run of weeks, or the baseline, in one go.
- Team leads see the effective availability, upcoming and current assignments,
  and fulfillment status of their team's engineers.
- Admins set their own weekly baseline and adjust particular weeks, as engineers
  do.
