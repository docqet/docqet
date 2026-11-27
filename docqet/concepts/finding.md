---
docqet: concept
id: finding
name: Finding
description: >-
  Something the indexer, or combining, found wrong in the docs, such as a link
  to a doc that doesn't exist, a capability in two features, or a
  [contradiction](contradiction.md) between projects.
confused-with:
  - concept: "concept:gap"
    summary: >-
      something the software doesn't do yet, declared on purpose. A finding is a mistake in the docs.
  - term: "No evidence"
    summary: >-
      a rule or capability nothing points at. That's neither a finding nor something left to do: it holds on trust.
---

Findings are about the docs, never the software: Docqet checks that the docs
hold together, since they're only useful if they do. They're always derived,
and can be about anything. A `docqet:gap` left behind after its gap was
closed, for example, is an `unknown-id`.

## Types

| Type                  | Raised when |
| --------------------- | ----------- |
| `unknown-id`          | A link, annotation or `affects` names a doc, gap or tradeoff that doesn't exist. |
| `invalid-frontmatter` | A required field is missing, a field its type doesn't have is written, or a value isn't allowed, such as a link of the wrong type for its field, a `docqet` that isn't a type, or a rule or concept reference written with `@<domain>`. A field a type used to have, such as `domain`, a feature's `capabilities` or a capability's `rules`, says where it went. |
| `duplicate-id`        | A project has two docs of one type with the same ID, or a doc has two gaps or tradeoffs with the same key across the projects that write it. |
| `broken-link`         | A relative link in a doc's body or a text value doesn't resolve. |
| `unlinked-rule`       | No capability follows a rule. |
| `in-two-features`     | Projects name different features for the same capability. |
| `contradiction`       | Contributions that should agree don't, as [contradiction](contradiction.md) describes. |
| `invalid-annotation`  | An annotation names something it can't, such as a gap where it should name a rule, or a rule or concept reference written with `@<domain>`. |
| `unknown-outcome`     | An outcome in a gap's, tradeoff's or decision's `affects`, or in `meets`, isn't an outcome in [the stability rubric](rubric.md). |
| `solves-no-problem`   | A capability solves no [problem](problem.md) yet, in any project of the product. Advisory. |
| `respected-by-nothing` | Nothing respects a [constraint](constraint.md) yet, in any project of the product: no rule, capability, mechanism or component. Advisory. |
| `applies-to-nothing`   | No [problem](problem.md) is subject to a constraint, in any project of the product, and it doesn't say it applies to the whole project or product. Advisory. |

**Advisory findings** are shown and counted like any other, but never fail
`docqet check`, so a project can adopt what they ask for one doc at a time.
`solves-no-problem`, `respected-by-nothing` and `applies-to-nothing` are
the three: a capability nobody has said the reason for, a constraint nothing
keeps to, or one that bounds nothing, is worth seeing, but isn't a mistake in
the docs.

`in-two-features` is a contradiction too, and like one is found only when
projects are put together. [Combining](product.md#combining) raises
`contradiction`, `in-two-features`, and `duplicate-id` across projects.

## How it's written

Each is in the project's [state](state.md), with its type, what it's about,
the capabilities it affects, and a message. Hotel Billing had this one until
the refunds draft started following the rule:

```json
{
  "type": "unlinked-rule",
  "subject": "rule:overpayments-are-refunded",
  "capabilities": [],
  "message": "No capability follows this rule."
}
```
