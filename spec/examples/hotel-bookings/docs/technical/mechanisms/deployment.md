---
id: deployment
name: Deployment
description: >-
  How a change gets from the main branch to the hotel's server, and back off
  it again.
meets:
  - reliability/beta/undo-release
  - observability/alpha/see-errors
gaps:
  - id: migrations-only-go-forward
    name: Migrations have no down step
    outcome: reliability/ga/recovery
    impact: damaging
    description: >-
      Migrations have no down step, so undoing a release that changed the
      schema means restoring the database from the night before.
    when: A release that changed the schema has to be undone.
tradeoffs:
  - id: migrations-before-start
    name: Migrations run while the old release serves
    impact: inconvenient
    description: >-
      Migrations run before the new image starts, while the old one is still
      serving, rather than stopping the app for each release.
    benefit: Releases don't take the front desk offline.
    drawback: >-
      The running code has to work with the new schema for a minute, so a
      column is added a release before it's used, and removed a release after
      the code stops reading it.
decisions:
  - topic: Second instance
    question: >-
      Once there's a second server, do releases switch over all at once,
      or one server at a time?
---

Every merge to `main` builds one container image, tagged with the commit, and
deploys it. Rolling back deploys the previous tag. Migrations run before the
new image starts, from `db/migrations/`, in filename order.
