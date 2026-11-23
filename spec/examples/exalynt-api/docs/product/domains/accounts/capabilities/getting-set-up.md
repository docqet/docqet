---
name: Getting set up
description: >-
  People see what they still have to set up: a client before work can start,
  an engineer before they're ready for client work, and a partner before they
  can be paid.
stability: alpha
personas:
  - client-admin-founder
  - client-admin-operations
  - exalynt-engineer-new-hire
  - partner
rules:
  - onboarding/engineers-join-by-invitation-only
  - onboarding/existing-accounts-gain-the-engineer-role
  - onboarding/admins-see-and-revoke-all-invitations
  - onboarding/invalid-payout-accounts-delay-payment
  - onboarding/when-an-engineer-is-ready
  - onboarding/invited-engineers-join-their-team
concepts: [organization, team]
gaps:
  - id: missing-for-some-client-roles
    summary: A client role that can't see capacity or teams doesn't have it.
  - id: client-steps-read-on-opening
    summary: >-
      For a client, it reads the blocks, the teams, and billing when the
      organization changes and on each opening, so on the client's home these
      are read twice. Changes made elsewhere show when it's next opened.
  - id: unreadable-list-hidden
    summary: >-
      If a client's or an engineer's list can't be read, it's reported and
      the list doesn't show.
  - id: list-unreachable-by-keyboard
    outcome: usability/beta/everyone
    summary: >-
      For clients and engineers, the keyboard can open the list but can't
      reach what's in it. The same places are in the app's navigation.
  - id: shown-to-everyone-in-the-console
    summary: >-
      Everyone opening the console has it, so someone already working, or an
      admin, has it too until they've done all four steps and, if their role
      can claim blocks, are on one.
  - id: console-overview-placeholder
    summary: >-
      The console's overview behind it is still placeholder data, even for
      someone new.
  - id: engineer-steps-read-on-every-page
    summary: >-
      For an engineer, it reads again on each page and on opening, four
      requests and a call to the payout provider each time, until it's all
      done.
  - id: team-placement-shows-late
    summary: >-
      Nothing tells an engineer they've been put on a team until they next
      move page.
  - id: readiness-not-acceptance-tested
    outcome: functionality/beta/stays-correct
    summary: >-
      Who's ready for client work is worked out on the person's own device,
      so no acceptance test covers it.
  - id: shown-to-everyone-in-the-partner-hub
    summary: >-
      Anyone with the Partner Hub has it, including engineers who also have
      the console.
  - id: unreadable-partner-payout-account
    summary: >-
      If a partnership's payout account can't be read, it's reported and only
      naming the partnership shows.
---

## Includes

- Clients see what's still needed, such as an assigned engineering team, a
  payment method, company details, capacity bought, or a week for the first
  block.
- Engineers see whether they're ready for client work.
- Engineers who are ready are told that they claim their work from Schedule,
  until they're on their first block.
