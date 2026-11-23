---
name: Engineers
description: >-
  Exalynt's admins see everyone who works with Exalynt: their team, what
  they're working on, and whether they're ready for client work.
stability: alpha
personas: [exalynt-admin]
rules:
  - roles-and-access/permissions-follow-where-someone-acts
  - roles-and-access/no-platform-role-means-no-permissions
  - roles-and-access/creators-get-the-creator-role
  - roles-and-access/member-permissions-follow-their-role
  - roles-and-access/outsiders-cant-change-organization-roles
  - roles-and-access/acting-as-engineer-or-client-never-both
  - roles-and-access/team-scoped-capacity-access
  - roles-and-access/own-scoped-capacity-access
  - roles-and-access/read-only-engineers-cant-staff-blocks
  - roles-and-access/only-exalynt-lists-its-clients
  - roles-and-access/what-each-role-kind-may-grant
  - roles-and-access/exalynt-only-permissions-cant-be-granted
  - roles-and-access/roles-grant-only-what-their-kind-allows
  - roles-and-access/who-reads-permissions-and-makes-roles
  - roles-and-access/deleted-roles-cant-be-found
  - roles-and-access/held-platform-roles-cant-be-deleted
  - roles-and-access/invited-roles-cant-be-deleted
  - roles-and-access/who-gives-out-platform-roles
  - roles-and-access/role-names-are-unique-within-their-kind
  - roles-and-access/only-one-creator-role
  - roles-and-access/the-creator-role-can-manage-members
  - roles-and-access/held-organization-roles-cant-be-deleted
  - roles-and-access/held-roles-keep-member-management
  - roles-and-access/people-lists-exclude-clients
  - roles-and-access/listing-people-requires-a-platform-role
  - roles-and-access/platform-roles-arent-organization-roles
  - roles-and-access/role-edits-keep-the-description
  - roles-and-access/roles-stay-with-their-own-kind
  - roles-and-access/platform-roles-can-be-taken-away
  - roles-and-access/who-invites-people-to-exalynt
  - roles-and-access/exalynt-invitations-show-as-pending
  - roles-and-access/accepting-an-invitation-to-exalynt
  - roles-and-access/new-people-have-no-applications
  - roles-and-access/applications-show-on-the-person
  - roles-and-access/who-sets-application-access
  - roles-and-access/inviting-with-applications-needs-access
  - staffing/listing-an-engineers-blocks
  - staffing/claiming-staffs-the-block-directly
  - staffing/claiming-requires-eligibility
  - staffing/claims-must-fit-availability
  - staffing/unclaiming-before-the-week-starts
  - staffing/warned-before-stranding-another-block
  - staffing/new-blocks-start-unstaffed
  - staffing/exalynt-staff-assign-engineers
  - staffing/only-capacity-managers-assign-engineers
  - staffing/taking-an-engineer-off-a-block
  - staffing/one-engineer-per-block
  - staffing/assignment-requires-eligibility
  - staffing/assignment-must-fit-availability
  - staffing/engineers-are-never-overbooked
  - staffing/admins-resolve-cross-team-conflicts
  - staffing/no-claiming-an-assigned-block
  - staffing/leaving-a-clients-teams-releases-its-upcoming-blocks
  - staffing/late-claims-during-the-preferred-week
  - staffing/lapsed-blocks-must-be-moved-first
  - staffing/in-progress-blocks-cant-be-moved
  - payout-accounts/one-payout-account-per-person
  - payout-accounts/a-partnerships-payout-account-is-its-own
  - payout-accounts/removing-a-payout-account
  - payout-accounts/seeing-whether-an-account-can-be-paid
  - payout-accounts/payout-accounts-stay-private-to-their-owner
  - payout-accounts/admins-see-only-payment-readiness
  - payout-accounts/limited-tokens-cant-reach-payout-accounts
concepts: [team, role]
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
  - id: team-change-offered-then-refused
    name: Team change offered, then refused
    impact: inconvenient
    description: >-
      Changing someone's team is offered to those who can't manage teams, and
      is refused when tried.
    when: Someone who can't manage teams tries to change someone's team.
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
