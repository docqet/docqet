---
id: partner-clients
name: Partner clients
description: >-
  Partners see the clients attributed to their partnership: who they are, how
  each came to it, since when, and how long the partnership earns on each.
stability: beta
personas: [persona:partner]
rules:
  - rule:inviting-creates-the-partnership
  - rule:accepting-makes-the-invitee-manager
  - rule:the-manager-names-the-partnership
  - rule:admins-set-terms-at-invitation
  - rule:revoking-removes-the-partnership
  - rule:managers-see-only-their-own-partnership
  - rule:enrolling-is-voluntary
  - rule:a-partnership-stands-apart-from-organizations
  - rule:partnerships-can-change-managers
  - rule:existing-accounts-gain-partner-access
  - rule:partners-invite-clients-by-email
  - rule:invitations-can-be-resent-or-revoked
  - rule:invitations-are-limited
  - rule:partners-see-only-their-own-invitations
  - rule:one-referral-code-per-partnership
  - rule:the-code-used-decides-the-partnership
  - rule:referral-codes-attribute-only-new-clients
  - rule:one-partnership-per-client
  - rule:no-attribution-to-the-managers-organization
  - rule:admins-can-adjust-attribution
  - rule:no-earnings-on-other-partners
  - rule:referred-clients-work-like-any-other
  - rule:partners-see-only-their-own-clients
  - rule:partners-see-each-clients-earning-window
  - rule:what-partners-can-see
  - rule:clients-see-who-referred-them
  - rule:introductions-dont-affect-engineer-assignment
concepts: [concept:partnership]
gaps:
  - id: moving-restarts-since
    name: Moving a client loses its history
    impact: damaging
    description: >-
      Moving a client starts its "since" afresh, and nothing keeps the
      partnerships a client was attributed to before.
    when: Exalynt moves a client to another partnership.
  - id: no-attribution-notices
    name: Partners not told of attribution changes
    impact: inconvenient
    description: >-
      A partner isn't told when a client is attributed to them, moved, or
      removed.
  - id: phone-hides-how-and-window
    name: Phones hide client source and earning window
    impact: inconvenient
    description: >-
      On a phone, how each client came and its earning window aren't shown.
  - id: manual-attribution-from-partnerships
    name: Attributing by hand relies on Alpha Partnerships
    outcome: security/alpha/stable-dependencies
    impact: blocking
    description: >-
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
