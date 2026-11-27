---
docqet: concept
id: product
name: Software product
description: >-
  The end result of one or more pieces of software working together to
  accomplish a high-level goal: a web app, a mobile app and the API behind them,
  or the services behind one app. Each piece is a [project](project.md), which
  says which product it's part of in its `docqet.yaml`, and Docqet shows a
  product's projects together, as one picture. "Product", for short.
confused-with:
  - concept: "concept:project"
    summary: >-
      one source of state, such as a repository or a package in one. A product is one or more of them.
  - concept: "concept:area"
    summary: >-
      a part of the product that groups features. A product's projects can each have features in the same area.
  - concept: "concept:doc"
    summary: >-
      the docs that say what a product does, in the business's words, rather than how its projects build it.
  - concept: "concept:mechanism"
    summary: >-
      how something works across a whole project, as a technical doc says. A product is a set of projects, not a design.
---

The hotel's booking app and its billing service are two projects in one
product, Hotel. Shown together, Front desk is one feature, with check-in
and check-out from Hotel Bookings and settling the bill at check-out from
Hotel Billing.

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
  many: [Exalynt](../../examples/exalynt/)'s API and UI are two
  projects in one repository, and Hotel's are in two.
- **It's declared by its projects, not on its own.** There's no product file:
  the product is every project that names its ID. Adding a project to a
  product, or moving one to another, changes only that project's
  `docqet.yaml`.
- **A [mechanism](mechanism.md) can apply across it**, to every capability
  its projects serve, when one project runs something for all of them, such as
  an API gateway's authentication.
- **It has no stability level.** Its maturity and readiness are worked out
  from everything its projects show, as if they were one project.

## How it's written

[`docqet.yaml`](../../examples/hotel-bookings/docqet.yaml) names the
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

Each project's [state](state.md) repeats it in its
header.

## Combining

Each project's `state.json` is indexed from its own repository, so it only
knows its own contributions. Showing several projects of one product
together **combines** their states:

1. Put each doc's contributions together by type and ID, as
   [below](#putting-contributions-together).
2. Give each mechanism that applies to its product every capability the
   product's projects serve: each project's declared capabilities, other
   than drafts, and the ones its components list.
3. Work out the reverse links again across everything, and each
   capability's level in short, the lowest across the projects that build
   it. Readers then work out [maturity](maturity.md),
   [readiness](readiness.md) and [risk](risk.md) from all of it.
4. Add the [findings](finding.md) combining finds:
   [contradictions](contradiction.md), and gap or tradeoff IDs declared in
   more than one project. Drop an `unknown-id` finding when the link resolves
   to another project's doc.

## Putting contributions together

A project writes one doc of each type with a given ID. The same ID in
another project of the product is a contribution to the same doc, whatever
its type, rules and concepts included.

- **Links are combined**: a feature's tradeoffs, a capability's problems,
  initiatives, rules, concepts, gaps and tradeoffs, a
  rule's concepts and constraints, a concept's `confused-with`, a problem's
  personas, an initiative's personas, a mechanism's or component's
  capabilities, outcomes, gaps and tradeoffs, and everything's evidence.
  Each contribution's order is kept, in the order the projects are read.
  What's worked out from them, such as a feature's capabilities or an area's
  features, has no order of its own, and readers show it by name.
- **A feature is in one area, and a capability in one feature.** Where
  projects name different ones, the first named is used, with a
  [finding](finding.md): a `contradiction` for a feature's area, and
  `in-two-features` for a capability's feature.
- **What a contribution says is its own**: its body, and its frontmatter
  fields that aren't links, such as `decisions` or a rule's `why`. Readers
  show each, labelled with its project. Its name and description, a
  persona's role and title, a problem's cost, and a constraint's source,
  should match the others'. Where they don't, that's a
  [contradiction](contradiction.md).
- **A capability's `stability` is per project.** Each contribution declares
  the level of its own part of the work. Where they differ, the capability's
  level in short is the lowest, and readers show each.
