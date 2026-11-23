---
name: Focuses
summary: >-
  A block's focus: what its work is about, with images, videos, and files from
  its organization's objects.
start: >-
  `services.FocusService` (`internal/services/focuses.go`),
  `internal/repositories/postgres/focus.go`, migrations
  `00087_focuses_and_fulfillment.sql`, `00089_shared_focuses.sql` and
  `00093_clients_change_focuses.sql`
capabilities: [fulfillment]
code:
  - internal/services/focuses.go
  - internal/repositories/postgres/focus.go
  - internal/database/migrations/00087_focuses_and_fulfillment.sql
  - internal/database/migrations/00089_shared_focuses.sql
  - internal/database/migrations/00093_clients_change_focuses.sql
---

A focus is its own row in `focuses`, with `focus_attachments`, and blocks point
at it by `capacities.focus_id`, which several blocks can share.
`FocusService.Use` keeps them to the focus's own organization; nothing in the
schema does.

**Who may change a focus** follows `focusBounds`
(`internal/services/capacity_reach.go`) on any block it's on:
`capacity:manage` for Exalynt's people, or, since that's platform-only,
`focus:manage`, which only an organization role grants, for the client's own
blocks. `Update` locks every such block. A focus on no block has no block to
check, so `FocusService` treats it as not found for changes, while it can still
be read and put back on a block.

`GET /focuses` checks those bounds reaching the organization, or else lists the
caller's blocks of that organization to see they manage one. That list is
unpaginated, fine for an engineer's own blocks.

**Row-level security.** `focuses` and `focus_attachments` are
organization-scoped with row-level security, and `api_organization` may insert
and update focuses and insert and delete their attachments, never delete a
focus. Its policies keep a client to its own. An attachment row carries its
own `organization_id` for its policy, which `checkAttachments`
(`internal/services/attachments.go`, shared with
[work updates](work-updates.md)) keeps equal to its focus's by refusing another
organization's object.
