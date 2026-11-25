# Project

One piece of software that describes itself to Docket, as part of a
[software product](product.md): a folder marked by a `docket.yaml` that gives
the project's ID and name, with everything in it. It's where software is
defined, and usually implemented. Its docs say what the software can do and
the rules it follows, and its code and tests, when it has them, do it and
prove it. To Docket, it's a source of [state](state.md): each project is
indexed on its own.

## Details

Hotel Bookings is a project: the hotel's booking app, where guests' stays are
booked, changed and checked in. Hotel Billing is another: the same hotel's
billing service, where guests' bills are kept and paid. They could be two
repositories, or two folders in one.

- **It's metadata, not a boundary.** It says where each part of the picture
  comes from, so you can see who said what and show only what some projects
  define. It doesn't decide what words mean, which is a
  [domain](domain.md)'s job, and it groups nothing for its own sake.
- **It isn't a repository.** A repository can hold one project, at its root,
  or several, such as one per package of a monorepo, each in a folder with a
  `docket.yaml` of its own. Each is indexed into a state of its own, and
  shown, combined and sent to a server like a project in a repository of its
  own.
- **Everything in its folder is its own**: every [doc](doc.md) and
  [annotation](annotation.md), except what's in a folder inside it with a
  `docket.yaml` of its own, which is another project's.
- **It works in one or more domains**, and contributes what it knows about
  each to the overall view. No project owns a domain, a feature or a
  capability. Docket puts every project's contributions together by ID. Hotel
  Bookings works in Guest stays and Property, and Hotel Billing in Billing and
  Finance. Both say something about check-out: bookings that clerks check
  guests out, billing that the guest's bill is settled as they go. Where they
  disagree, that's a [contradiction](contradiction.md).
- **Moving docs between projects changes no product doc.** Giving a service a
  `docket.yaml` of its own, or moving it to a repository of its own, makes a
  new project, but it creates, removes or renames no domain, feature or
  capability.
- **It's part of one [software product](product.md)**: the end result of its
  projects working together, shown and combined as one. Hotel Bookings and
  Hotel Billing are both part of Hotel. A project that names no product is a product of
  its own.
- **It has no stability level.** It has a [maturity](maturity.md), worked
  out from its features, and a [readiness](readiness.md), from every
  capability it shows. Several projects shown together have both too, as if
  they were one project. Showing only some projects works out each feature's
  and domain's from what those projects say.

## In the spec

[`docket.yaml`](../../../spec/examples/hotel-bookings/docket.yaml) makes its
folder a project, here the repository's root:

```yaml
project:
  id: hotel-bookings
  name: Hotel Bookings
product:
  id: hotel
  name: Hotel
```

The `id` names it wherever several projects are shown together, and the `name`
is what people see, named for the software, not for a domain. Which domains it
works in is the domains it has domain docs for, so nothing here says it.
`product` is optional, as the [product](product.md) says.

Its [state](state.md) starts with the same, the commit it describes, and a
summary:

```json
{
  "docket": "0.1",
  "project": { "id": "hotel-bookings", "name": "Hotel Bookings" },
  "product": { "id": "hotel", "name": "Hotel" },
  "commit": "4f2c9e1",
  "summary": { "domains": 2, "features": 3 }
}
```

## Not to be confused with

- [Product](product.md): the projects that make up one product. A project is
  one source of state on it.
- Repository: where the files are kept. A repository holds one project or
  more, and a project is in one repository.
- [Domain](domain.md): a part of the business and its language. A project
  works in domains, and several projects can work in the same one.
