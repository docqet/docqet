---
docqet: capability
id: docs-format
name: Intention docs
description: >-
  Engineers write what their software is meant to do as small Markdown docs in
  its repository, changed in the same commit as the code.
stability: prototype
feature: feature:declaring
solves: [problem:intent-in-peoples-heads, problem:docs-drift-from-code]
rules:
  - rule:location-means-nothing
  - rule:product-never-names-implementation
  - rule:problem-never-names-product
  - rule:docs-hold-nothing-private
concepts: [concept:doc, concept:area, concept:link, concept:problem]
decisions:
  - topic: The format's name
    question: What should the format be called?
---

The format is defined by Docqet's [concepts](../areas/authoring.md), with an
example project of every
shape in [examples](../../examples/).
