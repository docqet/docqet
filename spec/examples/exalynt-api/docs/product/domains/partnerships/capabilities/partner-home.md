---
name: Partner home
summary: >-
  Partners land on the partnership they manage at a glance, with the clients
  it has brought in, how to bring in more, and how it earns.
stability: alpha
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
concepts: [partnership, capacity-payout-basis, payout-share]
gaps:
  - id: failed-load-says-to-reload
    outcome: usability/beta/recover
    text: >-
      If the clients or what each block earns can't be loaded, it says to
      reload: there's no retry on it.
  - id: missing-account-reminder-dropped-silently
    outcome: functionality/alpha/errors-visible
    text: >-
      If the payout account can't be read, the reminder that there's none is
      left off, without saying so.
  - id: not-verified-for-everyone
    outcome: usability/beta/everyone
    text: >-
      Dark mode, narrow phones, keyboard use, switching between partnerships,
      and real screen readers haven't been verified.
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
