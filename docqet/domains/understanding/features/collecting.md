---
docqet: feature
id: collecting
domain: understanding
name: Collecting states
description: >-
  Keeping each project's state, and what's observed of it, on a server of the
  team's own.
capabilities:
  - capability:applying
  - capability:api-reference
  - capability:results
  - capability:preview
tradeoffs:
  - id: main-branch-only
    name: Main branch only
    description: >-
      Only commits on the main branch are applied. A branch is shown by
      `docqet preview`, never stored.
    benefit: >-
      The server holds one line of history per project: the one people rely
      on.
    drawback: >-
      Work on a branch can't be seen on the server, only previewed by whoever
      has it.
  - id: no-host-integrations
    name: No host or CI integrations
    description: >-
      No GitHub App, no GitLab integration, and no comments posted on pull
      requests. `docqet` runs in any CI and talks to the server itself.
    benefit: Docqet works the same on any repository host and in any CI.
    drawback: >-
      Nothing shows up in a pull request unless the team's CI posts it.
---
