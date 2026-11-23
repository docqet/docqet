---
name: Partner payout accounts
description: >-
  Partners set up and look after the one bank account each partnership they
  manage is paid to, its own apart from theirs and any other partnership's.
stability: beta
personas: [partner]
rules:
  - payout-accounts/one-payout-account-per-person
  - payout-accounts/a-partnerships-payout-account-is-its-own
  - payout-accounts/removing-a-payout-account
  - payout-accounts/seeing-whether-an-account-can-be-paid
  - payout-accounts/payout-accounts-stay-private-to-their-owner
  - payout-accounts/admins-see-only-payment-readiness
  - payout-accounts/limited-tokens-cant-reach-payout-accounts
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
  - id: status-changes-show-on-next-load
    impact: negligible
    summary: >-
      A change of status shows when the page is next loaded.
  - id: requirements-read-as-field-names
    impact: inconvenient
    summary: >-
      A requirement can read as the payments partner's field name rather than
      words.
  - id: admins-cant-see-partnership-readiness
    impact: blocking
    summary: >-
      An admin can't see whether a partnership can be paid.
tradeoffs:
  - id: one-account-per-partnership-checked-each-time
    impact: inconvenient
    summary: >-
      Each partnership has its own payout account, even when several are paid
      to the same bank account.
    drawback: >-
      Someone managing several partnerships that are paid to the same bank
      account sets it up, and goes through the payments partner's checks, on
      each.
    when: Someone manages several partnerships paid to the same bank account.
  - id: one-account-one-country
    impact: blocking
    summary: >-
      There's one account per partnership, and its country is fixed once it's
      chosen, as the payments partner's form holds one and verifies it for
      one country.
    drawback: >-
      A partnership can't be paid to a second account, or move its account to
      another country.
    when: >-
      A partnership wants a second account, or to be paid in another country.
  - id: no-payouts-to-mexico
    impact: blocking
    summary: >-
      Mexico isn't offered as a country, since the payments partner can't
      send there.
    drawback: Partnerships can't be paid in Mexico.
    when: A partnership's bank account is in Mexico.
  - id: form-asks-for-business-details
    impact: inconvenient
    summary: >-
      Accounts are set up on the payments partner's form as it is.
    drawback: >-
      The form asks for business details, as if the partnership sold something:
      a website or a description of what it sells, and more of them outside the
      US. In Canada it also asks for an ID document and a selfie.
  - id: changes-made-in-the-partners-dashboard
    impact: inconvenient
    summary: >-
      Once an account is set up, changing it happens in the payments
      partner's own dashboard rather than its form.
    drawback: >-
      Managers change the bank account somewhere other than where they set it
      up.
    when: A manager changes the bank account.
  - id: removing-closes-the-account
    impact: inconvenient
    summary: >-
      Removing an account closes it with the payments partner.
    drawback: Adding one again means going through their checks from the start.
    when: A manager removes the account and later adds one again.
  - id: test-accounts-cleared
    impact: inconvenient
    summary: >-
      Accounts set up before production used the payments partner were test
      ones, and were cleared.
    drawback: Partnerships set theirs up again.
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
