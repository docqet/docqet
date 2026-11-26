---
docqet: mechanism
id: commands
name: Commands
description: >-
  How `docqet`'s commands behave: each says where it reads from, and nothing
  one does changes what another shows.
tradeoffs:
  - id: no-selected-context
    name: No selected context
    description: >-
      There's no `docqet use`, and no current stack or server to switch
      between. Every command says where it reads from.
    benefit: Nothing run earlier changes what a command shows.
    drawback: >-
      Commands that read the server, or a commit, say so every time they're
      run.
  - id: trailers-not-remembered
    name: Trailers aren't remembered
    description: >-
      `docqet rename` prints the trailer to commit with, and nothing keeps it
      for the commit.
    benefit: Nothing a command did earlier changes what another does.
    drawback: >-
      A rename committed without its trailer reads in history as one doc
      removed and an unrelated one added. A `prepare-commit-msg` hook that
      adds it can come later, if that turns out to be common.
---

Every command, with its flags, is drafted in
[cmd/docqet](../../cmd/docqet/README.md). Those not built yet say so when
they're run.
