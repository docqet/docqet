# Link

A relationship between two things, written once, in one direction: a feature
lists its capabilities, a capability its rules, a test the rule it verifies.

## Details

Docket works out the other direction, so nobody has to keep both sides in
step: which capabilities a rule applies to, which feature a capability is in,
which domains a feature spans, or which mechanisms a capability relies on.

- **Only frontmatter link fields and [annotations](annotation.md) count.**
  Markdown links, in a doc's body or in a frontmatter text value such as a
  description or a rule's why, are ordinary relative links, for readers. The
  indexer reports any that are broken, but they're not relationships.
- **Product docs never link to technical docs.** Components link to the
  capabilities that rely on them, and a mechanism applies to every capability
  its project serves, so the product stays the same whatever the
  implementation.
- **A link to another domain's rule or concept names that domain**, as
  `concept:booking@guest-stays`. Otherwise it means its own domain's, and
  nothing else, so it never changes meaning when another domain adds a rule
  or concept with the same ID. An annotation is in no domain, so a rule it
  names always names its domain.

## In the spec

Every link the spec has, and the direction it's written in:

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
annotation                 → rules, capabilities, mechanisms, components    (docket:verifies, docket:implements)
                           → gaps, tradeoffs           (docket:gap, docket:tradeoff)
```

A link is a reference, `<type>:<id>`, the same in frontmatter as in an
annotation, so searching for one finds every doc and every place in the code
that names it:

```yaml
rules: [rule:no-double-booking]
concepts: [concept:booking@guest-stays]
```

A concept's `confused-with` is a link too, when an item names a `concept`,
such as `concept: concept:booking@guest-stays`, rather than a `term`.

An annotation names it the same way, with the rule's domain:
`docket:verifies rule:no-double-booking@guest-stays`.

## Not to be confused with

- A Markdown link: a relative link for readers, in a body or a frontmatter
  text value, which the indexer checks but doesn't count as a relationship.
