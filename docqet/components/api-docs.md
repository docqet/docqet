---
docqet: component
id: api-docs
name: API docs
description: >-
  The reference at `/docs/api`: the OpenAPI spec, rendered by Scalar, with
  each endpoint's stability.
serves:
  - capability:api-reference
gaps:
  - id: depends-on-scalars-page
    name: Depends on Scalar's page structure
    impact: inconvenient
    likelihood: possible
    reach: all
    description: >-
      The script that adds stability marks depends on Scalar's page structure,
      and the page loads `@scalar/api-reference` from jsdelivr without a
      version. A Scalar release can stop the marks, rings and overview from
      appearing, with no error, and nothing tests the rendered page.
---

How it works is in [API docs](../../docs/architecture/api-docs.md).
