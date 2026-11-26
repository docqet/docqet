# Agent kit

Instructions that teach any coding agent to work in a Docket repository: to
read a capability's level, rules, gaps and decisions before changing its code,
to keep the docs and annotations current in the same change, and to leave
decisions about intention with people, asking when it matters and recording an
open decision when it doesn't.

It needs the [`docket` command](../cmd/docket/). Agents use it for everything
the skill asks of them: `docket touches` before a change, to see what it's
about and what its level allows, `docket show` and `docket list` to read docs,
`docket rename` to change an ID, `docket check --changed` before finishing,
and `docket diff` for what to report. The kit doesn't describe how to do any
of that by hand, so an agent without `docket` asks for it to be installed.

It isn't written for one agent. It's plain Markdown, in the two forms most
agents now read:

- **`AGENTS.md`**, which Codex, Cursor, GitHub Copilot, Windsurf and Claude
  Code load in every session. The kit's part is short: what Docket is, and
  the handful of things an agent must always do.
- **An [Agent Skills](https://agentskills.io) skill**, `docket`, which agents
  load when the work calls for it. It has the details: which command to run
  when, what to update when, what to ask, and how to write each doc, gap,
  tradeoff, decision and annotation.

```text
kit/
├── AGENTS.md                    # the always-on part, written into a project's AGENTS.md
└── skills/docket/
    ├── SKILL.md                 # the commands, before a change, keeping it current, what to ask, finishing, committing
    ├── docs.md                  # each doc type's fields, and how to write it
    ├── gaps-and-decisions.md    # gaps and rating their impact, tradeoffs, decisions
    ├── annotations.md           # docket:implements, verifies, gap and tradeoff
    ├── stability.md             # levels, what a change may break, the rubric, promoting
    └── adopting.md              # bringing Docket to a repository that doesn't have it
```

These files are the kit's source. They're built into `docket`, so each
release of the command carries the kit written for its commands. This
repository installs its own kit too, for Claude Code, with
`docket kit install --agent claude`, so its copy in `.claude/` is checked
against these files in CI, with `docket kit check`.

## Installing it in a project

Install `docket` (see [Installing docket](../docs/installing.md)), then, in
a project with a `docket.yaml`, install the kit for the agents the project
uses:

```bash
docket kit install                    # for most agents, through AGENTS.md: the default
docket kit install --agent claude     # for Claude Code
docket kit install --agent claude --agent codex   # for both
```

It writes the kit where each agent reads it, to be committed with the
project, so everyone working on it gets it:

| Written                  | When                              | What for                                                                           |
| ------------------------ | --------------------------------- | ---------------------------------------------------------------------------------- |
| `.agents/skills/docket/` | For any agent but Claude Code     | The skill, where Codex, Cursor, Gemini CLI, Windsurf and Copilot look for it       |
| `.claude/skills/docket/` | For Claude Code                   | The skill, where Claude Code looks for it                                          |
| `AGENTS.md`              | For any agent but Claude Code     | The kit's block, between `<!-- docket-kit:start -->` and `<!-- docket-kit:end -->` |
| `CLAUDE.md`              | For Claude Code                   | The block, when it's only for Claude Code. With other agents too, `@AGENTS.md`     |
| `CLAUDE.md`              | For other agents, if it exists    | `@AGENTS.md`, since Claude Code reads `AGENTS.md` only without a `CLAUDE.md`       |
| `.agents/docket.lock`    | Always, or `.claude/` for Claude Code only | What the kit installed, so it removes only that                    |
| `.docketignore`          | Always                            | Each skill folder, so its example annotations aren't read as the project's own     |

- **The block is written once.** It's in `AGENTS.md` whenever the kit is
  installed for an agent that reads it, and names `.agents/skills/docket/`.
  Installed only for Claude Code, it's in `CLAUDE.md`, and names
  `.claude/skills/docket/`.
- **Each skill folder is a real copy**, not a link, since a committed link
  breaks on checkouts without symlinks, such as Windows'.
- **The project's own text is kept.** The block is added at the end of
  `AGENTS.md` or `CLAUDE.md`, or replaced in place, and other tools can keep
  blocks of their own beside it.

A lock, `.agents/docket.lock`, or `.claude/docket.lock` when the kit is
only for Claude Code, records what it installed: the agents' targets, and
whether it added the `@AGENTS.md` line. So `remove` takes out what the kit
wrote and nothing else. A kit installed before the lock is read from the
skill folders there, and gets one on its next `docket kit update`.

```bash
docket kit                            # what it's installed for, and whether it's this docket's
docket kit install --agent claude     # add an agent
docket kit remove --agent claude      # remove one, moving the block if it has to
docket kit remove                     # remove the kit entirely
docket kit update                     # after updating docket: rewrite it for every agent it's installed for
docket kit check                      # exit 1 if it isn't installed, or isn't this docket's, for CI
docket kit agents                     # the agents it can be installed for
```

Each reports every file as `added`, `updated`, `removed` or `ok`, and changes
only what's the kit's: its skill folders, which it makes match the kit
exactly, what's between its markers, the lines it adds, and its lock.

Don't hand-edit the skill or the block, since the next `docket kit update`
overwrites them. To change the kit for every project, change it here. To
change it for one project, see below.

### Supported agents

As each agent's own docs described it on 2026-11-25. `docket kit agents`
prints the same list.

| Agent                                         | `--agent`  | What it reads                                    | Kit installed in                | Notes                                                                                     |
| --------------------------------------------- | ---------- | ------------------------------------------------ | ------------------------------- | ----------------------------------------------------------------------------------------- |
| Claude Code                                   | `claude`   | `CLAUDE.md`, or `AGENTS.md` without one; `.claude/skills/` | `.claude/skills/`, `CLAUDE.md` | Without `--agent claude`, it reads the skill only because the block says where it is, and `/docket` doesn't invoke it |
| Codex                                         | `codex`    | `AGENTS.md`, `.agents/skills/`                   | `.agents/skills/`, `AGENTS.md`  |                                                                                           |
| Cursor                                        | `cursor`   | `AGENTS.md`, `.agents/skills/`                   | `.agents/skills/`, `AGENTS.md`  |                                                                                           |
| GitHub Copilot (CLI, cloud agent, VS Code)    | `copilot`  | `AGENTS.md`; `.agents/skills/` in the CLI and cloud agent | `.agents/skills/`, `AGENTS.md`  | Copilot in VS Code reads skills only from `.github/skills/`, so it finds the skill through `AGENTS.md` |
| Gemini CLI                                    | `gemini`   | `GEMINI.md`, `.agents/skills/`                   | `.agents/skills/`, `AGENTS.md`  | Add `AGENTS.md` to its `context.fileName` setting, or it won't read the block              |
| Windsurf                                      | `windsurf` | `AGENTS.md`, `.agents/skills/`                   | `.agents/skills/`, `AGENTS.md`  |                                                                                           |
| Any other agent that reads `AGENTS.md`        | `agents`   | `AGENTS.md`                                      | `.agents/skills/`, `AGENTS.md`  | Such as Aider, which reads it when passed with `--read AGENTS.md`, and Zed, where a stray `.rules` file can hide it |

Every name but `claude` installs the same files, so naming several of them is
the same as naming one. An agent that reads neither `AGENTS.md` nor skills can
be pointed at `AGENTS.md` and `.agents/skills/docket/SKILL.md` by hand, or
through its own rules file.

## Extending it for a project

The kit says what any Docket repository needs. Each project says what's
particular to it, in its own instructions, outside the kit's block: the rest
of `AGENTS.md`, `CLAUDE.md`, or its agent's own rules, such as
`.claude/rules/`. The project's instructions win over the kit, with one
exception no project can override: nothing an agent infers counts as declared
until a person confirms it.

Some things a project might say:

```markdown
## Docket in this project

- Product docs for the Exalynt product are in the API project, `api/`. This
  project has technical docs only, and its components list the API's
  capabilities.
- Our domains are accounts, agreements, billing and capacity. Ask before
  adding another.
- Each acceptance test's Gherkin `Rule:` gets a `docket:verifies` for the rule
  it checks.
- Agents can add and close decisions on technical docs without asking.
```

The kit leaves conventions and standards, such as how a project handles
errors or writes its tests, to the project's own rules. How the project meets
an expected outcome is a mechanism or component that `meets` it, in
the project's technical docs.

## Keeping it in step with `docket`

The kit restates the format for agents, and names `docket`'s commands and
flags. A change to either that changes what an agent writes, reads or runs
changes the kit in the same commit. The rubric isn't copied into
the kit: it's part of the format, built into `docket`, and agents read it with
`docket rubric`.

## Known gaps

The kit's gaps and tradeoffs are on
[Agent guidance](../docket/domains/authoring/capabilities/agent-guidance.md),
in Docket's own docs, and how it's installed is
[Installing the kit](../docket/domains/authoring/capabilities/kit-install.md).
