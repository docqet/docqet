---
docqet: concept
id: product
domain: reporting
name: Software product
description: >-
  The end result of one or more pieces of software working together to
  accomplish a high-level goal: a web app, a mobile app and the API behind them,
  or the services behind one app. Each piece is a [project](../../authoring/concepts/project.md), which
  says which product it's part of in its `docqet.yaml`, and Docqet shows a
  product's projects together, as one picture. "Product", for short.
confused-with:
  - concept: "concept:project@authoring"
    summary: >-
      one source of state, such as a repository or a package in one. A product is one or more of them.
  - concept: "concept:domain@authoring"
    summary: >-
      a part of the business and its language. A product's projects work in domains, and a domain can be in several products, meaning something different in each.
  - concept: "concept:doc@authoring"
    summary: >-
      the docs that say what a product does, in its domains' words, rather than how its projects build it.
  - concept: "concept:mechanism@authoring"
    summary: >-
      how something works across a whole project, as a technical doc says. A product is a set of projects, not a design.
---

The hotel's booking app and its billing service are two projects in one
product, Hotel. Shown together, Front desk is one feature with a part in
Guest stays from Hotel Bookings and a part in Billing from Hotel Billing.

- **It's what gets combined.** Docqet puts the contributions of a product's
  projects together by ID, and finds
  [contradictions](contradiction.md) between them. Projects in different
  products are never combined, since they're different products and the same
  ID can mean different things in each.
- **One is shown at a time.** You choose a product, then which of its
  projects to show. Showing only some of them works out maturity and readiness
  from what those projects say, as for any set of projects.
- **A project without one is its own.** A project whose `docqet.yaml` names
  no product is a product of one project, named after it.
- **It isn't a repository either.** Its projects can be in one repository or
  many: [Exalynt](../../../../examples/exalynt/)'s API and UI are two
  projects in one repository, and Hotel's are in two.
- **It's declared by its projects, not on its own.** There's no product file:
  the product is every project that names its ID. Adding a project to a
  product, or moving one to another, changes only that project's
  `docqet.yaml`.
- **A [mechanism](../../authoring/concepts/mechanism.md) can apply across it**, to every capability
  its projects serve, when one project runs something for all of them, such as
  an API gateway's authentication.
- **It has no stability level.** Its maturity and readiness are worked out
  from everything its projects show, as if they were one project.

## How it's written

[`docqet.yaml`](../../../../examples/hotel-bookings/docqet.yaml) names the
product beside the project:

```yaml
project:
  id: hotel-bookings
  name: Hotel Bookings
product:
  id: hotel
  name: Hotel
```

- **`id`** is lowercase, with hyphens, and the same in every project in the
  product. Projects with the same product `id` are shown together and their
  docs combined.
- **`name`** is what people see, named for the product: Hotel, not Hotel
  Bookings. Every project in the product should give the same one; readers
  use the first project's.

Each project's [state](../../authoring/concepts/state.md) repeats it in its
header.

## Combining

Each project's `state.json` is indexed from its own repository, so it only
knows its own contributions. Showing several projects of one product
together **combines** their states:

1. Put each doc's contributions together by type and ID, as
   [domain](../../authoring/concepts/domain.md#putting-contributions-together)
   describes.
2. Resolve links to rules and concepts named in other projects' domains.
3. Give each mechanism that applies to its product every capability the
   product's projects serve: each project's declared capabilities, other
   than drafts, and the ones its components list.
4. Work out the reverse links again across everything, and each
   capability's level in short, the lowest across the domains that build it.
   Readers then work out [maturity](maturity.md),
   [readiness](readiness.md) and [risk](risk.md) from all of it.
5. Add the [problems](../../authoring/concepts/problem.md) combining finds:
   [contradictions](contradiction.md), and gap or tradeoff IDs declared in
   more than one project. Drop an `unknown-id` problem when the link resolves
   to another project's doc.
