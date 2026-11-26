---
docket: concept
id: mechanism
domain: authoring
name: Mechanism
description: >-
  How something works across a whole project, such as deployment,
  authentication or tenant isolation, so you need the whole picture to change it
  safely.
confused-with:
  - concept: "concept:component"
    summary: >-
      one area of the code, relied on by the capabilities it lists. Something many capabilities share, such as the ledger, is still a component if it's one place in the code.
  - concept: "concept:feature"
    summary: >-
      a job the product does, in the domain's words. A mechanism is how part of the software works, in the code's.
  - term: "A convention or standard"
    summary: >-
      how code should be written. A mechanism is how something already works.
---

Hotel Bookings'
[deployment](../../../../examples/hotel-bookings/docket/mechanisms/deployment.md)
is a mechanism: how a change gets from the main branch to the hotel's server,
and back off it again. Every capability Hotel Bookings has built is shipped by
it, so its gaps and the outcomes it meets are every one of theirs. Exalynt's
authentication is another. Expect a handful per repository.

It says how something works, not a convention or standard to follow. A
mechanism is one thing in the code, built once and relied on everywhere.

A mechanism is a technical doc, as a [component](component.md) is: it says how
part of the software is built, in the code's words, for the engineer or agent
about to change it. It follows what [how it's built](../domain.md#how-its-built)
says of them all:

- **Only what the code can't say.** Leave out what a competent reader learns
  from the code in a few minutes, such as lists of endpoints, tables or
  functions. Most code has no doc.
- **No stability level, and no domain.** One doc can serve capabilities at
  different levels, and it's written in the code's words.
- **One across projects by ID.** The same ID in several projects is
  contributions to one, as for a feature.

## What it applies to

- **Every [capability](capability.md) its project serves**, by default: the
  ones the project declares, other than drafts, and the ones its components
  list. It lists none itself, so a new capability is covered as soon as it's
  declared, and its technical gaps and the outcomes it meets show on each of
  them, under the hood.
- **Or every capability its [product](../../reporting/concepts/product.md)
  serves**, with `applies: product`: what every project in the product
  serves, worked out the same way. It's for something one project runs for
  all of them, such as authentication in an API gateway that every service
  sits behind. Exalynt's
  [authentication](../../../../examples/exalynt/api/docket/mechanisms/authentication.md)
  applies to its product, since every app's requests go through it.

What it applies to is worked out, by the indexer for a project, and when
projects are combined for a product, since no one repository can see the
others.

## What it holds

- **The technical [gaps](gap.md), [tradeoffs](tradeoff.md) and
  [open decisions](open-decision.md) about it.**
- **The outcomes it meets**, from the [expectations](expectations.md), for
  every capability it applies to. Each of them then shows the outcome as met,
  with evidence, and the mechanism's [evidence](evidence.md) is the proof.

## How it's written

A mechanism is a doc whose `docket` is `mechanism`, outside any domain. Its
frontmatter, in order, is `docket`, `id`, `name`, `description`, `applies`,
`meets`, `gaps`, `tradeoffs` and `decisions`.

- **`applies`** says what it applies to: `project`, every capability its
  project serves, or `product`, every capability any project on its product
  serves. It's `project` when left out.
- **No doc names its code.** A mechanism or component is found in the code by
  its `docket:implements` [annotations](annotation.md), and a capability
  through the mechanisms that apply to it and the components that list it,
  since product docs never name their implementation. A mechanism names no
  capabilities either.
- **Its body** is usually how it works, including what's correct but would
  surprise whoever changes it, in whatever shape explains it best.

[`deployment.md`](../../../../examples/hotel-bookings/docket/mechanisms/deployment.md):

```markdown
---
docket: mechanism
id: deployment
name: Deployment
description: >-
  How a change gets from the main branch to the hotel's server, and back off
  it again.
meets:
  - outcome:reliability/beta/undo-release
  - outcome:observability/alpha/see-errors
gaps:
  - id: migrations-only-go-forward
    name: Migrations have no down step
    affects:
      - outcome:reliability/ga/recovery
    impact: damaging
    likelihood: possible
    description: >-
      Migrations have no down step, so undoing a release that changed the
      schema means restoring the database from the night before.
tradeoffs:
  - id: migrations-before-start
    name: Migrations run while the old release serves
    description: >-
      Migrations run before the new image starts, while the old one is still
      serving, rather than stopping the app for each release.
    benefit: Releases don't take the front desk offline.
    drawback: >-
      The running code has to work with the new schema for a minute, so a
      column is added a release before it's used, and removed a release after
      the code stops reading it.
---

Every merge to `main` builds one container image, tagged with the commit, and
deploys it. Rolling back deploys the previous tag. Migrations run before the
new image starts, from `db/migrations/`, in filename order.
```

The deploy workflow points back at it, `# docket:implements
mechanism:deployment` on its deploy job and `# docket:verifies
mechanism:deployment` on its rollback job. That says where it is, where to
start reading, and is the evidence that it meets
`outcome:reliability/beta/undo-release`.
