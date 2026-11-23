# Doc

One Markdown file describing one thing: a domain, feature, capability, rule,
concept, persona, system or component.

## Details

Its frontmatter holds what tools compute with, such as levels,
[links](link.md) and gaps. Its body holds what people read. No fact is in
both. Its `#` title is its name, and the paragraph under the title is its
summary.

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

Every doc is shaped the same way: frontmatter for tools, then the name, the
summary, and sections for people.
[`cancellations.md`](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/cancellations.md),
shortened:

```markdown
---
stability: alpha
personas: [front-desk-clerk]
rules:
  - cancellations/free-cancellation-window
  - cancellations/late-cancellation-fee
---

# Cancellations

Clerks cancel a booking when a guest's plans change, and the guest is refunded
what the cancellation policy allows.

## Covers

- Clerks tell a guest what they'd be refunded if they cancelled now.
```

There's no `id:` field: the path is the ID.

## Not to be confused with

- [State](state.md): what the indexer writes from the docs. Docs are declared;
  state is derived.
