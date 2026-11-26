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
  - id: commands-not-built
    name: Names commands that aren't built
    impact: blocking
    description: >-
      The kit tells agents to use `docket touches`, `show`, `list`, `rename`
      and `diff`, which aren't built yet, so an agent can't follow it as
      written.
  - id: inferred-intention-unmarked
    name: Inferred intention has no marker
    impact: inconvenient
    reach: some
    description: >-
      There's no way to mark intention an agent worked out from code as
      unconfirmed, so the kit has agents propose it, and write it only once a
      person confirms it.
  - id: decisions-not-named
    name: Answered decisions can't be named
    impact: negligible
    description: >-
      Decisions have no key, so agents can't say in a trailer what an answered
      decision became, and history shows it removed with nothing in its place.
  - id: copilot-may-miss-skill
    name: GitHub Copilot may not find the skill
    impact: inconvenient
    likelihood: possible
    reach: some
    description: >-
      Sources differ on whether Copilot reads `.agents/skills/` or only
      `.github/skills/`. It still reads `AGENTS.md`, which points at the
      skill.
  - id: no-workflows
    name: No workflows
    impact: inconvenient
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
