---
id: notifications
name: Notifications
description: People choose which notifications they get and where they go.
stability: prototype
personas:
  - persona:client-admin-founder
  - persona:client-admin-operations
  - persona:client-member
  - persona:client-billing
  - persona:exalynt-engineer-1
  - persona:exalynt-engineer-2
  - persona:exalynt-team-lead
  - persona:exalynt-admin
  - persona:partner
rules:
  - rule:each-app-offers-its-own-notifications
  - rule:nobody-hears-of-their-own-actions
  - rule:notifications-respect-what-someone-can-see
  - rule:turned-off-notifications-arent-sent
  - rule:recipients-choose-the-channels
  - rule:choices-are-private
  - rule:one-set-of-choices-across-organizations
  - rule:some-notifications-cant-be-turned-off
  - rule:email-only-to-verified-addresses
  - rule:what-clients-are-told
  - rule:what-engineers-are-told
  - rule:what-team-leads-are-also-told
  - rule:what-admins-are-told
  - rule:payout-release-reminders
  - rule:what-partners-are-told
  - rule:billing-and-member-notifications-follow-role
  - rule:lost-access-stops-notifications
  - rule:removed-channels-fall-back-to-others
  - rule:removed-addresses-stop-email-immediately
tradeoffs:
  - id: no-email-on-scheduling
    name: No client email on scheduling or availability
    impact: negligible
    likelihood: possible
    reach: some
    description: >-
      Clients aren't emailed when a block is scheduled, or when an
      availability change affects their capacity: the client scheduled the
      block themselves, and an availability change that matters reaches them
      as a moved preferred week.
    drawback: >-
      A client hears nothing of a scheduled block, nor of an availability change
      that doesn't move a preferred week.
  - id: one-set-of-choices
    name: One set of choices for all organizations
    impact: inconvenient
    likelihood: possible
    reach: few
    description: >-
      One set of choices covers every organization someone belongs to, and
      each notification is to name the one it's about.
    drawback: >-
      Someone in several organizations can't choose differently for each.
    when: Someone belongs to several organizations.
  - id: last-channel-stays
    name: Last channel can't be removed
    impact: negligible
    likelihood: possible
    reach: few
    description: >-
      The last channel can't be removed, as what's always on needs somewhere
      to go. Being always on means at least one channel, not all of them.
    drawback: Nobody can remove every channel to stop notifications altogether.
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
