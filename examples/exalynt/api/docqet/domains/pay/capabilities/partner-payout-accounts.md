---
docqet: capability
id: partner-payout-accounts
domain: pay
name: Partner payout accounts
description: >-
  Partners set up and look after the one bank account each partnership they
  manage is paid to, its own apart from theirs and any other partnership's.
stability: beta
solves: [problem:partner-earnings-opaque]
initiatives: [initiative:mvp]
rules:
  - rule:one-payout-account-per-person
  - rule:a-partnerships-payout-account-is-its-own
  - rule:removing-a-payout-account
  - rule:seeing-whether-an-account-can-be-paid
  - rule:payout-accounts-stay-private-to-their-owner
  - rule:admins-see-only-payment-readiness
  - rule:limited-tokens-cant-reach-payout-accounts
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
concepts: [concept:payout, concept:partnership@partnerships]
tradeoffs:
  - id: one-account-per-partnership-checked-each-time
    name: Each partnership has its own account
    description: >-
      Each partnership has its own payout account, even when several are paid
      to the same bank account.
    drawback: >-
      Someone managing several partnerships that are paid to the same bank
      account sets it up, and goes through the payments partner's checks, on
      each.
  - id: one-account-one-country
    name: One country per account, fixed once chosen
    description: >-
      There's one account per partnership, and its country is fixed once it's
      chosen, as the payments partner's form holds one and verifies it for
      one country.
    drawback: >-
      A partnership can't be paid to a second account, or move its account to
      another country. That matters when a partnership wants a second account,
      or to be paid in another country.
  - id: no-payouts-to-mexico
    name: Mexico not offered as a country
    description: >-
      Mexico isn't offered as a country, since the payments partner can't
      send there.
    drawback: Partnerships can't be paid in Mexico.
  - id: form-asks-for-business-details
    name: Payments partner's form used as it is
    description: >-
      Accounts are set up on the payments partner's form as it is.
    drawback: >-
      The form asks for business details, as if the partnership sold something:
      a website or a description of what it sells, and more of them outside the
      US. In Canada it also asks for an ID document and a selfie.
  - id: changes-made-in-the-partners-dashboard
    name: Changes made in the payments partner's dashboard
    description: >-
      Once an account is set up, changing it happens in the payments
      partner's own dashboard rather than its form.
    drawback: >-
      Managers change the bank account somewhere other than where they set it
      up.
  - id: removing-closes-the-account
    name: Removing an account closes it
    description: >-
      Removing an account closes it with the payments partner.
    drawback: >-
      Adding one again means going through their checks from the start. That
      matters only for a manager who removes the account and later adds one
      again.
---

## Includes

- Partners set up the payout account on the payments partner's form, telling it
  whether the partnership is paid as a person or a business.
- Partners see whether it can be paid, and what to fix if it can't, and fix it
  on the same form.
- Partners change the bank account, or remove it.
- Partners see that the partnership's earnings are held until it has one that
  can be paid, in the Partner Hub's setup steps and on its pages.

## Success

- Every partnership manager sets up, fixes, or removes the partnership's own
  payout account on their own, and can tell whether it can be paid.
