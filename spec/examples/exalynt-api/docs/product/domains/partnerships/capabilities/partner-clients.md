---
name: Partner clients
description: >-
  Partners see the clients attributed to their partnership: who they are, how
  each came to it, since when, and how long the partnership earns on each.
stability: beta
personas: [partner]
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
  - id: moving-restarts-since
    impact: damaging
    summary: >-
      Moving a client starts its "since" afresh, and nothing keeps the
      partnerships a client was attributed to before.
    when: Exalynt moves a client to another partnership.
  - id: no-attribution-notices
    impact: inconvenient
    summary: >-
      A partner isn't told when a client is attributed to them, moved, or
      removed.
  - id: phone-hides-how-and-window
    impact: inconvenient
    summary: >-
      On a phone, how each client came and its earning window aren't shown.
  - id: manual-attribution-from-partnerships
    outcome: security/alpha/stable-dependencies
    impact: blocking
    summary: >-
      Clients Exalynt attributes, moves, or removes by hand go through
      Partnerships, which is still Alpha.
    when: A breaking change in Partnerships.
---

## Includes

- Partners see the most recently attributed clients first, and how each came to
  them: their referral code, their invitation, or Exalynt.
- Partners see the latest clients at a glance where they land in the Partner
  Hub, and go on to all of them.

## Success

- Every partner sees, without asking Exalynt, which clients are attributed to
  their partnership, how each came, and how long it earns on each.
