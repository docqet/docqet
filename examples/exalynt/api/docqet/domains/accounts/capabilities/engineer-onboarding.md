---
docqet: capability
id: engineer-onboarding
domain: accounts
name: Engineer onboarding
description: >-
  Engineers join Exalynt by an admin's invitation, on the team it names if it
  names one, since nobody signs up as an engineer on their own.
stability: alpha
solves: [problem:new-engineer-unsure-ready-or-paid]
initiatives: [initiative:mvp]
rules:
  - rule:engineers-join-by-invitation-only
  - rule:existing-accounts-gain-the-engineer-role
  - rule:admins-see-and-revoke-all-invitations
  - rule:invalid-payout-accounts-delay-payment
  - rule:when-an-engineer-is-ready
  - rule:invited-engineers-join-their-team
  - rule:one-account-however-many-hats
  - rule:gaining-a-hat-takes-nothing-away
  - rule:invitations-go-to-an-email-address
  - rule:adding-a-hat-to-an-account
  - rule:invitations-stay-pending-until-resolved
  - rule:who-sees-and-revokes-pending-invitations
concepts: [concept:agreement@agreements, concept:team@capacity]
---

## Includes

- Engineers sign up to accept their invitation, if they don't have an account
  yet.
- Engineers see the terms that set their engineer share.
