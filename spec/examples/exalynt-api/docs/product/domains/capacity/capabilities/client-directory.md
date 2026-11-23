---
id: client-directory
name: Client directory
description: >-
  Exalynt's admins see every client organization, the blocks each has bought
  and how far the work has got, and assign the teams that serve it.
stability: alpha
personas: [persona:exalynt-admin]
rules:
  - rule:logos-stay-within-their-organization@accounts
  - rule:anyone-can-create-an-organization@accounts
  - rule:newcomers-start-with-no-organization@accounts
  - rule:creators-get-client-access@accounts
  - rule:members-act-only-in-their-organizations@accounts
  - rule:organization-only-actions-need-an-organization@accounts
  - rule:client-admins-run-the-organization@accounts
  - rule:only-admins-purchase-or-manage-members@accounts
  - rule:client-members-work-without-billing@accounts
  - rule:client-members-see-payment-state-not-invoices@accounts
  - rule:billing-members-handle-only-billing@accounts
  - rule:someone-always-manages-members@accounts
  - rule:giving-up-member-management@accounts
  - rule:admins-alone-see-and-revoke-invitations@accounts
  - rule:invitations-carry-organization-roles-only@accounts
  - rule:invitations-are-limited@accounts
  - rule:one-pending-invitation-per-person@accounts
  - rule:only-the-invitee-can-accept@accounts
  - rule:accepting-makes-someone-a-member@accounts
  - rule:new-members-hold-their-roles-permissions@accounts
  - rule:revoked-invitations-cant-be-accepted@accounts
  - rule:anyone-can-leave-not-remove-others@accounts
  - rule:leaving-ends-access@accounts
  - rule:former-members-can-rejoin@accounts
  - rule:outsiders-cant-rename-an-organization@accounts
  - rule:organizations-start-without-a-logo@accounts
  - rule:organization-listings-show-logo-status@accounts
  - rule:logos-must-be-raster-images@accounts
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
concepts: [concept:capacity-block, concept:invoice@billing, concept:organization@accounts, concept:team]
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
