# Link

A relationship between two things, written once, in one direction: a feature
lists its capabilities, a capability its rules, a test the rule it verifies.

## Details

Docket works out the other direction, so nobody has to keep both sides in
step: which capabilities a rule applies to, which feature a capability is in,
which domains a feature spans, or which systems a capability relies on.

- **Only frontmatter and [annotations](annotation.md) count.** Links in a
  doc's body are ordinary Markdown links, for readers. The indexer reports any
  that are broken, but they're not relationships.
- **Product docs never link to technical docs.** Systems and components link
  to the capabilities that rely on them, so the product stays the same
  whatever the implementation.
- **A link to another domain's rule or concept names it**, as
  `booking@guest-stays`. Otherwise it means its own domain's, else the only one
  with that ID.

## In the spec

Every link the spec has, and the direction it's written in:

```text
feature                    → capabilities
capability                 → personas, rules, concepts, code
rule                       → concepts
gap                        → an outcome, a rule        (outcome, rule)
system, component          → capabilities, code, outcomes (meets)
annotation                 → rules, capabilities, systems, components    (docket:verifies, docket:implements)
                           → gaps, tradeoffs           (docket:gap, docket:tradeoff)
```

In frontmatter, the field name gives the type, so links are bare IDs:

```yaml
rules: [booking/no-double-booking]
concepts: [booking@guest-stays]
```

In an annotation, the type is part of the ID:
`docket:verifies rule:booking/no-double-booking`.

## Not to be confused with

- A body link: a relative Markdown link for readers, which the indexer checks
  but doesn't count as a relationship.
