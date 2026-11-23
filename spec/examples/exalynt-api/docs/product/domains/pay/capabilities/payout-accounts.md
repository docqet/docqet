---
id: payout-accounts
name: Payout accounts
description: >-
  People and partnerships each have one bank account their payouts go to,
  which they add, change, fix, remove, and see whether it can be paid.
stability: alpha
personas: [persona:exalynt-engineer-1, persona:exalynt-engineer-2, persona:partner]
rules:
  - rule:one-payout-account-per-person
  - rule:a-partnerships-payout-account-is-its-own
  - rule:removing-a-payout-account
  - rule:seeing-whether-an-account-can-be-paid
  - rule:payout-accounts-stay-private-to-their-owner
  - rule:admins-see-only-payment-readiness
  - rule:limited-tokens-cant-reach-payout-accounts
concepts: [concept:payout, concept:partnership@partnerships]
gaps:
  - id: one-account-one-country
    name: One account, its country fixed once chosen
    impact: blocking
    description: >-
      There's one account per person or partnership, and its country is fixed
      once it's chosen, as the payments partner's form holds one and verifies
      them for one country.
    when: Someone wants a second account, or to be paid in another country.
  - id: status-changes-show-on-next-load
    name: Status changes show only on next load
    impact: negligible
    description: >-
      A change of status shows when the account is next loaded.
  - id: requirements-read-as-field-names
    name: Requirements can read as field names
    impact: inconvenient
    description: >-
      A requirement can read as the payments partner's field name rather than
      words.
  - id: no-payouts-to-mexico
    name: No payouts to Mexico
    impact: blocking
    description: >-
      People can't be paid in Mexico, so it isn't offered as a country: the
      payments partner can't send there.
    when: A payee's bank account is in Mexico.
  - id: form-asks-for-business-details
    name: Form asks for business details
    impact: inconvenient
    description: >-
      The payments partner's form asks for business details, as if the payee
      sold something: a website or a description of what they sell, even in
      the US, and more of them outside it. In Canada it also asks for an ID
      document and a selfie.
  - id: changes-made-in-the-partners-dashboard
    name: Changes need the payments partner's dashboard
    impact: inconvenient
    description: >-
      Once an account is set up, changing it happens in the payments
      partner's own dashboard rather than its form.
    when: Someone changes their bank account.
  - id: removing-closes-the-account
    name: Removing an account means starting over
    impact: inconvenient
    description: >-
      Removing an account closes it with the payments partner, so adding one
      again means going through their checks from the start.
    when: Someone removes their account and later adds one again.
  - id: test-accounts-cleared
    name: Test accounts cleared, so set up again
    impact: inconvenient
    description: >-
      Accounts set up before production used the payments partner were test
      ones, and were cleared, so people set theirs up again.
---

## Includes

- Engineers add the bank account their payouts go to on the payments partner's
  form, and see what to fix if it can't be paid.
