---
docqet: component
id: cli
name: CLI
description: >-
  The `docqet` command: every subcommand, reading the working tree, a commit
  or the server, and the server and UI started with `docqet serve`.
is: archetype:cli
serves:
  - capability:checking
  - capability:touches
  - capability:cli-reads
  - capability:changes
  - capability:renaming
  - capability:preview
  - capability:project-setup
  - capability:agent-guidance
  - capability:rubric
  - capability:applying
---

The commands are in `internal/commands`, one file each, and `cmd/docqet` only
starts them. How every command behaves is the
[commands](../mechanisms/commands.md) mechanism, and each command's flags are
drafted in [cmd/docqet](../../cmd/docqet/README.md).
