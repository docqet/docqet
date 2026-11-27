---
docqet: capability
id: availability
domain: capacity
name: Availability
description: >-
  Engineers set how much of each week they offer, in capacity units, and that
  adds up per team to decide which weeks have room, though clients never see
  it directly.
stability: beta
solves:
  - problem:engineers-overbooked
  - problem:team-trouble-seen-one-by-one
  - problem:exceptions-hide-in-routine
initiatives: [initiative:mvp]
rules:
  - rule:how-a-weeks-availability-is-decided
  - rule:reductions-need-no-approval
  - rule:only-its-owner-sets-availability
  - rule:admins-set-their-own-availability
  - rule:who-sees-an-engineers-availability
  - rule:one-baseline-per-engineer
  - rule:adjustments-never-overlap
  - rule:removing-an-adjustment-restores-the-baseline
  - rule:availability-comes-in-quarter-weeks
  - rule:reductions-make-room-by-taking-blocks-out
  - rule:reductions-never-touch-started-work
  - rule:past-weeks-cant-change
concepts: [concept:effective-availability, concept:capacity-unit, concept:capacity-block]
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
