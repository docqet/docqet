# Doc

One Markdown file describing one thing: a domain, feature, capability, rule,
concept, persona, initiative, mechanism or component.

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

A doc's **type**, its **ID** and its [domain](domain.md), if it has one, are
declared in the doc, so where its file is means nothing. It can be renamed,
moved or regrouped, and its ID stays the same when the doc's name changes. Everything else names the doc by
**reference**, its type and ID, such as `rule:no-double-booking`, in docs and
code alike. What an ID identifies depends on the doc's type:

- **Domains, features, capabilities, personas, initiatives, mechanisms and
  components**: one thing across every project. The same ID anywhere is a contribution to the
  same one.
- **Rules and concepts**: one definition within a domain. The same ID in two
  domains is two definitions.

## In the spec

A Markdown file is a doc when its frontmatter has `docket`, which gives its
type. Then comes its `id`, then `domain` for a feature, capability, rule or
concept. Files without `docket` aren't docs, and nothing reads them. Docs can
be anywhere in the repository. The recommended home is a `docket/` folder at
its root, with a folder per type and per domain:

| `docket` | Recommended folder | Example ID |
| --- | --- | --- |
| domain | `docket/domains/<domain>/domain.md` | `guest-stays` |
| feature | `docket/domains/<domain>/features/` | `reservations` |
| capability | `docket/domains/<domain>/capabilities/` | `room-booking` |
| rule | `docket/domains/<domain>/rules/` | `no-double-booking` |
| concept | `docket/domains/<domain>/concepts/` | `booking` |
| persona | `docket/personas/` | `front-desk-clerk` |
| initiative | `docket/initiatives/` | `busy-season` |
| mechanism | `docket/mechanisms/` | `deployment` |
| component | `docket/components/` | `bookings` |

Every doc is shaped the same way: YAML frontmatter with its `docket`, `id`,
`domain` if it's in one, `name`, `description` and its type's other fields,
then an optional body.
[`cancellations.md`](../../../examples/hotel-bookings/docket/domains/guest-stays/capabilities/cancellations.md),
shortened, has no body at all:

```markdown
---
docket: capability
id: cancellations
domain: guest-stays
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
