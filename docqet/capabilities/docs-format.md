---
docqet: capability
id: docs-format
name: Intention docs
description: >-
  Engineers write what their software is meant to do as small Markdown docs in
  its repository, changed in the same commit as the code.
stability: prototype
within: feature:declaring
solves: [problem:intent-in-peoples-heads, problem:docs-drift-from-code, problem:docs-slow-every-change]
follows:
  - rule:links-read-as-sentences
  - rule:location-means-nothing
  - rule:links-point-toward-why
  - rule:problem-never-names-product
  - rule:docs-hold-nothing-private
  - rule:ignored-files-arent-read
  - rule:docs-hold-no-presentation
uses: [concept:doc, concept:area, concept:link, concept:problem, concept:project]
tradeoffs:
  - id: whole-files
    name: Whole files, not just their annotations
    description: >-
      An ignored file is left out entirely, docs and annotations alike, rather
      than having only its annotations ignored.
    benefit: >-
      It works as `.gitignore` and `.dockerignore` do, so there's nothing new
      to learn about what it means.
    drawback: >-
      A file can't be a Docqet doc and have example annotations ignored, which
      only matters to a doc that teaches annotations.
decisions:
  - topic: The format's name
    question: What should the format be called?
---

The format is defined by Docqet's [concepts](../areas/authoring.md), with an
example project of every
shape in [examples](../../examples/).

## Includes

- Leaving files out of a project with a `.docqetignore`, such as docs that
  show example annotations.
