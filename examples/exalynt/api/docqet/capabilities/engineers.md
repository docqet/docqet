---
docqet: capability
id: engineers
name: Engineers
description: >-
  Exalynt's admins see everyone who works with Exalynt: their team, what
  they're working on, and whether they're ready for client work.
stability: alpha
feature: feature:clients-and-teams
solves: [problem:exceptions-hide-in-routine]
initiatives: [initiative:mvp]
rules:
  - rule:permissions-follow-where-someone-acts
  - rule:no-platform-role-means-no-permissions
  - rule:creators-get-the-creator-role
  - rule:member-permissions-follow-their-role
  - rule:outsiders-cant-change-organization-roles
  - rule:acting-as-engineer-or-client-never-both
  - rule:team-scoped-capacity-access
  - rule:own-scoped-capacity-access
  - rule:read-only-engineers-cant-staff-blocks
  - rule:only-exalynt-lists-its-clients
  - rule:what-each-role-kind-may-grant
  - rule:exalynt-only-permissions-cant-be-granted
  - rule:roles-grant-only-what-their-kind-allows
  - rule:who-reads-permissions-and-makes-roles
  - rule:deleted-roles-cant-be-found
  - rule:held-platform-roles-cant-be-deleted
  - rule:invited-roles-cant-be-deleted
  - rule:who-gives-out-platform-roles
  - rule:role-names-are-unique-within-their-kind
  - rule:only-one-creator-role
  - rule:the-creator-role-can-manage-members
  - rule:held-organization-roles-cant-be-deleted
  - rule:held-roles-keep-member-management
  - rule:people-lists-exclude-clients
  - rule:listing-people-requires-a-platform-role
  - rule:platform-roles-arent-organization-roles
  - rule:role-edits-keep-the-description
  - rule:roles-stay-with-their-own-kind
  - rule:platform-roles-can-be-taken-away
  - rule:who-invites-people-to-exalynt
  - rule:exalynt-invitations-show-as-pending
  - rule:accepting-an-invitation-to-exalynt
  - rule:new-people-have-no-applications
  - rule:applications-show-on-the-person
  - rule:who-sets-application-access
  - rule:inviting-with-applications-needs-access
  - rule:listing-an-engineers-blocks
  - rule:claiming-staffs-the-block-directly
  - rule:claiming-requires-eligibility
  - rule:claims-must-fit-availability
  - rule:unclaiming-before-the-week-starts
  - rule:warned-before-stranding-another-block
  - rule:new-blocks-start-unstaffed
  - rule:exalynt-staff-assign-engineers
  - rule:only-capacity-managers-assign-engineers
  - rule:taking-an-engineer-off-a-block
  - rule:one-engineer-per-block
  - rule:assignment-requires-eligibility
  - rule:assignment-must-fit-availability
  - rule:engineers-are-never-overbooked
  - rule:admins-resolve-cross-team-conflicts
  - rule:no-claiming-an-assigned-block
  - rule:leaving-a-clients-teams-releases-its-upcoming-blocks
  - rule:late-claims-during-the-preferred-week
  - rule:lapsed-blocks-must-be-moved-first
  - rule:in-progress-blocks-cant-be-moved
  - rule:one-payout-account-per-person
  - rule:a-partnerships-payout-account-is-its-own
  - rule:removing-a-payout-account
  - rule:seeing-whether-an-account-can-be-paid
  - rule:payout-accounts-stay-private-to-their-owner
  - rule:admins-see-only-payment-readiness
  - rule:limited-tokens-cant-reach-payout-accounts
concepts: [concept:team, concept:role]
tradeoffs:
  - id: written-for-administrators
    name: Written for administrators, not narrower roles
    description: >-
      It's written for administrators: without full reads of people, teams,
      capacity and clients the list doesn't load, and with narrower reach it
      shows only what that reaches.
    drawback: >-
      There's no rule for what a team-limited view of people shows, as only
      the admin view matters for now. That matters once someone other than an
      administrator needs the list of people.
---

## Includes

- Admins see whether someone leads their team.
- Admins see someone's role, when they joined, and the blocks they're on across
  every client.
- Admins see an engineer's availability, whether they can be paid, and whether
  they've written a bio.
