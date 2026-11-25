# Software product

The end result of one or more pieces of software working together to
accomplish a high-level goal: a web app, a mobile app and the API behind them,
or the services behind one app. Each piece is a [project](project.md), which
says which product it's part of in its `docket.yaml`, and Docket shows a
product's projects together, as one picture. "Product", for short.

## Details

The hotel's booking app and its billing service are two projects in one
product, Hotel. Shown together, Front desk is one feature with a part in
Guest stays from Hotel Bookings and a part in Billing from Hotel Billing.

- **It's what gets combined.** Docket puts the contributions of a product's
  projects together by ID, and finds
  [contradictions](contradiction.md) between them. Projects in different
  products are never combined, since they're different products and the same
  ID can mean different things in each.
- **One is shown at a time.** You choose a product, then which of its
  projects to show. Showing only some of them works out maturity and readiness
  from what those projects say, as for any set of projects.
- **A project without one is its own.** A project whose `docket.yaml` names
  no product is a product of one project, named after it.
- **It isn't a repository either.** Its projects can be in one repository or
  many: [Exalynt](../../../spec/examples/exalynt/)'s API and UI are two
  projects in one repository, and Hotel's are in two.
- **It's declared by its projects, not on its own.** There's no product file:
  the product is every project that names its ID. Adding a project to a
  product, or moving one to another, changes only that project's
  `docket.yaml`.
- **A [mechanism](mechanism.md) can apply across it**, to every capability
  its projects serve, when one project runs something for all of them, such as
  an API gateway's authentication.
- **It has no stability level.** Its maturity and readiness are worked out
  from everything its projects show, as if they were one project.

## In the spec

[`docket.yaml`](../../../spec/examples/hotel-bookings/docket.yaml) names the
product beside the project:

```yaml
project:
  id: hotel-bookings
  name: Hotel Bookings
product:
  id: hotel
  name: Hotel
```

The `id` is the same in every project in the product, and the `name` is what
people see, named for the product. Each project's [state](state.md) repeats it
in its header.

## Not to be confused with

- [Project](project.md): one source of state, such as a repository or a
  package in one. A product is one or more of them.
- [Domain](domain.md): a part of the business and its language. A product's
  projects work in domains, and a domain can be in several products, meaning
  something different in each.
- [Product docs](doc.md): the docs that say what a product does, in its
  domains' words, rather than how its projects build it.
- [Mechanism](mechanism.md): how something works across a whole project, as a
  technical doc says. A product is a set of projects, not a design.
