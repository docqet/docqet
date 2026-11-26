---
docket: capability
id: agent-guidance
domain: authoring
name: Agent guidance
description: >-
  Coding agents read a capability's level, rules, gaps and decisions before
  changing its code, and keep its docs and annotations current in the same
  change.
stability: prototype
personas: [persona:coding-agent]
gaps:
  - id: inferred-intention-unmarked
    name: Inferred intention has no marker
    impact: inconvenient
    likelihood: certain
    reach: some
    description: >-
      There's no way to mark intention an agent worked out from code as
      unconfirmed, so the kit has agents propose it, and write it only once a
      person confirms it.
  - id: decisions-not-named
    name: Answered decisions can't be named
    impact: negligible
    likelihood: certain
    reach: all
    description: >-
      Decisions have no key, so agents can't say in a trailer what an answered
      decision became, and history shows it removed with nothing in its place.
  - id: claude-reads-skill-by-instruction
    name: Claude Code doesn't load the skill itself
    impact: inconvenient
    likelihood: possible
    reach: some
    description: >-
      Claude Code doesn't read skills from `.agents/skills/` yet, so it reads
      the skill only because the block in `AGENTS.md` tells it to, can miss
      it if it doesn't follow that, and can't be asked for it with `/docket`.
  - id: copilot-may-miss-skill
    name: Copilot in VS Code doesn't find the skill
    impact: inconvenient
    likelihood: expected
    reach: some
    description: >-
      Copilot in VS Code reads skills only from `.github/skills/`, where the
      kit isn't installed. It still reads `AGENTS.md`, which names the
      skill's path.
  - id: gemini-needs-a-setting
    name: Gemini CLI needs a setting to read AGENTS.md
    impact: inconvenient
    likelihood: expected
    reach: few
    description: >-
      Gemini CLI reads `GEMINI.md` unless its `context.fileName` setting
      includes `AGENTS.md`, so until someone sets it, it only finds the skill
      when the work calls for it, not the kit's always-on part.
  - id: no-product-reads
    name: No reads across a product's projects
    impact: inconvenient
    likelihood: expected
    reach: some
    description: >-
      The kit's commands read one project, so in a product of several
      projects an agent checks another project's docs by running them in its
      folder, and `--product` isn't there to reuse another project's IDs or
      find contradictions.
  - id: no-workflows
    name: No workflows
    impact: inconvenient
    likelihood: certain
    reach: some
    description: >-
      The kit has no workflows for implementing a change, promoting a
      capability, or reviewing work against its level, so promoting is steps
      an agent follows when a person asks for it.
tradeoffs:
  - id: committed-kit
    name: The kit is committed to each project
    description: >-
      Each project commits the kit that whichever `docket` last ran
      `docket kit` wrote, rather than agents reading it from the `docket`
      they have installed.
    benefit: >-
      Changes to it are reviewed in pull requests, and every agent in the
      project reads the same copy.
    drawback: >-
      An agent's `docket` can be older or newer than the committed kit, so the
      kit can name commands it doesn't have. `docket kit --check` in CI keeps
      the kit matching CI's `docket`, not every engineer's.
---

The kit is in [kit/](../../../../kit/).
