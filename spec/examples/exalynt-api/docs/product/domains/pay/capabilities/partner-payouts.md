---
name: Partner payouts
description: >-
  Each partnership is paid what it earns into its own payout account, never
  its manager's, once an admin releases it, and its manager sees each payout.
stability: beta
personas: [partner]
rules:
  - payout-schedule/expected-pay-visible-from-assignment
  - payout-schedule/people-see-only-their-own-earnings
  - payout-schedule/each-earning-shows-where-it-stands
  - payout-schedule/earnings-are-paid-out-when-approved
  - payout-schedule/admins-release-payouts
  - payout-schedule/one-payout-per-payee-per-run
  - payout-schedule/earnings-are-sent-only-once
  - payout-schedule/payouts-go-to-the-current-account
  - payout-schedule/how-a-payouts-status-progresses
  - payout-schedule/payouts-are-in-us-dollars
  - payout-schedule/earnings-show-payout-outcome
  - payout-schedule/who-sees-payout-status
  - payout-schedule/failed-payouts-are-sent-again
  - payout-schedule/canceled-payouts-leave-earnings-unsent
  - payout-schedule/earnings-wait-for-a-valid-account
  - payout-schedule/partnership-earnings-are-paid-separately
  - payout-schedule/no-minimum-payout
  - payout-schedule/earnings-are-paid-after-leaving
  - payout-schedule/sent-payouts-never-change
  - payout-schedule/sent-payouts-arent-taken-back
  - payout-schedule/partners-see-only-their-partnerships-payouts
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
concepts: [payout, partnership]
gaps:
  - id: payouts-page-doesnt-say-why-held
    summary: >-
      The Payouts page doesn't say when the payout account is holding
      earnings up, beyond having none; Earnings does.
  - id: releasing-is-still-alpha
    outcome: security/alpha/stable-dependencies
    summary: >-
      Releasing payouts is the admin side of Payouts, which is still Alpha.
tradeoffs:
  - id: pre-production-payouts-say-paid
    summary: >-
      Payouts released before production sent money through the payments
      partner are left saying Paid.
    drawbacks:
      - They say Paid, though nothing was sent.
  - id: paid-means-reached-the-balance
    summary: >-
      Paid means the money has reached the partnership's balance with the
      payments partner, not its bank.
    drawbacks:
      - >-
        The payments partner pays it on to the bank itself, usually within a
        couple of days.
  - id: sent-payouts-not-taken-back
    summary: >-
      A sent payout isn't taken back here.
    drawbacks:
      - Corrections are settled outside the product.
---

## Includes

- Partners see every payout sent to the partnership, newest first: when it was
  sent, the bank account it went to, whether it arrived, and the blocks it paid,
  each with its client, basis, percentage and amount as they were when it was
  sent.
- Partners see why a payout failed, and when it was sent again.

## Success

- Every partnership is paid what it earns into its own account each week an
  admin releases, and its manager sees each payout and what it carried without
  asking Exalynt.
