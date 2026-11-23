# Doc

One Markdown file describing one thing: a domain, feature, capability, rule,
concept, persona, system or component.

## Details

Its frontmatter is its structure: its name and summary, or a concept's
description, its [links](link.md), and every other part the spec names, such
as a capability's level and gaps, a persona's needs or a rule's why. Its body is free Markdown
for anything more worth saying, in whatever shape suits it, and it's optional.
No fact is in both.

Something goes in frontmatter when the spec defines it, or when a tool or
reader needs to find, count, link, check or show it in a set place. Everything
else is body. What a doc must say is a required field, so a doc with no body
is complete. No heading in a body means anything to a tool, and readers show
the body whole, rendered as Markdown, without assuming its shape or size.

A doc's **ID** is its path within its type's folder, so it can't drift from the
file. Renaming the file renames the doc. What it identifies depends on the
doc's type:

- **Domains, features, capabilities, personas, systems and components**: one
  thing across every project. The same ID anywhere is a contribution to the
  same one.
- **Rules and concepts**: one definition within a domain. The same ID in two
  domains is two definitions.

## In the spec

Each type has a folder, and the path under it is the ID:

| Type | Folder | Example ID |
| --- | --- | --- |
| domain | `docs/product/domains/` | `guest-stays` |
| feature | `docs/product/domains/<domain>/features/` | `reservations` |
| capability | `docs/product/domains/<domain>/capabilities/` | `room-booking` |
| rule | `docs/product/domains/<domain>/rules/` | `booking/no-double-booking` |
| concept | `docs/product/domains/<domain>/concepts/` | `booking` |
| persona | `docs/product/personas/` | `front-desk-clerk` |
| system | `docs/technical/systems/` | `ledger` |
| component | `docs/technical/components/` | `bookings` |

Every doc is shaped the same way: YAML frontmatter with its `name`,
`summary` and its type's other fields, then an optional body.
[`cancellations.md`](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/cancellations.md),
shortened, has no body at all:

```markdown
---
name: Cancellations
summary: >-
  Clerks cancel a booking when a guest's plans change, and the guest is
  refunded what the cancellation policy allows.
stability: alpha
personas: [front-desk-clerk]
rules:
  - cancellations/free-cancellation-window
  - cancellations/late-cancellation-fee
---
```

There's no `id:` field: the path is the ID.

## Not to be confused with

- [State](state.md): what the indexer writes from the docs. Docs are declared;
  state is derived.
