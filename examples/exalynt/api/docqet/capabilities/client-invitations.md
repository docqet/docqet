---
docqet: capability
id: client-invitations
name: Client invitations
description: >-
  Partners invite people they know to become Exalynt clients by email, and
  each one who signs up as a new client is attributed to their partnership.
stability: beta
feature: feature:partner-program
solves: [problem:introductions-take-effort, problem:engineering-starts-slowly]
initiatives: [initiative:mvp]
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
  - rule:partnership-invitations-are-limited
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
  - id: existing-clients-spotted-by-name-only
    name: Existing clients spotted by name only
    impact: inconvenient
    likelihood: unlikely
    reach: few
    description: >-
      A company that's already a client can only be spotted by having the
      same name, so one signing up under another name counts as new.
  - id: email-law-not-reviewed
    name: Email law not reviewed, and no opt-out
    affects:
      - outcome:security/beta/duties
    impact: damaging
    likelihood: unlikely
    reach: all
    description: >-
      What the law asks of email a partner has Exalynt send to someone who
      never asked for it, such as a way to opt out, hasn't been reviewed, and
      the invitation has no opt-out.
tradeoffs:
  - id: revoked-links-still-attribute
    name: Revoking leaves the emailed link working
    description: >-
      Revoking an invitation doesn't stop its link: the email still has the
      link with the partnership's referral code.
    drawback: >-
      Whoever uses a revoked invitation's link is still attributed to the
      partnership.
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
