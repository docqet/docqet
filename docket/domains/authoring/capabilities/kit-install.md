---
docket: capability
id: kit-install
domain: authoring
name: Installing the kit
description: >-
  Engineers install the agent kit into a project, and keep it up to date, with
  `docket kit`.
stability: prototype
personas: [persona:engineer]
---

## Includes

- Writing the skill into `.agents/skills/docket/`, the kit's block into
  `AGENTS.md`, and `@AGENTS.md` into an existing `CLAUDE.md`.
- Adding the skill's folders to the project's `.docketignore`, since the
  kit's example annotations would otherwise be read as the project's own.
- `docket kit --check`, for CI.
