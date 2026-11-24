---
id: partnerships
name: Partnerships
description: >-
  Partnerships and what their managers do in them: invite clients, see the
  clients attributed to them, and accept their Partner Agreements. How a
  request acts in one is in the [row-level security
  doc](../mechanisms/row-level-security.md), and Partner Agreements themselves
  are in [agreements](agreements.md).
capabilities:
  - capability:partnerships
  - capability:client-invitations
  - capability:partner-clients
  - capability:partner-agreements
  - capability:partner-home
  - capability:organizations-and-members
tradeoffs:
  - id: limits-counted-from-invitations
    name: Sending limits counted from invitation rows
    impact: negligible
    likelihood: unlikely
    reach: few
    description: >-
      Sending limits are counted from the invitations themselves, not a
      limiter or a log of sends: the day's new invitations are a count of
      `client_invitations` rows created in the last 24 hours, revoked ones
      included, and a resend compares the row's `sent_at`, so nothing else is
      stored or run. That's why revoking sets `revoked_at` and blanks the
      address rather than deleting (migration 95): a deleted row would free up
      a slot, and the count needs no address.
    drawback: >-
      Two invitations at the same moment can both pass the 50th, and the count
      is a rolling 24 hours, not a calendar day.
    when: A partnership reaches the day's limit of 50 invitations.
---

**Earning windows.** A client's earning window on the clients list comes from
`EarningService.Windows`, one query for the page's clients
(`CapacityRepository.FirstBoughtFor`), and a partnership's earnings use the
same `windows`, so how a window opens changes in one place, or the list and
what's paid disagree.

**Revoked invitations.** Every read of `client_invitations` but
`CountInvitationsSince` leaves out revoked rows, as does the unique index on an
address, so a revoked address can be invited again. A new query does the same.

**How a client came.** `findReferral` records `invitation` rather than
`referral_code` when the code's partnership has a pending invitation to the
creator's address, since the invitation email's link carries the code.
Attributions made before that kept `referral_code`, so older clients who came
by invitation still read as by code.

**Who referred a client.** A client's people read who referred it through
`PartnershipClientService.ReferredBy` (`GET /organizations/{id}/referral`), on
`api_platform` once `requireOrganization` has allowed it, as no organization's
connection reaches `partnership_clients` or `partnerships`. Only its
`organization_id` key keeps it to that client, and what it returns is kept to
the partnership's name.

`ListClients` and `ListInvitations` stay unpaged for the platform's own lookups
(the admin list, attribution by address); the partner's listings go through
`PageClients` and `PageInvitations`.
