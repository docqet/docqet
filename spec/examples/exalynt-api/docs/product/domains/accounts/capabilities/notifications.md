---
name: Notifications
description: People choose which notifications they get and where they go.
stability: prototype
personas:
  - client-admin-founder
  - client-admin-operations
  - client-member
  - client-billing
  - exalynt-engineer-1
  - exalynt-engineer-2
  - exalynt-team-lead
  - exalynt-admin
  - partner
rules:
  - notifications/each-app-offers-its-own-notifications
  - notifications/nobody-hears-of-their-own-actions
  - notifications/notifications-respect-what-someone-can-see
  - notifications/turned-off-notifications-arent-sent
  - notifications/recipients-choose-the-channels
  - notifications/choices-are-private
  - notifications/one-set-of-choices-across-organizations
  - notifications/some-notifications-cant-be-turned-off
  - notifications/email-only-to-verified-addresses
  - notifications/what-clients-are-told
  - notifications/what-engineers-are-told
  - notifications/what-team-leads-are-also-told
  - notifications/what-admins-are-told
  - notifications/payout-release-reminders
  - notifications/what-partners-are-told
  - notifications/billing-and-member-notifications-follow-role
  - notifications/lost-access-stops-notifications
  - notifications/removed-channels-fall-back-to-others
  - notifications/removed-addresses-stop-email-immediately
gaps:
  - id: admins-see-engineer-choices-in-the-console
    summary: An admin who opens the console sees what engineers get there.
  - id: settings-can-differ-between-apps
    summary: >-
      A notification shown in several apps has one setting, but can start on
      in one and off in another until they change it, such as for a team lead
      who is also an admin.
  - id: choices-ignore-client-permissions
    summary: >-
      A client without billing access sees failed payments, and one who can't
      manage members sees members joining, as a client's permissions are per
      organization and these choices are made in none.
  - id: no-list-of-received-notifications
    summary: There's no list of notifications received in the app.
tradeoffs:
  - id: no-email-on-scheduling
    summary: >-
      Clients aren't emailed when a block is scheduled, or when an
      availability change affects their capacity: the client scheduled the
      block themselves, and an availability change that matters reaches them
      as a moved preferred week.
    drawbacks:
      - >-
        A client hears nothing of a scheduled block, nor of an availability
        change that doesn't move a preferred week.
  - id: placeholder-data
    summary: >-
      The list of notifications is placeholder data, Slack, Discord, and
      Microsoft Teams are pretend, and the choices are held in the browser
      until a reload.
    drawbacks:
      - Nothing is actually sent.
  - id: behind-a-feature-flag
    summary: It shows only while its feature flag is on.
    drawbacks:
      - Only those with the flag on can try it.
  - id: one-set-of-choices
    summary: >-
      One set of choices covers every organization someone belongs to, and
      each notification is to name the one it's about.
    drawbacks:
      - Someone in several organizations can't choose differently for each.
  - id: last-channel-stays
    summary: >-
      The last channel can't be removed, as what's always on needs somewhere
      to go. Being always on means at least one channel, not all of them.
    drawbacks:
      - Nobody can remove every channel to stop notifications altogether.
decisions:
  - question: Is this the right way to choose notifications?
  - question: Which notifications do people want at all?
---

## Includes

- Clients, engineers, admins and partners set up the channels their
  notifications can go to, such as the verified email addresses on their
  account.
- Clients are notified when a payment fails, an invoice is issued, or an invited
  member joins.
