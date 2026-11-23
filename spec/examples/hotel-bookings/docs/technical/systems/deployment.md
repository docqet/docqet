---
capabilities: [room-booking, cancellations, check-in, check-out]
code: [.github/workflows/**, db/migrations/**]
meets:
  - reliability/beta/undo-release
  - observability/alpha/see-errors
gaps:
  - id: migrations-only-go-forward
    until: ga
    outcome: reliability/ga/recovery
    text: >-
      Migrations have no down step, so undoing a release that changed the
      schema means restoring the database from the night before.
---

# Deployment

How a change gets from the main branch to the hotel's server, and back off it
again.

**Code:** `.github/workflows/deploy.yml`

## How it works

Every merge to `main` builds one container image, tagged with the commit, and
deploys it. Rolling back deploys the previous tag. Migrations run before the
new image starts, from `db/migrations/`, in filename order.

## Gotchas

- A migration runs before the code that needs it, so the code that's still
  running has to work with the new schema for a minute. Add columns before
  using them, and remove them a release after the code stops reading them.

## Open decisions

- **Second instance:** once there's a second server, do releases switch over
  all at once, or one server at a time?
