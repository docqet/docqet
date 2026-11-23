---
name: Organizations and members
description: >-
  Clients sign up, create the organization their people share, invite others
  to it, and give each member a role.
stability: ga
personas:
  - client-admin-founder
  - client-admin-operations
  - client-member
  - client-billing
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
  - organization-boundaries/personal-things-follow-the-person
  - organization-boundaries/team-rooms-are-shared-across-clients
  - team-assignment/least-unfulfilled-capacity-wins
  - team-assignment/fewest-clients-breaks-ties
  - team-assignment/only-teams-offering-time-qualify
  - team-assignment/signing-up-without-a-team
  - joining/one-account-however-many-hats
  - joining/gaining-a-hat-takes-nothing-away
  - joining/invitations-go-to-an-email-address
  - joining/adding-a-hat-to-an-account
  - joining/invitations-stay-pending-until-resolved
  - joining/who-sees-and-revokes-pending-invitations
  - partnerships/inviting-creates-the-partnership
  - partnerships/accepting-makes-the-invitee-manager
  - partnerships/the-manager-names-the-partnership
  - partnerships/admins-set-terms-at-invitation
  - partnerships/revoking-removes-the-partnership
  - partnerships/managers-see-only-their-own-partnership
  - partnerships/enrolling-is-voluntary
  - partnerships/a-partnership-stands-apart-from-organizations
  - partnerships/partnerships-can-change-managers
  - partnerships/existing-accounts-gain-partner-access
  - partnerships/partners-invite-clients-by-email
  - partnerships/invitations-can-be-resent-or-revoked
  - partnerships/invitations-are-limited
  - partnerships/partners-see-only-their-own-invitations
  - partnerships/one-referral-code-per-partnership
  - partnerships/the-code-used-decides-the-partnership
  - partnerships/referral-codes-attribute-only-new-clients
  - partnerships/one-partnership-per-client
  - partnerships/no-attribution-to-the-managers-organization
  - partnerships/admins-can-adjust-attribution
  - partnerships/no-earnings-on-other-partners
  - partnerships/referred-clients-work-like-any-other
  - partnerships/partners-see-only-their-own-clients
  - partnerships/partners-see-each-clients-earning-window
  - partnerships/what-partners-can-see
  - partnerships/clients-see-who-referred-them
  - partnerships/introductions-dont-affect-engineer-assignment
concepts: [organization, role, team]
gaps:
  - id: invitations-never-expire
    summary: >-
      Invitations never expire and can't be resent: an Admin revokes one and
      invites the same address again.
  - id: referral-relies-on-alpha-partnerships
    outcome: security/alpha/stable-dependencies
    summary: >-
      Which partner referred the organization comes from Partnerships, which
      is still Alpha.
  - id: logo-only-in-the-portal
    summary: >-
      Only the portal shows the organization's logo: the console and the
      admin still show initials.
  - id: team-assignment-by-load-only
    summary: >-
      Assigning a new client a team goes only by load, not by what kind of
      work suits a team, and two clients signing up at once can land on the
      same team.
  - id: sign-up-shows-the-team
    outcome: security/beta/misuse
    summary: >-
      Anyone who signs up sees the names and email addresses of the team
      they're given, with no one at Exalynt having looked at them first.
      Since anyone can create organizations, doing it again and again can
      show more than one team.
  - id: no-alert-on-failures
    outcome: observability/beta/hears-of-errors
    summary: >-
      Exalynt doesn't alert itself when sign-up, inviting or joining start
      failing: someone notices first.
  - id: success-not-agreed
    outcome: utility/beta/success-agreed
    summary: >-
      What success looks like hasn't been agreed with the client, so nothing
      yet shows it's met in real use.
  - id: no-availability-target
    outcome: reliability/ga/availability
    summary: No availability target has been agreed.
  - id: no-speed-target
    outcome: efficiency/ga/speed-targets
    summary: >-
      No response-time target has been agreed, and it hasn't been tried at
      peak load.
  - id: retention-not-decided
    outcome: security/beta/duties
    summary: >-
      How long an organization's data is kept after it closes isn't decided:
      nothing is deleted, even on request.
  - id: no-privacy-notice
    outcome: security/beta/duties
    summary: >-
      Sign-up doesn't link to a privacy notice, and the agreements with the
      services that hold people's details (sign-in, email, monitoring) aren't
      confirmed.
  - id: supported-browsers-not-stated
    outcome: compatibility/ga/every-platform
    summary: >-
      Which browsers and devices it supports isn't stated, and it hasn't been
      checked against them.
  - id: accessibility-standard-not-stated
    outcome: usability/ga/all-accessible
    summary: >-
      The accessibility standard it meets isn't stated, and it hasn't been
      checked against one.
  - id: no-support-commitments
    outcome: supportability/ga/help
    summary: >-
      There's no stated support response time, no status page or outage
      notice, and no commitment to review serious incidents.
tradeoffs:
  - id: closing-by-email
    summary: >-
      Closing the account is a conversation with Exalynt, by email from the
      Organization page.
    drawbacks:
      - Nothing in the portal starts or tracks it.
      - The organization isn't deleted afterwards.
  - id: fifty-invitations-a-day
    summary: >-
      An organization, and each person, can send 50 invitations a day.
    drawbacks:
      - >-
        An organization inviting more people than that waits until the next
        day.
  - id: members-unsorted-and-unpaged
    outcome: efficiency/beta/bounded
    summary: >-
      The list of members can't be sorted or paged: it shows every member, by
      name.
    drawbacks:
      - A large organization's list is long to look through.
  - id: last-save-wins
    summary: >-
      The last save wins on the organization's name and on member roles:
      nothing checks what the person last read.
    drawbacks:
      - >-
        Two people changing the same thing at once can undo each other's change
        without knowing.
  - id: any-role-from-member-management
    summary: >-
      Whoever can manage members can give anyone any role, Admin included.
    drawbacks:
      - A role that manages members can do everything.
  - id: initials-without-a-photo
    summary: A member without a photo of their own shows initials.
    drawbacks:
      - Members without a photo are told apart only by their initials.
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
