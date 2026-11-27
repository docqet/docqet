---
docqet: component
id: focuses
name: Focuses
description: >-
  A block's focus: what its work is about, with images, videos, and files from
  its organization's objects.
is: archetype:http-api
serves: [capability:fulfillment]
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
