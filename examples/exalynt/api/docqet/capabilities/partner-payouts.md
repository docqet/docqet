---
docqet: capability
id: partner-payouts
name: Partner payouts
description: >-
  Each partnership is paid what it earns into its own payout account, never
  its manager's, once an admin releases it, and its manager sees each payout.
stability: beta
within: feature:partner-program
solves: [problem:partner-earnings-opaque]
included-in: [initiative:mvp]
follows:
  - rule:expected-pay-visible-from-assignment
  - rule:people-see-only-their-own-earnings
  - rule:each-earning-shows-where-it-stands
  - rule:earnings-are-paid-out-when-approved
  - rule:admins-release-payouts
  - rule:one-payout-per-payee-per-run
  - rule:earnings-are-sent-only-once
  - rule:payouts-go-to-the-current-account
  - rule:how-a-payouts-status-progresses
  - rule:payouts-are-in-us-dollars
  - rule:earnings-show-payout-outcome
  - rule:who-sees-payout-status
  - rule:failed-payouts-are-sent-again
  - rule:canceled-payouts-leave-earnings-unsent
  - rule:earnings-wait-for-a-valid-account
  - rule:partnership-earnings-are-paid-separately
  - rule:no-minimum-payout
  - rule:earnings-are-paid-after-leaving
  - rule:sent-payouts-never-change
  - rule:sent-payouts-arent-taken-back
  - rule:partners-see-only-their-partnerships-payouts
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
uses: [concept:payout, concept:partnership]
tradeoffs:
  - id: pre-production-payouts-say-paid
    name: Pre-production payouts left saying Paid
    description: >-
      Payouts released before production sent money through the payments
      partner are left saying Paid.
    drawback: They say Paid, though nothing was sent.
  - id: paid-means-reached-the-balance
    name: Paid means in the balance, not the bank
    description: >-
      Paid means the money has reached the partnership's balance with the
      payments partner, not its bank.
    drawback: >-
      The payments partner pays it on to the bank itself, usually within a
      couple of days.
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
