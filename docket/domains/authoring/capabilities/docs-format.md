---
docket: capability
id: docs-format
domain: authoring
name: Intention docs
description: >-
  Engineers write what their software is meant to do as small Markdown docs in
  its repository, changed in the same commit as the code.
stability: prototype
personas: [persona:engineer, persona:coding-agent]
concepts: [concept:doc, concept:domain, concept:link]
rules:
  - rule:location-means-nothing
  - rule:product-never-names-implementation
decisions:
  - topic: The format's name
    question: What should the format be called?
  - topic: Unconfirmed intention
    question: >-
      How is intention an agent worked out from existing code marked, so it
      isn't counted as declared until a person confirms it? It isn't a draft
      capability, which a person has declared and nobody has started.
    affects:
      - capability:agent-guidance#inferred-intention-unmarked
---

The format is defined by this domain's [concepts](../domain.md), with an
example project of every
shape in [examples](../../../../examples/).
