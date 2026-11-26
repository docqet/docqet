---
docket: capability
id: ignoring-files
domain: authoring
name: Ignoring files
description: >-
  Engineers leave files out of a project with a `.docketignore`, such as docs
  that show example annotations.
stability: prototype
personas: [persona:engineer]
concepts: [concept:project]
rules:
  - rule:ignored-files-arent-read
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
      A file can't be a Docket doc and have example annotations ignored, which
      only matters to a doc that teaches annotations.
---
