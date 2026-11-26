---
docket: concept
id: project
domain: authoring
name: Project
description: >-
  One piece of software that describes itself to Docket, as part of a
  [software product](../../reporting/concepts/product.md): a folder marked by a `docket.yaml` that gives
  the project's ID and name, with everything in it. It's where software is
  defined, and usually implemented. Its docs say what the software can do and
  the rules it follows, and its code and tests, when it has them, do it and
  prove it. To Docket, it's a source of [state](state.md): each project is
  indexed on its own.
confused-with:
  - concept: "concept:product@reporting"
    summary: >-
      the projects that make up one product. A project is one source of state on it.
  - term: "Repository"
    summary: >-
      where the files are kept. A repository holds one project or more, and a project is in one repository.
  - concept: "concept:domain"
    summary: >-
      a part of the business and its language. A project works in domains, and several projects can work in the same one.
---

Hotel Bookings is a project: the hotel's booking app, where guests' stays are
booked, changed and checked in. Hotel Billing is another: the same hotel's
billing service, where guests' bills are kept and paid. They could be two
repositories, or two folders in one.

- **It's metadata, not a boundary.** It says where each part of the picture
  comes from, so you can see who said what and show only what some projects
  define. It doesn't decide what words mean, which is a
  [domain](domain.md)'s job, and it groups nothing for its own sake.
- **It isn't a repository.** A repository can hold one project, at its root,
  as each example does, or several, such as one per package of a monorepo,
  each in a folder with a `docket.yaml` of its own, and needn't have one at
  its root. Every project in a repository is indexed at the same commits,
  each into a state of its own, written beside its `docket.yaml`, and is
  shown, combined and sent to a server as it would be from a repository of
  its own.
- **Everything in its folder is its own**: every [doc](doc.md) and
  [annotation](annotation.md), except what's in a folder inside it with a
  `docket.yaml` of its own, which is another project's, and what its
  [`.docketignore`](#ignoring-files) leaves out.
- **It works in one or more domains**: the domains it has domain docs for, so
  nothing in `docket.yaml` says which. It contributes what it knows about
  each to the overall view. No project owns a domain, a feature or a
  capability. Docket puts every project's contributions together by ID. Hotel
  Bookings works in Guest stays and Property, and Hotel Billing in Billing and
  Finance. Both say something about check-out: bookings that clerks check
  guests out, billing that the guest's bill is settled as they go. Where they
  disagree, that's a [contradiction](../../reporting/concepts/contradiction.md).
- **Moving docs between projects changes no product doc.** Giving a service a
  `docket.yaml` of its own, or moving it to a repository of its own, makes a
  new project, but it creates, removes or renames no domain, feature or
  capability.
- **It's part of one [software product](../../reporting/concepts/product.md)**: the end result of its
  projects working together, shown and combined as one. Hotel Bookings and
  Hotel Billing are both part of Hotel. A project that names no product is a
  product of its own.
- **It has no stability level.** It has a [maturity](../../reporting/concepts/maturity.md), worked
  out from its features, and a [readiness](../../reporting/concepts/readiness.md), from every
  capability it shows. Several projects shown together have both too, as if
  they were one project. Showing only some projects works out each feature's
  and domain's from what those projects say.

## Config

[`docket.yaml`](../../../../examples/hotel-bookings/docket.yaml) marks the
folder it's in as a Docket project, here the repository's root:

```yaml
project:
  id: hotel-bookings
  name: Hotel Bookings
product:
  id: hotel
  name: Hotel
```

- **`project`** says where each doc comes from.
  - **`id`** names the project wherever several are shown together, so it's
    unique among them. It's lowercase, with hyphens, like a doc's ID.
  - **`name`** is what people see, named for the software, not for a domain:
    Hotel Bookings, not Guest stays.
- **`product`**, optional, says which
  [software product](../../reporting/concepts/product.md) the project is part
  of, with its own `id` and `name`, as the product describes.

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

## What's in a repository

```text
docket.yaml                              config: the project's ID and name
.docketignore                            optional: files that aren't part of the project, in gitignore's syntax
docket/                                  the docs, laid out as you like; this layout is recommended
├── personas/                            who the software serves, across every domain
├── initiatives/                         bodies of work, across every domain
├── domains/
│   └── <domain>/                        a folder per domain the project works in
│       ├── domain.md                    the domain's ID, name and summary
│       ├── features/                    the product's jobs, each grouping capabilities
│       ├── capabilities/                the only docs with a stability level
│       ├── rules/                       one rule per file, in folders of your own, such as by topic
│       └── concepts/
├── mechanisms/                          how something works across the project
└── components/                          how one area of the code is built
<code and tests, anywhere>               docket:implements, verifies, gap and tradeoff comments
.docket/state.json                       written by `docket index`, gitignored
```

**Nothing depends on where a doc is.** Each doc says what it is in its
frontmatter: its type in `docket`, its ID, and its domain, if it's in one (see
[IDs](doc.md#ids)). A Markdown file is a Docket doc when its frontmatter has
`docket`, wherever it is in the project, and every other file is left alone.
The layout above starts at the project's folder, the one with its
`docket.yaml`, less anything its [`.docketignore`](#ignoring-files) leaves
out. Files can be renamed, moved and put in folders of the author's own, and
nothing breaks.

The layout above is what we recommend, and what the examples use. A
`docket/` folder beside `docket.yaml` keeps the docs together, and apart from
any other docs the project has. It has no dot because people write it.
`.docket/`, with a dot, holds only what tools write. Within `docket/`, a
folder per type, and per domain, makes each doc easy to find. Group them
differently where that suits the project better.

In the examples, `.docket/state.json` is checked in so you can read it. In a
real repository it's gitignored.

## Ignoring files

A `.docketignore` beside `docket.yaml` lists files and folders that aren't
part of the project, so nothing is read from them: no docs, and no
annotations. It's for files that mention Docket without being about the
project, such as docs that show example annotations, which would otherwise
be read as the project's own evidence.

```gitignore
# Docs about the format, with example annotations about other projects.
/docs/format/
```

- **It's written in [gitignore's syntax](https://git-scm.com/docs/gitignore#_pattern_format)**:
  `#` comments, `*`, `?`, `[...]` and `**` globs, a leading or inner `/` to
  anchor a pattern to the project's folder, a trailing `/` to match only
  folders, and `!` to bring back what an earlier pattern left out. As in git,
  nothing in an ignored folder can be brought back.
- **Paths are relative to the project's folder**, and only the project's own
  `.docketignore` is read, not one in a folder inside it.
- **It's read at each commit as it was then**, like every other file, so
  indexing an old commit leaves out what was ignored at that commit.
- **It adds to what's already left out**: what git ignores, and folders with
  a `docket.yaml` of their own.
