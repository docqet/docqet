---
name: Row-level security
summary: >-
  Postgres enforces the organization and partnership boundaries underneath the
  application's Bounds, so a query that forgets its Bounds still can't cross
  them in a request acting in an organization or a partnership.
start: >-
  `conn.exec` in `internal/repositories/postgres/unit_of_work.go`,
  `internal/repositories/unit_of_work.go`, `ReachPartnership` in
  `internal/services/partnerships.go`, and the tests
  `row_level_security_integration_test.go` and
  `partnership_row_level_security_integration_test.go` in
  `internal/repositories/postgres`
capabilities:
  - organizations-and-members
  - access-tokens
  - getting-set-up
  - estimates
  - capacity-purchasing
  - client-home
  - scheduling
  - claiming-blocks
  - staffing
  - fulfillment
  - agreements
  - client-agreements
  - partner-agreements
  - billing
  - earnings
  - payout-accounts
  - partner-earnings
  - partner-payouts
  - partner-payout-accounts
  - partnerships
  - client-invitations
  - partner-clients
  - partner-home
code:
  - internal/repositories/postgres/unit_of_work.go
  - internal/repositories/unit_of_work.go
  - internal/services/partnerships.go
  - internal/repositories/postgres/row_level_security_integration_test.go
  - internal/repositories/postgres/partnership_row_level_security_integration_test.go
gaps:
  - id: no-organization-runs-on-platform
    text: >-
      `X-Organization-ID` is optional, so anyone signed in can leave it out
      and run on `api_platform`. Holding no platform role, they hold no
      permissions and `authz.Require` refuses them, so nothing crosses today,
      but Bounds are all that stand in the way.
  - id: shared-tables-unprotected
    text: >-
      Shared tables have no row-level security, `users` above all, as staff
      names appear across organizations: a query there that forgets to filter
      can read every user's name and email.
  - id: no-staff-audit-trail
    outcome: security/ga/traceable
    text: >-
      What staff read across organizations isn't recorded beyond the request's
      log line. Left out by decision for now.
  - id: taken-id-is-a-conflict
    text: >-
      A client-supplied ID that's already taken is a `409`, in any
      organization, as IDs are globally unique. Someone who already knows an ID
      can learn that it exists, and nothing else.
  - id: indexes-not-led-by-organization
    text: >-
      Existing indexes don't all lead with `organization_id`, as some serve
      staff's views across organizations.
tradeoffs:
  - id: setting-per-transaction
    text: >-
      The organization or partnership is set with `SET LOCAL` in a
      transaction around each statement, a `UnitOfWork`'s or a short one of
      its own, rather than on a connection kept for the request.
    cost: >-
      A statement outside a `UnitOfWork` costs three more round trips, so work
      issuing many belongs in one.
---

Every table holding an organization's records has an `organization_id`, filled
from its parent by a trigger, with row-level security forced. Every table with
a partnership's records that a request acting in one reaches has a
`partnership_id`, or is `partnerships` itself, the same way.

| Role | Connection | Used by | Reaches |
| --- | --- | --- | --- |
| `api_organization` | `DATABASE_ORGANIZATION_URL` | A request acting in an organization | That organization's rows, and shared tables as granted |
| `api_partner` | `DATABASE_PARTNER_URL` | A request acting in a partnership, as its manager | That partnership's rows. No organization's, and no shared table |
| `api_platform` | `DATABASE_PLATFORM_URL` | Staff, service actors, webhooks, the command line, and authentication | Every row. Bounds are all that limit it |
| The owner | `DATABASE_URL` | Migrations and `api provision database` | Everything; it skips row-level security |

The connection is picked in one place, `conn.exec`, from
`repositories.ScopeOf(ctx)`: the organization the Principal acts in, unless a
service has set another scope. On `api_organization`, every statement runs in a
transaction that sets `app.organization_id` with `SET LOCAL`: a `UnitOfWork`'s,
or a short one of its own. `api_partner` sets `app.partnership_id` the same
way. A statement with none set errors instead of returning rows.

**Acting in a partnership.** No header names one. A route with one in its path
reaches it through `services.ReachPartnership`, which reads who manages it on
`api_platform` and, for its manager, returns
`repositories.InPartnership(ctx, id)`. Everything after runs on `api_partner`,
except reading the partnership's clients (below). Admins holding
`partner:manage` stay on `api_platform`, as they do for organizations.

**Reaching across organizations.** A few things a request acting in an
organization does aren't that organization's. A service asks for them with
`repositories.AcrossOrganizations(ctx)`, which only changes the connection, so
Bounds still apply. Use it only for what really is shared: what belongs to the
person calling (the organizations they're in, creating another, their
invitations), and what's shared by every client (how full a week is, as a
total naming nobody).

**What a partner's connection doesn't reach.** `api_partner` reaches no
`users`, so a service reads people before it acts in the partnership. It
reaches no `organizations` either, so a manager's list of their partnership's
clients, which needs the clients' names, reads `partnership_clients` on
`api_platform` once `ReachPartnership` has allowed it
(`PartnershipClientService.List`). Only the query's `partnership_id` filter
keeps it to that partnership, and the policy does nothing there, so the filter
stays, and what it returns of a client is only its name. The other way round,
a client's people read the name of the partnership that referred it the same
way (`PartnershipClientService.ReferredBy`), keyed by their organization.

**Limited tokens.** A token limited to some organizations doesn't widen
through `AcrossOrganizations`: anything reading that way on the caller's
behalf honors `Principal.Limited()`.

**Policies.** Each role's policies name only that role. A table holding both
kinds of rows, such as `agreements`, has an `organization_isolation` policy for
`api_organization` and a `partnership_isolation` one for `api_partner`, and
neither evaluates the other's setting. `payout_recipients` holds people's and
partnerships' recipients. It's in `sharedTables`, as it has no
`organization_id`, but has row-level security: `api_partner` reaches only its
partnership's, `api_organization` only people's, and `api_platform` every one.
Nothing but the service's lookup by the caller keeps one person from
another's.

**Credentials.** The server refuses to start if any of the first three
connects as anyone else, or as a superuser or a role with `BYPASSRLS`. The
owner must be a superuser, or have `BYPASSRLS` and `CREATEROLE`. Only the
`migrate` Job has the owner's credential, not the API's pods (see
`.kube/secret.yaml`). Changing a password takes down any pod still using it.

**Adding a table** means deciding if it's an organization's, a partnership's,
or shared:

- **An organization's** has an `organization_id`, a trigger or a value for it,
  row-level security, both policies, and grants to `api_organization`.
- **A partnership's** is listed in `partnershipTables` in the partnership
  integration test. If a request acting in the partnership needs it, it has a
  `partnership_id`, row-level security, a `partnership_isolation` policy for
  `api_partner`, a `platform_access` one, and grants to `api_partner`.
- **A shared one** is listed in `sharedTables` in the integration test.

The integration tests fail for a table that's none of these.
`api_organization` and `api_partner` get nothing on a new table until a
migration grants it, and `api_platform` gets it by default.
