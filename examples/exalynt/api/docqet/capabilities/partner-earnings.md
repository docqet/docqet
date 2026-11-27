---
docqet: capability
id: partner-earnings
name: Partner earnings
description: >-
  Partners see what their partnership earns on each of its clients' blocks:
  what each block has earned or will, how long each client's earning window
  has left, and what's waiting to be paid.
stability: beta
feature: feature:partner-program
solves: [problem:partner-earnings-opaque]
initiatives: [initiative:mvp]
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
  - rule:inviting-creates-the-partnership
  - rule:accepting-makes-the-invitee-manager
  - rule:the-manager-names-the-partnership
  - rule:admins-set-terms-at-invitation
  - rule:revoking-removes-the-partnership
  - rule:managers-see-only-their-own-partnership
  - rule:enrolling-is-voluntary
  - rule:a-partnership-stands-apart-from-organizations
  - rule:partnerships-can-change-managers
  - rule:existing-accounts-gain-partner-access
  - rule:partners-invite-clients-by-email
  - rule:invitations-can-be-resent-or-revoked
  - rule:partnership-invitations-are-limited
  - rule:partners-see-only-their-own-invitations
  - rule:one-referral-code-per-partnership
  - rule:the-code-used-decides-the-partnership
  - rule:referral-codes-attribute-only-new-clients
  - rule:one-partnership-per-client
  - rule:no-attribution-to-the-managers-organization
  - rule:admins-can-adjust-attribution
  - rule:no-earnings-on-other-partners
  - rule:referred-clients-work-like-any-other
  - rule:partners-see-only-their-own-clients
  - rule:partners-see-each-clients-earning-window
  - rule:what-partners-can-see
  - rule:clients-see-who-referred-them
  - rule:introductions-dont-affect-engineer-assignment
concepts: [concept:partnership, concept:payout-share, concept:capacity-payout-basis, concept:fulfilled]
tradeoffs:
  - id: nothing-before-partnership-earnings
    name: Earnings start from launch, not backdated
    description: >-
      Partnerships earn only on blocks fulfilled since partnership earnings
      existed.
    drawback: >-
      Blocks fulfilled before partnership earnings existed earn the partnership
      nothing.
  - id: earlier-blocks-count-after-attribution
    name: Earlier blocks count only after attribution
    description: >-
      Blocks a client bought before this was built count as bought for the
      partnership only if they were bought after the client was attributed to
      it.
    drawback: >-
      Blocks bought before the client was attributed earn the partnership
      nothing.
---

## Includes

- Partners see every block the partnership's clients bought within their earning
  windows, the most recently bought first: its client, type, when it was bought,
  its capacity payout basis and the partnership's percentage of it, the amount,
  and whether that's not earned yet, waiting, on hold, on its way, or paid.
- While a block isn't earned yet, partners see whether it's scheduled, and for
  which week.
- Partners see totals, on their phone as well: what the partnership has earned
  and how much of it is paid, what's waiting to be paid out, and what's bought
  but not earned yet.
- Partners are told why earned earnings are on hold, when the partnership's
  payout account can't be paid yet.

## Success

- Every partner sees, without asking Exalynt, what their partnership has earned
  on each client's blocks, what's waiting to be paid, and what's bought but not
  earned yet.
