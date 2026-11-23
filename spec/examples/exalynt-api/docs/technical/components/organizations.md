---
name: Organizations
description: >-
  Client organizations, their members, invitations, payment customer, and
  logo.
capabilities: [organizations-and-members, client-directory, billing]
meets: [security/ga/sound]
gaps:
  - id: shapes-shared-with-less-stable-capabilities
    name: Response shapes shared with less stable capabilities
    outcome: compatibility/ga/stable-interface
    impact: inconvenient
    description: >-
      `GET /organization-roles`, the only way an API caller gets the role IDs
      to invite with or set a member's role, belongs to roles and returns its
      whole `OrganizationRole`, permissions included. The `Organization` schema
      is also what `GET /clients` returns. Changing either changes what
      organizations and members relies on, so both are additive only.
    when: >-
      Roles needs to change `OrganizationRole`, or `GET /clients` needs to
      change `Organization`, in a way that isn't additive.
  - id: sends-and-keys-never-pruned
    name: Invitation sends and creation keys never pruned
    outcome: efficiency/beta/bounded
    impact: negligible
    description: >-
      `organization_invitation_sends` and `organization_creation_keys` are
      never pruned: only the last day of sends and a retry's key are ever read,
      but rows stay forever. They're small, at most 50 sends per organization
      a day.
  - id: no-load-test
    name: Never load-tested, running cost unknown
    outcome: efficiency/ga/speed-targets
    impact: blocking
    description: >-
      The routes have never been tried at peak, and their running cost isn't
      known, including whether Clerk's plan limits fit expected sign-ups.
    when: Traffic reaches its peak, or sign-ups outgrow Clerk's plan limits.
  - id: rollback-and-restore-untried
    name: Rollback and restore never practised
    outcome: reliability/ga/recovery
    impact: damaging
    description: >-
      Deploys roll back by re-running an older commit, and there's a runbook
      for restoring deleted records from a backup, but neither has been
      practised for organizations.
    when: A deploy needs rolling back, or deleted records need restoring.
tradeoffs:
  - id: lists-returned-whole
    name: Lists returned whole, not paged
    outcome: efficiency/beta/bounded
    impact: inconvenient
    description: >-
      Members, invitations, and `GET /v1/clients` are returned whole, not
      paged: an organization is sized for tens of members and Exalynt for tens
      to hundreds of clients.
    drawback: >-
      The last-manager check reads every member and organization role on each
      removal and role change.
    when: An organization grows well beyond tens of members.
  - id: shared-invitation-routes
    name: Invitation routes shared, with stable copies beside
    impact: negligible
    description: >-
      `GET /invitations` and `POST /invitations/{id}/accept` stay shared, with
      stable organization-only copies beside them: they also serve invitations
      to work with Exalynt and to manage a partnership, whose shape is still
      settling, so the stable contract for organizations is
      `/users/me/organization-invitations`.
    drawback: >-
      There are two ways to list and accept an organization's invitation, and
      onboarding reads both listings.
---

Who made each change is the `user_id` on its request's log line, and `user.id`
on its span: there's no audit table. Closing an account is done by hand, by the
close-an-organization runbook, and the organization routes' alert links the
respond-to-organization-errors runbook.

Security was reviewed on 2026-11-19, for GA, by reading the code: routes and
permissions, invitation acceptance, row-level security, logos, email, logs,
and sign-up. It led to the daily invitation cap per person as well as per
organization, treating a primary address Clerk marks unverified as none, and a
sign-in redirect that can't name another host. What it accepted is the
`member:manage` tradeoff in [authorization](../mechanisms/authorization.md).

**Invitations.** The daily invitation cap counts
`organization_invitation_sends`, not invitations, which are deleted when
accepted or revoked. It counts the organization's sends or the inviter's,
across organizations, so it's read across organizations before the
transaction, unlocked: invitations sent at the same moment can go a few over.
An invitation is saved and its email sent in one transaction, so a failing
email provider fails the request with `500` and nothing is saved.

**Creating one.** `POST /organizations` with an `Idempotency-Key` returns the
organization the caller first created with it (`organization_creation_keys`,
keyed by user and key), whatever name the retry sends. A retry that races the
first request waits on the key's unique index, then returns the first's
organization.

**The last manager.** The last-manager check locks the organization's row
(`SELECT … FOR UPDATE`), so two changes at once can't each count on the other
member to remain.

**The payment customer.** `EnsurePaymentsCustomer` runs when someone goes to
manage billing, not at sign-up, so its failures show on
`POST /v1/billing-sessions` and not on these routes. It calls the provider
while holding the organization's row, with a 10-second timeout, so a slow
provider fails the request instead of holding every other change to the
organization.

- Creating a customer is idempotent: it looks by the ID on record, then by the
  organization's ID in metadata, and carries an idempotency key. If the
  database write fails after the provider created one, the next call finds
  it.
- Nothing overwrites a customer's details afterward, including renaming the
  organization, so invoices keep the name the client gave the provider.

**Logos.** A logo's bytes are stored first under a new key, then the row
points at them under the lock, and the old bytes are deleted at once. A failed
delete strands bytes with nothing pointing to them, which costs nothing for a
reader.
