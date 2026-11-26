---
docqet: capability
id: estimates
domain: capacity
name: Estimates
description: >-
  Exalynt prepares estimates of what a project might take, and clients and
  prospects read them to see what each focus and the project would cost and
  take on every block type.
stability: beta
personas:
  - persona:client-admin-founder
  - persona:client-admin-operations
  - persona:client-member
  - persona:exalynt-engineer-1
  - persona:exalynt-engineer-2
  - persona:exalynt-admin
initiatives: [initiative:mvp]
rules:
  - rule:focus-sizes-and-block-prices
  - rule:each-focus-has-its-own-pace
  - rule:discounts-apply-to-the-whole-project
  - rule:estimates-keep-their-original-prices
  - rule:estimates-record-their-author
  - rule:replacing-replaces-everything
  - rule:clients-read-only-their-own-estimates
  - rule:only-exalynt-writes-estimates
  - rule:engineers-work-on-supported-clients-estimates
  - rule:prospects-see-estimates-once-attached
  - rule:deleting-an-estimate-is-permanent
  - rule:estimates-are-for-organizations-or-prospects
  - rule:a-focus-belongs-to-one-estimate
concepts: [concept:estimate, concept:capacity-block, concept:capacity-unit]
gaps:
  - id: pdf-leaves-out-planned-pace
    name: PDF leaves out each focus's planned pace
    impact: inconvenient
    likelihood: possible
    reach: few
    description: >-
      The PDF offers the project on each pace as an option, with every focus
      on it, and leaves out the pace each focus was planned on.
tradeoffs:
  - id: last-save-wins
    name: Last save wins, without a warning
    description: >-
      When two people edit one estimate at once, the later save replaces the
      earlier one, without a warning.
    drawback: >-
      The earlier person's changes are lost without them knowing. That takes
      two people editing one estimate at once.
  - id: deleting-is-permanent
    name: Deleting an estimate is permanent
    affects:
      - outcome:usability/beta/recover
    description: Deleting an estimate is permanent.
    drawback: >-
      Getting one back means restoring a backup. That matters when someone
      deletes an estimate by mistake.
decisions:
  - topic: Asking for estimates and engineers
    question: >-
      Is asking for an estimate, or for a particular engineer, a flow of
      its own? _At MVP:_ no. Clients ask Exalynt outside the product.
---

## Includes

- Clients see the pace each focus of an estimate is planned at, and any
  discounts off it.
- Clients download an estimate as a PDF.
- Engineers prepare and update estimates: focuses, such as new features or
  improvements to an existing system, each sized, planned at a pace and still
  priced on every block type, with an optional description and notes, and
  discounts off the whole project.
- Admins prepare and update estimates for any client organization, or for a
  prospect that isn't a client yet, with discounts off the whole project.
- Admins send a prospect their estimate as a PDF, and attach it to their
  organization once they sign up.
