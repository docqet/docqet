---
docket: capability
id: cli-reads
domain: reporting
name: Reading from the command line
description: >-
  Engineers and agents read a project's docs, gaps and readiness with
  `docket show`, `list` and `status`, from the working tree, a commit or the
  server.
stability: prototype
personas: [persona:engineer, persona:coding-agent]
gaps:
  - id: no-status
    name: No status
    impact: inconvenient
    likelihood: certain
    reach: most
    description: >-
      `docket show` and `docket list` are built, but `docket status` isn't, so
      the overview of maturity, readiness and risk is only in the UI.
  - id: working-tree-only
    name: Reads only this project's files
    impact: inconvenient
    likelihood: certain
    reach: some
    description: >-
      Reads take the working tree or a commit, but not `--remote` or
      `--product`, so they can't show the server's states or the rest of the
      product.
---
