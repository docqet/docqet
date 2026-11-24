---
id: earnings
name: Earnings
description: >-
  People see what they earn on each block, from when it's assigned to when
  it's fulfilled.
stability: alpha
personas: [persona:exalynt-engineer-1, persona:exalynt-engineer-2, persona:exalynt-team-lead]
rules:
  - rule:shares-earned-at-fulfillment
  - rule:payout-basis-per-capacity-unit
  - rule:engineer-earns-the-engineer-share
  - rule:team-leads-earn-team-lead-share
  - rule:available-teammates-earn-team-support-share
  - rule:unlisted-shares-earn-nothing
  - rule:shares-dont-reduce-each-other
  - rule:partnership-share-earned-at-fulfillment
  - rule:partnerships-earn-under-their-agreement-in-effect
  - rule:coupons-never-change-shares
  - rule:unclaimed-shares-stay-with-exalynt
  - rule:when-basis-and-percentages-are-fixed
  - rule:each-share-rounds-on-its-own
  - rule:refunds-after-fulfillment-change-nothing
  - rule:reassignment-before-fulfillment-earns-nothing
  - rule:when-team-support-earners-are-fixed
  - rule:when-the-team-lead-beneficiary-is-fixed
  - rule:no-lead-means-no-lead-share
  - rule:one-team-lead-share-per-block
  - rule:invalid-payout-account-delays-lead-share
  - rule:partner-status-leaves-engineers-unchanged
  - rule:earnings-belong-to-the-partnership
  - rule:partnership-terms-set-at-invitation
  - rule:partnership-share-of-payout-basis
  - rule:engineering-capacity-is-the-only-basis
  - rule:earning-window-opens-at-first-purchase
  - rule:earning-windows-never-reset-or-pause
  - rule:unfulfilled-capacity-earns-partnerships-nothing
  - rule:attribution-at-purchase-decides-the-partnership
  - rule:partnerships-earn-without-a-payout-account
  - rule:manager-controls-the-partnerships-payout-account
  - rule:exalynt-bears-partnership-earnings
  - rule:partners-see-only-their-partnerships-earnings
concepts:
  - concept:payout-share
  - concept:capacity-payout-basis
  - concept:payout
  - concept:agreement@agreements
  - concept:capacity-block@capacity
gaps:
  - id: upcoming-shares-can-change
    name: Upcoming lead and support shares can change
    rule: rule:when-basis-and-percentages-are-fixed
    impact: inconvenient
    likelihood: possible
    reach: some
    description: >-
      Upcoming lead and support earnings follow today's team and
      availability, so they can change before the block is fulfilled. Who
      earns them is fixed when it's fulfilled, and the basis and percentages
      aren't fixed when the block is assigned.
  - id: expected-pay-not-on-the-block
    name: Expected pay not shown on the block
    impact: inconvenient
    likelihood: possible
    reach: some
    description: >-
      What an assigned block will pay shows only among a person's earnings,
      not on the block.
  - id: earnings-go-with-a-deleted-user
    name: Earnings lost when a user is deleted
    impact: damaging
    likelihood: unlikely
    reach: few
    description: >-
      Someone's earnings go if their user is deleted.
---

## Includes

- Engineers see earnings from their blocks, with each block's client, amount,
  whether it's earned yet, payout status, and payment history.
- Engineers see the team support they've earned, and whose block each share came
  from.
- Team leads see the blocks their team's engineers have fulfilled, with each
  block's engineer, client, and payout status.
- Team leads see their team-lead earnings separately from their own engineering
  earnings, even when both go to the same payout account.
- Team leads see which fulfilled blocks created their share.
