---
docket: capability
id: kit-install
domain: authoring
name: Installing the kit
description: >-
  Engineers install the agent kit into a project, for the agents it uses, and
  keep it up to date, with `docket kit`.
stability: prototype
personas: [persona:engineer]
---

## Includes

- Writing the skill and the kit's block where each agent the project uses
  reads them: `.agents/skills/docket/` and `AGENTS.md` for most agents, and
  `.claude/skills/docket/` and `CLAUDE.md` for Claude Code.
- Adding and removing agents, updating the kit, and removing it entirely.
- Listing the agents it supports, with `docket kit agents`.
- Adding the skill's folders to the project's `.docketignore`, since the
  kit's example annotations would otherwise be read as the project's own.
- `docket kit check`, for CI.
