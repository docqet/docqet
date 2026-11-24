---
id: organizations-and-members
name: Organizations and members
description: >-
  Clients sign up, create the organization their people share, invite others
  to it, and give each member a role.
stability: ga
personas:
  - persona:client-admin-founder
  - persona:client-admin-operations
  - persona:client-member
  - persona:client-billing
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
  - rule:invitations-are-limited
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
  - rule:personal-things-follow-the-person
  - rule:team-rooms-are-shared-across-clients
  - rule:least-unfulfilled-capacity-wins@capacity
  - rule:fewest-clients-breaks-ties@capacity
  - rule:only-teams-offering-time-qualify@capacity
  - rule:signing-up-without-a-team@capacity
  - rule:one-account-however-many-hats
  - rule:gaining-a-hat-takes-nothing-away
  - rule:invitations-go-to-an-email-address
  - rule:adding-a-hat-to-an-account
  - rule:invitations-stay-pending-until-resolved
  - rule:who-sees-and-revokes-pending-invitations
  - rule:inviting-creates-the-partnership@partnerships
  - rule:accepting-makes-the-invitee-manager@partnerships
  - rule:the-manager-names-the-partnership@partnerships
  - rule:admins-set-terms-at-invitation@partnerships
  - rule:revoking-removes-the-partnership@partnerships
  - rule:managers-see-only-their-own-partnership@partnerships
  - rule:enrolling-is-voluntary@partnerships
  - rule:a-partnership-stands-apart-from-organizations@partnerships
  - rule:partnerships-can-change-managers@partnerships
  - rule:existing-accounts-gain-partner-access@partnerships
  - rule:partners-invite-clients-by-email@partnerships
  - rule:invitations-can-be-resent-or-revoked@partnerships
  - rule:invitations-are-limited@partnerships
  - rule:partners-see-only-their-own-invitations@partnerships
  - rule:one-referral-code-per-partnership@partnerships
  - rule:the-code-used-decides-the-partnership@partnerships
  - rule:referral-codes-attribute-only-new-clients@partnerships
  - rule:one-partnership-per-client@partnerships
  - rule:no-attribution-to-the-managers-organization@partnerships
  - rule:admins-can-adjust-attribution@partnerships
  - rule:no-earnings-on-other-partners@partnerships
  - rule:referred-clients-work-like-any-other@partnerships
  - rule:partners-see-only-their-own-clients@partnerships
  - rule:partners-see-each-clients-earning-window@partnerships
  - rule:what-partners-can-see@partnerships
  - rule:clients-see-who-referred-them@partnerships
  - rule:introductions-dont-affect-engineer-assignment@partnerships
concepts: [concept:organization, concept:role, concept:team@capacity]
gaps:
  - id: invitations-never-expire
    name: Invitations never expire and can't be resent
    impact: inconvenient
    likelihood: possible
    reach: few
    description: >-
      Invitations never expire and can't be resent: an Admin revokes one and
      invites the same address again.
  - id: sign-up-shows-the-team
    name: Sign-up reveals a team's contact details
    outcome: security/beta/misuse
    impact: inconvenient
    likelihood: unlikely
    description: >-
      Anyone who signs up sees the names and email addresses of the team
      they're given, with no one at Exalynt having looked at them first.
      Since anyone can create organizations, doing it again and again can
      show more than one team.
  - id: retention-not-decided
    name: Closed organizations' data never deleted
    outcome: security/beta/duties
    impact: damaging
    likelihood: unlikely
    description: >-
      Nothing of an organization's data is deleted after it closes, even on
      request.
  - id: no-privacy-notice
    name: No privacy notice at sign-up
    outcome: security/beta/duties
    impact: damaging
    likelihood: unlikely
    description: >-
      Sign-up doesn't link to a privacy notice, and the agreements with the
      services that hold people's details (sign-in, email, monitoring) aren't
      confirmed.
tradeoffs:
  - id: closing-by-email
    name: Closing the account by email
    impact: inconvenient
    likelihood: possible
    reach: few
    description: >-
      Closing the account is a conversation with Exalynt, by email from the
      Organization page.
    drawback: >-
      Nothing in the portal starts or tracks closing, and the organization isn't
      deleted afterwards.
  - id: fifty-invitations-a-day
    name: Fifty invitations a day
    impact: negligible
    likelihood: unlikely
    reach: few
    description: >-
      An organization, and each person, can send 50 invitations a day.
    drawback: >-
      An organization inviting more people than that waits until the next day.
    when: An organization invites more than 50 people in a day.
  - id: last-save-wins
    name: Last save wins on names and roles
    impact: inconvenient
    likelihood: unlikely
    reach: few
    description: >-
      The last save wins on the organization's name and on member roles:
      nothing checks what the person last read.
    drawback: >-
      Two people changing the same thing at once can undo each other's change
      without knowing.
    when: >-
      Two people change the organization's name, or the same member's role, at
      once.
  - id: any-role-from-member-management
    name: Member managers can give any role
    impact: damaging
    likelihood: unlikely
    description: >-
      Whoever can manage members can give anyone any role, Admin included.
    drawback: A role that manages members can do everything.
    when: >-
      Someone is given a role that manages members but isn't meant to do
      everything.
decisions:
  - topic: Keeping a closed organization's data
    question: How long is an organization's data kept after it closes?
    gaps: [retention-not-decided]
---

## Includes

- Clients log in.
- The software gives a client an engineering team on signing up.
- Clients accept an invitation to join an organization, signing up first if they
  don't have an account yet.
- Clients switch between the organizations they belong to, and create another.
- Clients update the organization's details, and its billing information on the
  payment provider's pages.
- Clients see which partner referred the organization, by name, when one did.
- Admins manage members, and give each one the Admin, Member, or Billing role.
- Admins see the organization's pending invitations, with each one's email
  address, role, and when it was sent.
- Admins revoke a pending invitation.
- Clients leave the organization.

## Success

- Not agreed with the client yet.
