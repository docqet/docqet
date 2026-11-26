---
docqet: concept
id: link
domain: authoring
name: Link
description: >-
  A relationship between two things, written once, in one direction: a feature
  lists its capabilities, a capability its rules, a test the rule it verifies.
confused-with:
  - term: "A Markdown link"
    summary: >-
      a relative link for readers, in a body or a frontmatter text value, which the indexer checks but doesn't count as a relationship.
---

Every link points one way and is written once:

```text
feature                    → capabilities
capability                 → personas, initiatives, rules, concepts
rule                       → concepts
concept                    → concepts                  (confused-with)
gap                        → outcomes, rules           (affects)
tradeoff                   → outcomes                  (affects)
decision                   → outcomes, gaps, tradeoffs (affects)
component                  → capabilities, outcomes    (meets)
mechanism                  → outcomes                  (meets)
annotation                 → rules, capabilities, mechanisms, components    (docqet:verifies, docqet:implements)
                           → gaps, tradeoffs           (docqet:gap, docqet:tradeoff)
```

The [indexer](indexer.md) computes the other direction, so nobody has to keep
both sides in step and the UI can show both: which capabilities a rule
applies to, which feature a capability is in, which domains a feature spans,
or which mechanisms a capability relies on.

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

## How it's written

A link is a [reference](doc.md#references), `<type>:<id>`, the same in
frontmatter as in an annotation, so searching for one finds every doc and
every place in the code that names it:

```yaml
rules: [rule:no-double-booking]
concepts: [concept:booking@guest-stays]
```

A concept's `confused-with` is a link too, when an item names a `concept`,
such as `concept: concept:booking@guest-stays`, rather than a `term`.

An annotation names it the same way, with the rule's domain:
`docqet:verifies rule:no-double-booking@guest-stays`.

## Which rule or concept a link means

A link to a rule or concept means the one in the domain it names with
`@<domain>`, or, naming none, the one in its own domain: the domain of the
doc it's in. Nothing else is looked at, so what a link means never changes
because a doc was added or removed in another domain. A link that names no
domain and has nothing with that ID in its own is an `unknown-id`
[problem](problem.md), fixed by naming the domain it means.

An annotation in code is in no domain, so a rule it names always names its
domain too. One that doesn't is `invalid-annotation`.

In the examples, Billing's check-out uses `concept:booking`, and gets
Billing's definition, since that's its own domain's. Room status, in
Property, uses Guest stays' room as `concept:room@guest-stays`, since Property
has no `room` of its own.
