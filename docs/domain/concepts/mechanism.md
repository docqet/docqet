# Mechanism

How something works across a whole project, such as deployment,
authentication or tenant isolation, so you need the whole picture to change it
safely.

## Details

Hotel Bookings' deployment is a mechanism: how a change gets from the main
branch to the hotel's server, and back off it again. Every capability Hotel
Bookings has built is shipped by it, so its gaps and the outcomes it meets are
every one of theirs. Expect a handful per repository.

It says how something works, not a convention or standard to follow. A
mechanism is one thing in the code, built once and relied on everywhere.

A mechanism is a technical doc, written in the code's words, so it follows
what [how it's built](../overview.md#how-its-built) says of them all: it holds
only what the code can't show, and has no level or domain of its own.

- **It applies to every [capability](capability.md) its project serves:** the
  ones the project declares, other than drafts, and the ones its
  [components](component.md) list. It lists none itself, so a new capability
  is covered as soon as it's declared. Its technical gaps show on each of
  them, under the hood.
- **Or to every capability its [platform](platform.md) serves**, when one
  repository runs it for all of them, such as authentication in an API gateway
  every service sits behind. Exalynt's authentication is one: every app's
  requests go through it.
- **It holds the technical [gaps](gap.md), [tradeoffs](tradeoff.md) and
  [open decisions](open-decision.md) about it.**
- **It can meet [checklist outcomes](stability-checklist.md)** for every
  capability it applies to. Each of them then shows the outcome as met, with
  evidence, and the mechanism's [evidence](evidence.md) is the proof.

## In the spec

A mechanism is a doc in `docs/technical/mechanisms/`. Its frontmatter holds its
name and summary, `applies`, `project` or `platform` and `project` when left
out, and what tools compute with. It names neither code nor capabilities: the
code points at it, and what it applies to is worked out, by the indexer for a
project, and when projects are combined for a platform, since no one
repository can see the others. Its body is how it works, in whatever shape explains it best, with no
heading.
[`deployment.md`](../../../spec/examples/hotel-bookings/docs/technical/mechanisms/deployment.md),
shortened:

```markdown
---
name: Deployment
summary: >-
  How a change gets from the main branch to the hotel's server, and back off
  it again.
meets:
  - reliability/beta/undo-release
  - observability/alpha/see-errors
gaps:
  - id: migrations-only-go-forward
    outcome: reliability/ga/recovery
    text: >-
      Migrations have no down step, so undoing a release that changed the
      schema means restoring the database from the night before.
---

Every merge to `main` builds one container image, tagged with the commit, and
deploys it. Rolling back deploys the previous tag. ...
```

The deploy workflow points back at it, `# docket:implements
mechanism:deployment` on its deploy job and `# docket:verifies
mechanism:deployment` on its rollback job. That says where it is, where to
start reading, and is the evidence that it meets
`reliability/beta/undo-release`.

## Not to be confused with

- [Component](component.md): one area of the code, relied on by the
  capabilities it lists. Something many capabilities share, such as the
  ledger, is still a component if it's one place in the code.
- [Feature](feature.md): a job the product does, in the domain's words. A
  mechanism is how part of the software works, in the code's.
- A convention or standard: how code should be written. A mechanism is how
  something already works.
