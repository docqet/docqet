---
id: payouts
name: Payouts
description: >-
  Admins release what people and partnerships have earned, and it goes to each
  payee's payout account.
stability: alpha
personas:
  - persona:exalynt-engineer-1
  - persona:exalynt-engineer-2
  - persona:exalynt-team-lead
  - persona:exalynt-admin
  - persona:partner
rules:
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
concepts: [concept:payout, concept:payout-share, concept:capacity-payout-basis, concept:partnership@partnerships]
gaps:
  - id: pre-production-payouts-say-paid
    name: Pre-production payouts wrongly say Paid
    impact: damaging
    description: >-
      Payouts released before production sent money through the payments
      partner say Paid, though nothing was sent.
  - id: leads-cant-see-team-payout-status
    name: Leads can't see their team's payout status
    rule: rule:who-sees-payout-status
    impact: blocking
    description: >-
      A lead can't see the payout status of their team's blocks.
  - id: paid-means-reached-the-balance
    name: Paid doesn't mean the bank has it
    impact: inconvenient
    description: >-
      Paid means the money has reached the payee's balance with the payments
      partner, not their bank. The payments partner pays it on to the bank
      itself, usually within a couple of days, and keeps for the payee
      anything the bank sends back.
  - id: failed-payout-reads-earned
    name: Failed payouts read as Earned
    impact: negligible
    description: >-
      An earning whose payout failed reads as Earned on the earnings page,
      with a note saying so.
  - id: nothing-held-back-from-a-release
    name: Nothing can be held back from a release
    impact: blocking
    description: >-
      Nothing can be held back from a release, or looked into from it.
    when: >-
      An admin wants to hold back or look into one payee's payout before a
      release.
  - id: releases-dont-say-who
    name: Releases don't say who released them
    outcome: security/ga/traceable
    impact: inconvenient
    description: >-
      A past release doesn't say who released it.
    when: Someone needs to know who released a payout.
  - id: unanswered-releases-stay-processing
    name: Unanswered releases stay Processing
    impact: inconvenient
    description: >-
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
