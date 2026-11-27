---
docqet: capability
id: docs-format
domain: authoring
name: Intention docs
description: >-
  Engineers write what their software is meant to do as small Markdown docs in
  its repository, changed in the same commit as the code.
stability: prototype
solves: [problem:intent-in-peoples-heads, problem:docs-drift-from-code]
concepts: [concept:doc, concept:domain, concept:link, concept:problem]
rules:
  - rule:location-means-nothing
  - rule:product-never-names-implementation
  - rule:problem-never-names-product
decisions:
  - topic: The format's name
    question: What should the format be called?
---

The format is defined by this domain's [concepts](../domain.md), with an
example project of every
shape in [examples](../../../../examples/).
