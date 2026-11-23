---
name: Partner earnings
summary: >-
  Partners see what their partnership earns on each of its clients' blocks:
  what each block has earned or will, how long each client's earning window
  has left, and what's waiting to be paid.
stability: beta
personas: [partner]
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
  - partnerships/inviting-creates-the-partnership
  - partnerships/accepting-makes-the-invitee-manager
  - partnerships/the-manager-names-the-partnership
  - partnerships/admins-set-terms-at-invitation
  - partnerships/revoking-removes-the-partnership
  - partnerships/managers-see-only-their-own-partnership
  - partnerships/enrolling-is-voluntary
  - partnerships/a-partnership-stands-apart-from-organizations
  - partnerships/partnerships-can-change-managers
  - partnerships/existing-accounts-gain-partner-access
  - partnerships/partners-invite-clients-by-email
  - partnerships/invitations-can-be-resent-or-revoked
  - partnerships/invitations-are-limited
  - partnerships/partners-see-only-their-own-invitations
  - partnerships/one-referral-code-per-partnership
  - partnerships/the-code-used-decides-the-partnership
  - partnerships/referral-codes-attribute-only-new-clients
  - partnerships/one-partnership-per-client
  - partnerships/no-attribution-to-the-managers-organization
  - partnerships/admins-can-adjust-attribution
  - partnerships/no-earnings-on-other-partners
  - partnerships/referred-clients-work-like-any-other
  - partnerships/partners-see-only-their-own-clients
  - partnerships/partners-see-each-clients-earning-window
  - partnerships/what-partners-can-see
  - partnerships/clients-see-who-referred-them
  - partnerships/introductions-dont-affect-engineer-assignment
concepts: [partnership, payout-share, capacity-payout-basis, fulfilled]
gaps:
  - id: earning-doesnt-name-its-payout
    text: >-
      An earning doesn't say which payout carried it; the payout lists its
      blocks.
  - id: attribution-and-terms-from-partnerships
    outcome: security/alpha/stable-dependencies
    text: >-
      Which clients are attributed to the partnership, and its terms, come
      from Partnerships, which is still Alpha.
tradeoffs:
  - id: nothing-before-partnership-earnings
    text: >-
      Partnerships earn only on blocks fulfilled since partnership earnings
      existed.
    cost: >-
      Blocks fulfilled before partnership earnings existed earn the
      partnership nothing.
  - id: earlier-blocks-count-after-attribution
    text: >-
      Blocks a client bought before this was built count as bought for the
      partnership only if they were bought after the client was attributed to
      it.
    cost: >-
      Blocks bought before the client was attributed earn the partnership
      nothing.
  - id: client-price-and-coupons-not-shown
    text: >-
      What the client paid for a block, and any coupon on it, isn't shown, as
      it never changes what the partnership earns.
    cost: >-
      Partners can't see what their clients paid.
  - id: refunds-settled-outside-the-product
    text: >-
      A refund after a block is fulfilled changes nothing the partnership
      earned.
    cost: >-
      Exalynt settles it outside the product.
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
