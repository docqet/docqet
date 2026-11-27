---
docqet: concept
id: link
name: Link
description: >-
  A relationship between two things, written once, in one direction: a
  capability names its feature, a feature its area, a test the rule it
  verifies.
confused-with:
  - term: "A Markdown link"
    summary: >-
      a relative link for readers, in a body or a frontmatter text value, which the indexer checks but doesn't count as a relationship.
---

Every link points one way and is written once, in the more concrete of the
two docs, naming the more general one. Across the spaces, that's toward why:
from code to technical docs, to product docs, to problem docs, though a link
can skip a space. Within a space, it's up: a capability names its feature,
and a feature its area.

```text
feature                    → area
capability                 → feature, problems (solves), initiatives, rules, concepts
initiative                 → personas
problem                    → personas
rule                       → concepts, constraints     (respects)
concept                    → concepts                  (confused-with)
gap                        → outcomes, rules           (affects)
tradeoff                   → outcomes                  (affects)
decision                   → outcomes, gaps, tradeoffs (affects)
component                  → capabilities, outcomes    (meets)
mechanism                  → outcomes (meets), constraints (respects)
annotation                 → rules, capabilities, mechanisms, components    (docqet:verifies, docqet:implements)
                           → gaps, tradeoffs           (docqet:gap, docqet:tradeoff)
```

The [indexer](indexer.md) computes the other direction, so nobody has to keep
both sides in step and the UI can show both: which capabilities are in a
feature, which features are in an area, which capabilities a rule applies
to, which initiatives are for a persona, or which mechanisms a capability
relies on. A list worked out this way has no order of its own, and readers
show it by name.

- **Only frontmatter link fields and [annotations](annotation.md) count.**
  They name docs by ID, so moving a file never breaks them. Markdown links,
  in a doc's body or in a frontmatter text value such as a description or a
  rule's why, are ordinary relative links, for readers. They're paths, so
  moving a file can break them, and the indexer reports any that are broken,
  but they're not relationships.
- **Product docs never link to technical docs.** Components link to the
  capabilities that rely on them, and a mechanism applies to every capability
  its project serves, so the product stays the same whatever the
  implementation.
- **The general doc never lists what's in it.** A feature doesn't list its
  capabilities, an area its features, or a persona the initiatives for them,
  so adding a capability changes only the capability's own doc.

## How it's written

A link is a [reference](doc.md#references), `<type>:<id>`, the same in
frontmatter as in an annotation, so searching for one finds every doc and
every place in the code that names it:

```yaml
feature: feature:reservations
rules: [rule:no-double-booking]
concepts: [concept:booking]
```

A concept's `confused-with` is a link too, when an item names a `concept`,
such as `concept: concept:booking`, rather than a `term`.

An annotation names it the same way: `docqet:verifies rule:no-double-booking`.
Rule and concept IDs are one across the product, so a link means the same doc
wherever it's written. A link to an ID nothing has is an `unknown-id`
[finding](finding.md).
