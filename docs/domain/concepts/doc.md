# Doc

One Markdown file describing one thing: a domain, feature, capability, rule,
concept, persona, mechanism or component.

## Details

Its frontmatter is its structure: its name and description, its
[links](link.md), and every other part the spec names, such
as a capability's level and gaps, a persona's role or a rule's why. Its body is free Markdown
for anything more worth saying, in whatever shape suits it, and it's optional.
No fact is in both. Readers show its frontmatter as what the doc is, and its
body apart from it, as more about it, the same way for every type.

Something goes in frontmatter when the spec defines it, or when a tool or
reader needs to find, count, link, check or show it in a set place. Everything
else is body. What a doc must say is a required field, so a doc with no body
is complete. No heading in a body means anything to a tool, and readers show
the body whole, rendered as Markdown, without assuming its shape or size.

A doc's **ID** is declared in the doc, so it stays the same when the file is
renamed or moved, or the doc's name changes. Everything else names the doc by
**reference**, its type and ID, such as `rule:no-double-booking`, in docs and
code alike. What an ID identifies depends on the doc's type:

- **Domains, features, capabilities, personas, mechanisms and components**: one
  thing across every project. The same ID anywhere is a contribution to the
  same one.
- **Rules and concepts**: one definition within a domain. The same ID in two
  domains is two definitions.

## In the spec

Each type has a folder, which gives a doc its type. Within it, a doc's file
name and any folders it's in are the author's to choose and change. The ID is
the doc's `id` field:

| Type | Folder | Example ID |
| --- | --- | --- |
| domain | `docs/product/domains/<domain>/domain.md` | `guest-stays` |
| feature | `docs/product/domains/<domain>/features/` | `reservations` |
| capability | `docs/product/domains/<domain>/capabilities/` | `room-booking` |
| rule | `docs/product/domains/<domain>/rules/` | `no-double-booking` |
| concept | `docs/product/domains/<domain>/concepts/` | `booking` |
| persona | `docs/product/personas/` | `front-desk-clerk` |
| mechanism | `docs/technical/mechanisms/` | `deployment` |
| component | `docs/technical/components/` | `bookings` |

Every doc is shaped the same way: YAML frontmatter with its `id`, `name`,
`description` and its type's other fields, then an optional body.
[`cancellations.md`](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/cancellations.md),
shortened, has no body at all:

```markdown
---
id: cancellations
name: Cancellations
description: >-
  Clerks cancel a booking when a guest's plans change, and the guest is
  refunded what the cancellation policy allows.
stability: alpha
personas: [persona:front-desk-clerk]
rules:
  - rule:free-cancellation-window
  - rule:late-cancellation-fee
---
```

Two docs of one type with the same ID in one domain of a project are a
`duplicate-id` [problem](problem.md). Changing an ID is a breaking change:
everything that names it has to change with it.

## Not to be confused with

- [State](state.md): what the indexer writes from the docs. Docs are declared;
  state is derived.
