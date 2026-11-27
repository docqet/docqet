---
docqet: capability
id: client-directory
name: Client directory
description: >-
  Exalynt's admins see every client organization, the blocks each has bought
  and how far the work has got, and assign the teams that serve it.
stability: alpha
feature: feature:clients-and-teams
solves: [problem:exceptions-hide-in-routine]
initiatives: [initiative:mvp]
rules:
  - rule:logos-stay-within-their-organization
  - rule:anyone-can-create-an-organization
  - rule:newcomers-start-with-no-organization
  - rule:creators-get-client-access
  - rule:members-act-only-in-their-organizations
  - rule:organization-only-actions-need-an-organization
  - rule:client-admins-run-the-organization
  - rule:only-admins-purchase-or-manage-members
  - rule:client-members-work-without-billing
  - rule:client-members-see-payment-state-not-invoices
  - rule:billing-members-handle-only-billing
  - rule:someone-always-manages-members
  - rule:giving-up-member-management
  - rule:admins-alone-see-and-revoke-invitations
  - rule:invitations-carry-organization-roles-only
  - rule:organization-invitations-are-limited
  - rule:one-pending-invitation-per-person
  - rule:only-the-invitee-can-accept
  - rule:accepting-makes-someone-a-member
  - rule:new-members-hold-their-roles-permissions
  - rule:revoked-invitations-cant-be-accepted
  - rule:anyone-can-leave-not-remove-others
  - rule:leaving-ends-access
  - rule:former-members-can-rejoin
  - rule:outsiders-cant-rename-an-organization
  - rule:organizations-start-without-a-logo
  - rule:organization-listings-show-logo-status
  - rule:logos-must-be-raster-images
  - rule:only-exalynt-makes-teams
  - rule:team-names-are-unique
  - rule:clients-can-have-several-teams
  - rule:teams-can-support-several-clients
  - rule:clients-cant-see-a-teams-other-clients
  - rule:clients-see-only-their-supporting-teams
  - rule:member-access-to-teams-follows-role
  - rule:exalynts-view-of-teams
  - rule:engineers-work-only-with-supported-clients
  - rule:only-exalynt-assigns-teams
  - rule:repeat-assignment-changes-nothing
  - rule:what-counts-as-a-team-update
  - rule:removing-one-team-keeps-the-others
  - rule:deleted-teams-disappear-for-clients
  - rule:members-are-listed-lead-first
  - rule:one-team-per-engineer
  - rule:one-lead-per-team
  - rule:a-departing-lead-leaves-no-lead
  - rule:removed-members-leave-every-clients-view
  - rule:removing-someone-already-gone
  - rule:only-exalynts-people-join-teams
concepts: [concept:capacity-block, concept:invoice, concept:organization, concept:team]
tradeoffs:
  - id: no-primary-contact
    name: Client members not shown to staff
    description: A client's members aren't shown, since staff can't see them.
    drawback: There's no primary contact for a client.
---

## Includes

- Admins see how many of each client's blocks aren't fulfilled yet.
- Admins see a client's teams, and unassign them.
- Admins see each of a client's blocks with its week, who's on it, and the
  invoice it was bought on.
