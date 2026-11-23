---
id: engineers
name: Engineers
description: >-
  Exalynt's admins see everyone who works with Exalynt: their team, what
  they're working on, and whether they're ready for client work.
stability: alpha
personas: [persona:exalynt-admin]
rules:
  - rule:permissions-follow-where-someone-acts@accounts
  - rule:no-platform-role-means-no-permissions@accounts
  - rule:creators-get-the-creator-role@accounts
  - rule:member-permissions-follow-their-role@accounts
  - rule:outsiders-cant-change-organization-roles@accounts
  - rule:acting-as-engineer-or-client-never-both@accounts
  - rule:team-scoped-capacity-access@accounts
  - rule:own-scoped-capacity-access@accounts
  - rule:read-only-engineers-cant-staff-blocks@accounts
  - rule:only-exalynt-lists-its-clients@accounts
  - rule:what-each-role-kind-may-grant@accounts
  - rule:exalynt-only-permissions-cant-be-granted@accounts
  - rule:roles-grant-only-what-their-kind-allows@accounts
  - rule:who-reads-permissions-and-makes-roles@accounts
  - rule:deleted-roles-cant-be-found@accounts
  - rule:held-platform-roles-cant-be-deleted@accounts
  - rule:invited-roles-cant-be-deleted@accounts
  - rule:who-gives-out-platform-roles@accounts
  - rule:role-names-are-unique-within-their-kind@accounts
  - rule:only-one-creator-role@accounts
  - rule:the-creator-role-can-manage-members@accounts
  - rule:held-organization-roles-cant-be-deleted@accounts
  - rule:held-roles-keep-member-management@accounts
  - rule:people-lists-exclude-clients@accounts
  - rule:listing-people-requires-a-platform-role@accounts
  - rule:platform-roles-arent-organization-roles@accounts
  - rule:role-edits-keep-the-description@accounts
  - rule:roles-stay-with-their-own-kind@accounts
  - rule:platform-roles-can-be-taken-away@accounts
  - rule:who-invites-people-to-exalynt@accounts
  - rule:exalynt-invitations-show-as-pending@accounts
  - rule:accepting-an-invitation-to-exalynt@accounts
  - rule:new-people-have-no-applications@accounts
  - rule:applications-show-on-the-person@accounts
  - rule:who-sets-application-access@accounts
  - rule:inviting-with-applications-needs-access@accounts
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
  - rule:one-payout-account-per-person@pay
  - rule:a-partnerships-payout-account-is-its-own@pay
  - rule:removing-a-payout-account@pay
  - rule:seeing-whether-an-account-can-be-paid@pay
  - rule:payout-accounts-stay-private-to-their-owner@pay
  - rule:admins-see-only-payment-readiness@pay
  - rule:limited-tokens-cant-reach-payout-accounts@pay
concepts: [concept:team, concept:role@accounts]
gaps:
  - id: readiness-one-at-a-time
    name: Payout readiness shown one person at a time
    impact: inconvenient
    description: >-
      Readiness shows only for one person at a time, as asking whether someone
      can be paid asks the payout provider, so the list of everyone can't say
      who isn't ready.
  - id: lists-every-platform-role
    name: Lists every platform role, not just engineers
    impact: negligible
    description: >-
      It lists everyone holding a platform role, whatever the role, not only
      engineers.
  - id: joined-is-account-creation
    name: Joined date is account creation
    impact: negligible
    description: >-
      Joined is when their account was made, so someone who was a client first
      shows that earlier date.
  - id: moved-engineers-stay-on-blocks
    name: Moved engineers stay on their blocks
    impact: inconvenient
    description: >-
      Moving someone off a team leaves them on their blocks until they're
      reassigned, which can't be done in the apps yet.
    when: Someone on upcoming blocks is moved off their team.
  - id: reads-everything
    name: Everything read on opening
    outcome: efficiency/beta/bounded
    impact: inconvenient
    description: >-
      Everyone, every team, client and block is read on opening, and again
      after a team change.
    when: The numbers of people, teams, clients and blocks grow.
  - id: role-shown-only-to-role-managers
    name: Role shown only to role managers
    impact: inconvenient
    description: Someone's role is named only to those who can manage roles.
  - id: role-and-applications-api-only
    name: Role and applications changeable only by API
    impact: inconvenient
    description: >-
      Someone's role and applications can't be changed in the apps, only by
      calling the API directly.
  - id: no-agreement-preview
    name: No Engineer Agreement preview
    impact: damaging
    description: >-
      There's no preview of an Engineer Agreement before sending it, and its
      terms come from the app's own copy of the terms catalog.
    when: >-
      The app's copy of the terms catalog falls out of step with the catalog.
  - id: agreements-not-listed
    name: Agreements not shown in the list
    impact: inconvenient
    description: >-
      The list of everyone doesn't say who has an Engineer Agreement, as that
      would take a request per engineer.
  - id: week-range-example-weak
    name: Week range example misses the earlier limit
    outcome: functionality/beta/stays-correct
    impact: inconvenient
    description: >-
      The acceptance example for listing the blocks someone is on by week has
      no block before the weeks asked for, so losing the earlier limit
      wouldn't fail it.
    when: >-
      Someone changes how blocks are listed by week and loses the earlier
      limit.
tradeoffs:
  - id: written-for-administrators
    name: Written for administrators, not narrower roles
    impact: inconvenient
    description: >-
      It's written for administrators: without full reads of people, teams,
      capacity and clients the list doesn't load, and with narrower reach it
      shows only what that reaches.
    drawback: >-
      There's no rule for what a team-limited view of people shows, as only
      the admin view matters for now.
    when: Someone other than an administrator needs the list of people.
---

## Includes

- Admins see whether someone leads their team.
- Admins see someone's role, when they joined, and the blocks they're on across
  every client.
- Admins see an engineer's availability, whether they can be paid, and whether
  they've written a bio.
