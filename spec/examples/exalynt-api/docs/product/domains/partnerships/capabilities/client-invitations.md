---
name: Client invitations
description: >-
  Partners invite people they know to become Exalynt clients by email, and
  each one who signs up as a new client is attributed to their partnership.
stability: beta
personas: [partner, client-admin-founder, client-admin-operations]
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
concepts: [partnership]
gaps:
  - id: different-address-stays-sent
    name: Different sign-up address leaves invitation sent
    impact: negligible
    description: >-
      An invitation stays marked as sent when the person signs up with a
      different address from the one invited, though the link still
      attributes them.
    when: Someone signs up with a different address from the one invited.
  - id: existing-clients-spotted-by-name-only
    name: Existing clients spotted by name only
    impact: damaging
    description: >-
      A company that's already a client can only be spotted by having the
      same name, so one signing up under another name counts as new.
    when: A company that's already a client signs up under another name.
  - id: email-law-not-reviewed
    name: Email law not reviewed, and no opt-out
    outcome: security/beta/duties
    impact: damaging
    description: >-
      What the law asks of email a partner has Exalynt send to someone who
      never asked for it, such as a way to opt out, hasn't been reviewed, and
      the invitation has no opt-out.
  - id: referral-codes-from-partnerships
    name: Referral codes rely on Alpha Partnerships
    outcome: security/alpha/stable-dependencies
    impact: blocking
    description: >-
      The partnership's referral code, which every invitation carries, can
      only be attributed while its partnership is set up in Partnerships,
      which is still Alpha.
    when: A breaking change in Partnerships.
tradeoffs:
  - id: revoked-links-still-attribute
    name: Revoking leaves the emailed link working
    impact: inconvenient
    description: >-
      Revoking an invitation doesn't stop its link: the email still has the
      link with the partnership's referral code.
    drawback: >-
      Whoever uses a revoked invitation's link is still attributed to the
      partnership.
    when: Someone uses a revoked invitation's link.
---

## Includes

- Partners see the invitations the partnership has sent, newest first, and
  whether each has signed up.
- Partners resend an invitation, or revoke it.
- Partners are told when the partnership has sent as many new invitations as it
  can in a day, 50, or an invitation was sent too recently to resend, and when
  to try again.
- Clients sign up from a partner's email invitation, and are told when signing
  up that the partner may earn from it.

## Success

- Partners invite people they know by email without help, and each one who signs
  up as a new client is attributed to the partnership that invited them.
