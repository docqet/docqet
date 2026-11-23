---
name: Earnings
summary: >-
  People see what they earn on each block, from when it's assigned to when
  it's fulfilled.
stability: alpha
personas: [exalynt-engineer-1, exalynt-engineer-2, exalynt-team-lead]
rules:
  - earnings-and-payouts/shares-earned-at-fulfillment
  - earnings-and-payouts/payout-basis-per-capacity-unit
  - earnings-and-payouts/engineer-earns-the-engineer-share
  - earnings-and-payouts/team-leads-earn-team-lead-share
  - earnings-and-payouts/available-teammates-earn-team-support-share
  - earnings-and-payouts/unlisted-shares-earn-nothing
  - earnings-and-payouts/shares-dont-reduce-each-other
  - earnings-and-payouts/partnership-share-earned-at-fulfillment
  - earnings-and-payouts/partnerships-earn-under-their-agreement-in-effect
  - earnings-and-payouts/coupons-never-change-shares
  - earnings-and-payouts/unclaimed-shares-stay-with-exalynt
  - earnings-and-payouts/when-basis-and-percentages-are-fixed
  - earnings-and-payouts/each-share-rounds-on-its-own
  - earnings-and-payouts/refunds-after-fulfillment-change-nothing
  - earnings-and-payouts/reassignment-before-fulfillment-earns-nothing
  - earnings-and-payouts/when-team-support-earners-are-fixed
  - earnings-and-payouts/when-the-team-lead-beneficiary-is-fixed
  - earnings-and-payouts/no-lead-means-no-lead-share
  - earnings-and-payouts/one-team-lead-share-per-block
  - earnings-and-payouts/invalid-payout-account-delays-lead-share
  - earnings-and-payouts/partner-status-leaves-engineers-unchanged
  - earnings-and-payouts/earnings-belong-to-the-partnership
  - earnings-and-payouts/partnership-terms-set-at-invitation
  - earnings-and-payouts/partnership-share-of-payout-basis
  - earnings-and-payouts/engineering-capacity-is-the-only-basis
  - earnings-and-payouts/earning-window-opens-at-first-purchase
  - earnings-and-payouts/earning-windows-never-reset-or-pause
  - earnings-and-payouts/unfulfilled-capacity-earns-partnerships-nothing
  - earnings-and-payouts/attribution-at-purchase-decides-the-partnership
  - earnings-and-payouts/partnerships-earn-without-a-payout-account
  - earnings-and-payouts/manager-controls-the-partnerships-payout-account
  - earnings-and-payouts/exalynt-bears-partnership-earnings
  - earnings-and-payouts/partners-see-only-their-partnerships-earnings
concepts:
  - payout-share
  - capacity-payout-basis
  - payout
  - agreement
  - capacity-block
gaps:
  - id: no-money-sent-in-production
    text: >-
      No money is sent in production yet, and people are told so.
  - id: upcoming-shares-can-change
    rule: earnings-and-payouts/when-basis-and-percentages-are-fixed
    text: >-
      Upcoming lead and support earnings follow today's team and
      availability, so they can change before the block is fulfilled. Who
      earns them is fixed when it's fulfilled, and the basis and percentages
      aren't fixed when the block is assigned.
  - id: no-earnings-before-earnings-existed
    text: >-
      Blocks fulfilled before earnings existed have none.
  - id: on-hold-reads-earned
    text: >-
      On hold isn't a status of its own: an earning held up by the payout
      account reads Earned, and an alert says why.
  - id: expected-pay-not-on-the-block
    text: >-
      What an assigned block will pay shows only among a person's earnings,
      not on the block.
  - id: earnings-go-with-a-deleted-user
    text: >-
      Someone's earnings go if their user is deleted.
  - id: load-failures-not-reported
    outcome: observability/beta/hears-of-errors
    text: >-
      A failure to load is shown to the person but isn't reported to Exalynt.
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
