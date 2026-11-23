---
name: Payout accounts
description: >-
  People and partnerships each have one bank account their payouts go to,
  which they add, change, fix, remove, and see whether it can be paid.
stability: alpha
personas: [exalynt-engineer-1, exalynt-engineer-2, partner]
rules:
  - payout-accounts/one-payout-account-per-person
  - payout-accounts/a-partnerships-payout-account-is-its-own
  - payout-accounts/removing-a-payout-account
  - payout-accounts/seeing-whether-an-account-can-be-paid
  - payout-accounts/payout-accounts-stay-private-to-their-owner
  - payout-accounts/admins-see-only-payment-readiness
  - payout-accounts/limited-tokens-cant-reach-payout-accounts
concepts: [payout, partnership]
gaps:
  - id: one-account-one-country
    summary: >-
      There's one account per person or partnership, and its country is fixed
      once it's chosen, as the payments partner's form holds one and verifies
      them for one country.
  - id: status-changes-show-on-next-load
    summary: >-
      A change of status shows when the account is next loaded.
  - id: requirements-read-as-field-names
    summary: >-
      A requirement can read as the payments partner's field name rather than
      words.
  - id: no-payouts-to-mexico
    summary: >-
      People can't be paid in Mexico, so it isn't offered as a country: the
      payments partner can't send there.
  - id: form-asks-for-business-details
    summary: >-
      The payments partner's form asks for business details, as if the payee
      sold something: a website or a description of what they sell, even in
      the US, and more of them outside it. In Canada it also asks for an ID
      document and a selfie.
  - id: changes-made-in-the-partners-dashboard
    summary: >-
      Once an account is set up, changing it happens in the payments
      partner's own dashboard rather than its form.
  - id: removing-closes-the-account
    summary: >-
      Removing an account closes it with the payments partner, so adding one
      again means going through their checks from the start.
  - id: test-accounts-cleared
    summary: >-
      Accounts set up before production used the payments partner were test
      ones, and were cleared, so people set theirs up again.
---

## Includes

- Engineers add the bank account their payouts go to on the payments partner's
  form, and see what to fix if it can't be paid.
