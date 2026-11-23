---
name: Client directory
description: >-
  Exalynt's admins see every client organization, the blocks each has bought
  and how far the work has got, and assign the teams that serve it.
stability: alpha
personas: [exalynt-admin]
rules:
  - organizations/logos-stay-within-their-organization
  - organizations/anyone-can-create-an-organization
  - organizations/newcomers-start-with-no-organization
  - organizations/creators-get-client-access
  - organizations/members-act-only-in-their-organizations
  - organizations/organization-only-actions-need-an-organization
  - organizations/client-admins-run-the-organization
  - organizations/only-admins-purchase-or-manage-members
  - organizations/client-members-work-without-billing
  - organizations/client-members-see-payment-state-not-invoices
  - organizations/billing-members-handle-only-billing
  - organizations/someone-always-manages-members
  - organizations/giving-up-member-management
  - organizations/admins-alone-see-and-revoke-invitations
  - organizations/invitations-carry-organization-roles-only
  - organizations/invitations-are-limited
  - organizations/one-pending-invitation-per-person
  - organizations/only-the-invitee-can-accept
  - organizations/accepting-makes-someone-a-member
  - organizations/new-members-hold-their-roles-permissions
  - organizations/revoked-invitations-cant-be-accepted
  - organizations/anyone-can-leave-not-remove-others
  - organizations/leaving-ends-access
  - organizations/former-members-can-rejoin
  - organizations/outsiders-cant-rename-an-organization
  - organizations/organizations-start-without-a-logo
  - organizations/organization-listings-show-logo-status
  - organizations/logos-must-be-raster-images
  - teams/only-exalynt-makes-teams
  - teams/team-names-are-unique
  - teams/clients-can-have-several-teams
  - teams/teams-can-support-several-clients
  - teams/clients-cant-see-a-teams-other-clients
  - teams/clients-see-only-their-supporting-teams
  - teams/member-access-to-teams-follows-role
  - teams/exalynts-view-of-teams
  - teams/engineers-work-only-with-supported-clients
  - teams/only-exalynt-assigns-teams
  - teams/repeat-assignment-changes-nothing
  - teams/what-counts-as-a-team-update
  - teams/removing-one-team-keeps-the-others
  - teams/deleted-teams-disappear-for-clients
  - teams/members-are-listed-lead-first
  - teams/one-team-per-engineer
  - teams/one-lead-per-team
  - teams/a-departing-lead-leaves-no-lead
  - teams/removed-members-leave-every-clients-view
  - teams/removing-someone-already-gone
  - teams/only-exalynts-people-join-teams
concepts: [capacity-block, invoice, organization, team]
gaps:
  - id: last-updated-misses-activity
    name: Last updated misses client activity
    impact: inconvenient
    description: >-
      When a client was last updated changes only when the organization itself
      does, such as its name or logo, not when the client does something.
  - id: agreements-are-placeholders
    name: Agreements are placeholders
    impact: blocking
    description: >-
      A client's agreements are still placeholders. Its coupons are a separate
      capability, Client coupons.
tradeoffs:
  - id: no-primary-contact
    name: Client members not shown to staff
    impact: inconvenient
    description: A client's members aren't shown, since staff can't see them.
    drawback: There's no primary contact for a client.
---

## Includes

- Admins see how many of each client's blocks aren't fulfilled yet.
- Admins see a client's teams, and unassign them.
- Admins see each of a client's blocks with its week, who's on it, and the
  invoice it was bought on.
