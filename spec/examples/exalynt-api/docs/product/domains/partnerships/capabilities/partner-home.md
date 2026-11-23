---
id: partner-home
name: Partner home
description: >-
  Partners land on the partnership they manage at a glance, with the clients
  it has brought in, how to bring in more, and how it earns.
stability: alpha
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
concepts: [concept:partnership, concept:capacity-payout-basis@pay, concept:payout-share@pay]
gaps:
  - id: failed-load-says-to-reload
    name: No retry when loading fails
    outcome: usability/beta/recover
    impact: inconvenient
    description: >-
      If the clients or what each block earns can't be loaded, it says to
      reload: there's no retry on it.
  - id: missing-account-reminder-dropped-silently
    name: Payout account reminder silently dropped
    outcome: functionality/alpha/errors-visible
    impact: inconvenient
    description: >-
      If the payout account can't be read, the reminder that there's none is
      left off, without saying so.
    when: The payout account can't be read.
  - id: not-verified-for-everyone
    name: Dark mode, phones and screen readers unverified
    outcome: usability/beta/everyone
    impact: blocking
    description: >-
      Dark mode, narrow phones, keyboard use, switching between partnerships,
      and real screen readers haven't been verified.
    when: >-
      Someone uses a keyboard only, a screen reader, a narrow phone, or dark
      mode.
---

## Includes

- Partners see the partnership's name and when it enrolled, and rename it.
- Partners see its latest clients, each with how it came to them and since when,
  and go on to all of them.
- Partners copy its referral code and sign-up link, or go on to invite someone
  by email.
- Partners see its terms, and what each kind of block earns on them: its share
  of that block's capacity payout basis.
- Partners are told when the partnership has no payout account to be paid into.
- Partners see what the partnership has earned, what's waiting to be paid out,
  and what's bought but not earned yet.
