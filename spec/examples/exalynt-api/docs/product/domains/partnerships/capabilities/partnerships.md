---
name: Partnerships
description: >-
  Partners Exalynt has enrolled each manage a partnership, and introduce
  people to Exalynt by giving them its referral code or inviting them by
  email.
stability: alpha
personas:
  - client-admin-founder
  - client-admin-operations
  - partner
  - exalynt-admin
rules:
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
  - joining/one-account-however-many-hats
  - joining/gaining-a-hat-takes-nothing-away
  - joining/invitations-go-to-an-email-address
  - joining/adding-a-hat-to-an-account
  - joining/invitations-stay-pending-until-resolved
  - joining/who-sees-and-revokes-pending-invitations
concepts: [partnership, agreement, capacity-payout-basis]
gaps:
  - id: partner-invitations-cant-be-resent
    summary: >-
      Admins can't resend a pending partner invitation: they revoke it and
      invite the same address again.
  - id: existing-clients-spotted-by-name-only
    summary: >-
      A company that's already a client can only be spotted by having the
      same name, so one signing up under another name counts as new.
  - id: no-handover-or-new-terms
    summary: >-
      Nothing hands a partnership to another manager, or sends it new terms.
  - id: invitation-email-omits-terms
    summary: >-
      The invitation email doesn't state the partnership's terms.
  - id: no-welcome-email
    summary: >-
      A partner gets no welcome email once they've accepted.
  - id: client-members-not-flagged-when-inviting
    summary: >-
      When inviting someone, whether an address is a client's member isn't
      shown; only Exalynt's team is named.
  - id: newest-invitation-only
    summary: >-
      With several invitations waiting, a partner sees the newest; the rest
      wait for another visit.
  - id: accepting-happens-in-steps
    summary: >-
      Accepting the invitation, naming the partnership, and accepting its
      Partner Agreement happen one after another: if naming fails, the
      partner is told to name it later, and if the agreement fails, the hub
      opens on it to accept.
  - id: partner-permission-granted-by-hand
    summary: >-
      Admins other than those with the Administrator role need the partner
      permission granted by hand.
  - id: attribution-needs-an-accepted-invitation
    summary: >-
      A client can only be attributed to a partnership whose invitation has
      been accepted.
  - id: admins-see-the-managers-readiness
    summary: >-
      An admin looking at a partnership sees whether its manager's own payout
      account can be paid, not the partnership's.
decisions:
  - topic: Referral codes over time
    question: >-
      Can a partner get a new code, for instance after sharing one too
      widely, and does the old one stop working?
  - topic: Changing terms
    question: >-
      Terms are set when inviting a partnership. Can an admin change them
      afterwards, and if so, does a change reach clients already
      attributed or only those attributed after it?
---

## Includes

- Exalynt enrolls clients, engineers, or established external partners.
- Clients sign up with a partner's referral code or link, and are told when
  signing up that the partner may earn from it.
- Partners accept Exalynt's invitation to the Partnership Program and its
  Partner Agreement in one step, reading the agreement first.
- Partners name the partnership after themselves or the business they partner
  for, and rename it.
- Partners see and copy the partnership's referral code and sign-up link, with a
  reminder to tell the people they share it with that they may earn from it.
- Partners see the partnership's terms: its share, what it's a share of, and how
  long it earns on each client, or that it has no time limit.
- Partners who manage several partnerships switch between them, viewing one at a
  time.
- Admins enroll a partner in the Partnership Program by inviting them by email,
  including someone who already has an account as a client member or engineer,
  and see any partnerships they already manage.
- Admins set a partnership's terms when inviting it, as its Partner Agreement's
  Commercial Terms, the same way as an engineer's: its Referral Share and its
  Earning Window, how long it earns on each client, or no time limit, starting
  from 5% of the engineering capacity referred clients purchase and have
  fulfilled within 12 months. Inviting with no Referral Share, or no terms at
  all, asks the admin to confirm first, since the partnership then earns
  nothing.
- Admins see pending partner invitations, with each one's email address, the
  partnership it's for, and when it was sent, and revoke one.
- Admins see the clients attributed to each partnership, with how each came to
  it and since when.
- Admins attribute a client to a partnership, which moves it from any other, and
  remove a client's attribution.
- Admins see each partnership's terms, and each of its clients' earning windows.
- Admins see what a partnership has earned, in total and on each client, block
  by block, and every payout sent to it.
