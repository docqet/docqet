---
docket: concept
id: problem
domain: authoring
name: Problem
description: >-
  Something the indexer, or combining, found wrong in the docs, such as a link
  to a doc that doesn't exist, a capability in two features, or a
  [contradiction](../../reporting/concepts/contradiction.md) between projects.
confused-with:
  - concept: "concept:gap"
    summary: >-
      something the software doesn't do yet, declared on purpose. A problem is a mistake in the docs.
  - term: "No evidence"
    summary: >-
      a rule or capability nothing points at. That's neither a problem nor something left to do: it holds on trust.
---

Problems are about the docs, never the software: Docket checks that the docs
hold together, since they're only useful if they do. They're always derived,
and can be about anything. A `docket:gap` left behind after its gap was
closed, for example, is an `unknown-id`.

## Types

| Type                  | Raised when |
| --------------------- | ----------- |
| `unknown-id`          | A link, annotation, `affects` or `domain` names a doc, gap or tradeoff that doesn't exist. |
| `invalid-frontmatter` | A required field is missing, or a value isn't allowed, such as a link of the wrong type for its field, a `docket` that isn't a type, or a feature, capability, rule or concept with no `domain`. |
| `duplicate-id`        | A project has two docs of one type with the same ID in one domain, or two domains, personas, initiatives, mechanisms or components with the same ID, or a doc has two gaps or tradeoffs with the same key across the projects and domains that write it. |
| `broken-link`         | A relative link in a doc's body or a text value doesn't resolve. |
| `unlinked-rule`       | No capability follows a rule. |
| `in-two-features`     | More than one feature lists the same capability. |
| `contradiction`       | Contributions that should agree don't, as [contradiction](../../reporting/concepts/contradiction.md) describes. |
| `invalid-annotation`  | An annotation names a rule without its domain. |
| `unknown-outcome`     | An outcome in a gap's, tradeoff's or decision's `affects`, or in `meets`, isn't an outcome in [the expectations](expectations.md). |

`in-two-features` is a contradiction too, when the listings are in different
projects. [Combining](../../reporting/concepts/product.md#combining) raises
`contradiction`, `duplicate-id`, and `in-two-features` across projects.

## How it's written

Each is in the project's [state](state.md), with its type, what it's about,
the capabilities it affects, and a message. Hotel Billing had this one until
the refunds draft started following the rule:

```json
{
  "type": "unlinked-rule",
  "subject": "rule:overpayments-are-refunded",
  "capabilities": [],
  "message": "No capability follows this rule.",
  "domain": "billing"
}
```
