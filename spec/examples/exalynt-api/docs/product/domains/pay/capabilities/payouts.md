---
name: Payouts
description: >-
  Admins release what people and partnerships have earned, and it goes to each
  payee's payout account.
stability: alpha
personas:
  - exalynt-engineer-1
  - exalynt-engineer-2
  - exalynt-team-lead
  - exalynt-admin
  - partner
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
concepts: [payout, payout-share, capacity-payout-basis, partnership]
gaps:
  - id: pre-production-payouts-say-paid
    impact: damaging
    summary: >-
      Payouts released before production sent money through the payments
      partner say Paid, though nothing was sent.
  - id: leads-cant-see-team-payout-status
    rule: payout-schedule/who-sees-payout-status
    impact: blocking
    summary: >-
      A lead can't see the payout status of their team's blocks.
  - id: paid-means-reached-the-balance
    impact: inconvenient
    summary: >-
      Paid means the money has reached the payee's balance with the payments
      partner, not their bank. The payments partner pays it on to the bank
      itself, usually within a couple of days, and keeps for the payee
      anything the bank sends back.
  - id: failed-payout-reads-earned
    impact: negligible
    summary: >-
      An earning whose payout failed reads as Earned on the earnings page,
      with a note saying so.
  - id: nothing-held-back-from-a-release
    impact: blocking
    summary: >-
      Nothing can be held back from a release, or looked into from it.
    when: >-
      An admin wants to hold back or look into one payee's payout before a
      release.
  - id: releases-dont-say-who
    outcome: security/ga/traceable
    impact: inconvenient
    summary: >-
      A past release doesn't say who released it.
    when: Someone needs to know who released a payout.
  - id: unanswered-releases-stay-processing
    impact: inconvenient
    summary: >-
      A release that got no answer from the payments partner stays
      Processing, and an admin is told, until the next release sends it
      again.
    when: The payments partner doesn't answer a release.
---

## Includes

- Engineers see earnings waiting for a payout, and earnings on hold, with what
  they need to fix.
- Engineers see every payout they've been sent, what it was made up of, and
  where it went.
- Engineers see why a payout failed, and the payout it was sent again as.
- Admins see what's waiting to be released, by payee, a person or a partnership,
  with what each line is for.
- Admins see whose earnings are on hold, and why.
- Admins see failed payouts, why each failed, and whether it's been sent again.
- Admins see past releases.
