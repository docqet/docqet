---
name: Work updates
description: >-
  What engineers write about a block's work as they do it, shown on its page
  with when it was started and fulfilled.
capabilities: [fulfillment]
gaps:
  - id: orphaned-objects
    text: >-
      An object uploaded for an update that then fails to post, or taken off
      an update by an edit or delete, stays in the client's organization.
      Focuses do the same.
---

**Blocks and focuses.** `work_updates.capacity_id` and `focus_id` are both
nullable, so an update can be about a focus alone, but no CHECK requires one
of them: `WorkUpdateService` always sets the block. Nothing posts or lists
focus-only updates yet, and `writers` treats one as not found. Adding them
means deciding whose permission reaches a focus on no block. Updates are
listed by `capacity_id` only, so an update stays on the block it was posted on
even after the block's focus changes, and the focus it was about is only its
`focus_id`.

**Who writes.** `work_updates` and `work_update_attachments` are
organization-scoped with row-level security, and `api_organization` has
`SELECT` only. Only a request acting in no organization writes one.

**Deleting** keeps the row: `Delete` empties text, metrics, links, and
attachments and sets `deleted_at`. The list returns deleted updates, so
clients show them as deleted rather than drop them.

**Links and metrics** are JSONB that only the service checks. Links are http
or https only, because the UI renders them as `href`s in the client's browser,
and the service keeps that check.

**Attachments.** Attachment bytes are served safely by
`GET /objects/{id}/content` (attachment, nosniff, sandboxed), but the ui reads
them into object URLs, which belong to the app's origin and keep the
uploader's content type. Every ui page that reads them goes through
`objectURLOf` (ui `src/services/exalynt/objects.ts`), which keeps only plain
images and videos renderable, or an uploaded SVG or HTML file opened in a tab
runs as the app. The portal will too, once it reads real updates.

**Who started a block** is `capacities.started_by`, which isn't always its
engineer: `Start` takes `capacity:manage` at team or global scope too. Blocks
started before migration 00088 have no `started_at`.
