---
docqet: capability
id: constraints
name: For each constraint it keeps to
description: >-
  Everyone sees what the software must keep to that nobody on the team
  chose, such as laws, contracts and facts, the problems each bounds,
  everything that respects each, and how far along and how ready the
  capabilities they bear on are, with the constraints nothing respects yet,
  and those a problem's solution doesn't say it keeps to, shown as such.
stability: prototype
within: feature:where-it-stands
solves: [problem:unclear-what-to-rely-on, problem:intent-in-peoples-heads]
follows:
  - rule:drafts-claim-nothing
uses: [concept:constraint, concept:readiness, concept:maturity]
decisions:
  - topic: Unaddressed constraints in readiness
    question: >-
      A problem shows each constraint nothing solving it says it keeps to,
      but that doesn't change its readiness or show among its improvements.
      Should an unaddressed constraint lower the problem's readiness, as a
      gap would, and show as an improvement, respecting it?
    impact: inconvenient
    likelihood: expected
    reach: some
---
