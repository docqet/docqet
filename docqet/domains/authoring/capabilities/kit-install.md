---
docqet: capability
id: kit-install
domain: authoring
name: Installing the kit
description: >-
  Engineers install the agent kit into a project, for the agents it uses, and
  keep it up to date, with `docqet kit`.
stability: prototype
solves: [problem:agents-guess-intention, problem:docs-slow-every-change]
---

## Includes

- Writing the skill and the kit's block where each agent the project uses
  reads them: `.agents/skills/docqet/` and `AGENTS.md` for most agents, and
  `.claude/skills/docqet/` and `CLAUDE.md` for Claude Code.
- Adding and removing agents, updating the kit, and removing it entirely.
- Listing the agents it supports, with `docqet kit agents`.
- Adding the skill's folders to the project's `.docqetignore`, since the
  kit's example annotations would otherwise be read as the project's own.
- Seeing which agents it's installed for, and whether it's the installed
  `docqet`'s, with `docqet kit status`.
- `docqet kit check`, for CI.
