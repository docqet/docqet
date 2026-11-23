# Platform

The projects that make up one product together: a web, mobile and desktop app
for the same service, or the microservices behind it. Each
[project](project.md) says which platform it's part of in its `docket.yaml`,
and Docket shows a platform's projects together, as one picture.

## Details

The hotel's booking app and its billing service are two projects on one
platform, Hotel. Shown together, Front desk is one feature with a part in
Guest stays from Hotel Bookings and a part in Billing from Hotel Billing.

- **It's what gets combined.** Docket puts the contributions of a platform's
  projects together by ID, and finds
  [contradictions](contradiction.md) between them. Projects on different
  platforms are never combined, since they're different products and the same
  ID can mean different things in each.
- **One is shown at a time.** You choose a platform, then which of its
  projects to show. Showing only some of them works out maturity and readiness
  from what those projects say, as for any set of projects.
- **A project without one is its own.** A project whose `docket.yaml` names
  no platform is a platform of one project, named after it.
- **It's declared by its projects, not on its own.** There's no platform file:
  the platform is every project that names its ID. Adding a project to a
  platform, or moving one to another, changes only that project's
  `docket.yaml`.
- **A [mechanism](mechanism.md) can apply across it**, to every capability
  its projects serve, when one project runs something for all of them, such as
  an API gateway's authentication.
- **It has no stability level.** Its maturity and readiness are worked out
  from everything its projects show, as if they were one project.

## In the spec

[`docket.yaml`](../../../spec/examples/hotel-bookings/docket.yaml) names the
platform beside the project:

```yaml
project:
  id: hotel-bookings
  name: Hotel Bookings
platform:
  id: hotel
  name: Hotel
```

The `id` is the same in every project on the platform, and the `name` is what
people see, named for the product. Each project's [state](state.md) repeats it
in its header.

## Not to be confused with

- [Project](project.md): one repository. A platform is one or more of them.
- [Domain](domain.md): a part of the business and its language. A platform's
  projects work in domains, and a domain can be on several platforms, meaning
  something different on each.
- [Mechanism](mechanism.md): how something works across a whole project, as a
  technical doc says. A platform is a set of repositories, not a design.
