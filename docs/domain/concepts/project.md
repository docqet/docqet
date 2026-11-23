# Project

A place where software is defined, and usually implemented: one repository,
such as a GitHub repository, marked by a `docket.yaml` at its root that gives
the project's ID and name. Its docs say what the software can do and the rules
it follows, and its code and tests, when it has them, do it and prove it.

## Details

Hotel Bookings is a project: the hotel's booking app, where guests' stays are
booked, changed and checked in. Hotel Billing is another: the same hotel's
billing service, in a repository of its own, where guests' bills are kept and
paid.

- **It's metadata, not a boundary.** It says where each part of the picture
  comes from, so you can see who said what and show only what some projects
  define. It doesn't decide what words mean, which is a
  [domain](domain.md)'s job, and it groups nothing for its own sake.
- **Everything in its repository is its own**: every [doc](doc.md) and
  [annotation](annotation.md).
- **It works in one or more domains**, and contributes what it knows about
  each to the overall view. No project owns a domain, a feature or a
  capability. Docket puts every project's contributions together by ID. Hotel
  Bookings works in Guest stays and Property, and Hotel Billing in Billing and
  Finance. Both say something about check-out: bookings that clerks check
  guests out, billing that the guest's bill is settled as they go. Where they
  disagree, that's a [contradiction](contradiction.md).
- **Moving docs between projects changes no product doc.** Splitting a service
  out into a repository of its own makes a new project, but it creates,
  removes or renames no domain, feature or capability.
- **It's part of one [platform](platform.md)**: the projects that make up one
  product together, shown and combined as one. Hotel Bookings and Hotel
  Billing are both on Hotel. A project that names no platform is a platform of
  its own.
- **It has no stability level.** It has a [maturity](maturity.md), worked out
  from its parts of features. Several projects shown together have one too,
  worked out from all their parts the same way, as if they were one project.
  Showing only some projects works out each feature's and domain's maturity
  from what those projects say.

## In the spec

[`docket.yaml`](../../../spec/examples/hotel-bookings/docket.yaml) at the
repository root makes it a project:

```yaml
project:
  id: hotel-bookings
  name: Hotel Bookings
platform:
  id: hotel
  name: Hotel
```

The `id` names it wherever several projects are shown together, and the `name`
is what people see, named for the software, not for a domain. Which domains it
works in is the folders under `docs/product/domains/`, so nothing here says
it. `platform` is optional, as the [platform](platform.md) says.

Its [state](state.md) starts with the same, the commit it describes, and its
maturity:

```json
{
  "docket": "0.1",
  "project": { "id": "hotel-bookings", "name": "Hotel Bookings" },
  "platform": { "id": "hotel", "name": "Hotel" },
  "commit": "4f2c9e1",
  "summary": { "maturity": 60, "band": "beta", "domains": 2, "features": 3 }
}
```

## Not to be confused with

- [Platform](platform.md): the projects that make up one product. A project is
  one repository on it.
- [Domain](domain.md): a part of the business and its language. A project
  works in domains, and several projects can work in the same one.
