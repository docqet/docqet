---
docqet: capability
id: preview
domain: authoring
name: Seeing a change before it's shared
description: >-
  How will this change look once it's shared? Engineers and agents see their
  work the way everyone else will, on their own machine, before it's merged.
stability: prototype
personas: [persona:engineer, persona:coding-agent]
gaps:
  - id: no-reindex
    name: Doesn't re-index as files change
    impact: inconvenient
    likelihood: certain
    reach: all
    description: >-
      It shows the state `docqet index` last wrote, read again on each
      reload, so engineers run `docqet index` after each change to see it.
  - id: working-tree-only
    name: Only the working tree
    impact: inconvenient
    likelihood: certain
    reach: some
    description: >-
      It can't show a commit or a time, as the server's `?at=` will, until
      Docqet can read history.
  - id: branch-not-shown
    name: A branch's changes aren't shown
    impact: inconvenient
    likelihood: certain
    reach: some
    description: >-
      Only the working tree can be seen. What a branch would change on the
      server, such as capabilities added or promoted, gaps closed, decisions
      answered and new findings, isn't shown, since `docqet preview` isn't
      built.
---

Today `docqet ui` shows the working tree as the server will show it.
`docqet preview` is meant to show what a branch would change on the server
before it's merged.
