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
repository installs its own kit with `docket kit` too, so its copy in
`.agents/` is checked against these files in CI.

## Installing it in a project

Install `docket` (see the [README](../README.md#installing-docket)), then, in
a project with a `docket.yaml`:

```bash
docket kit
```

It writes these into the project, to be committed with it, so everyone working
on it gets them, whatever agent they use:

| Written                  | What for                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `AGENTS.md`              | The kit's block, between `<!-- docket-kit:start -->` and `<!-- docket-kit:end -->`          |
| `.agents/skills/docket/` | The skill, where Codex, Cursor, Gemini CLI, Windsurf and Copilot look for a project's skills |
| `CLAUDE.md`              | An `@AGENTS.md` line, only if the project already has a `CLAUDE.md` without one              |
| `.docketignore`          | The skill's folder, so its example annotations aren't read as the project's own             |

- **The skill is written once**, to `.agents/skills/`. Claude Code doesn't
  look for skills there yet, so it reads the skill because the block in
  `AGENTS.md` says where it is and to read it before changing anything. An
  earlier kit also wrote a copy to `.claude/skills/docket/`, which running
  the kit now removes.
- **`CLAUDE.md` is left alone when there's none.** Claude Code reads
  `AGENTS.md` itself, but only in a project with no `CLAUDE.md`, so the
  import is added only to one that exists. The kit never creates one.
- **An existing `AGENTS.md` keeps everything it had**: the block is added at
  the end, or replaced in place.

Run it again after updating `docket` to update the kit. It reports each file
as `added`, `updated`, `removed` or `ok`, and changes only what's the kit's:
the skill's folder, which it makes match the kit exactly, what's between
the markers, and the lines it adds. Other tools can keep blocks of their own
in `AGENTS.md` beside it.

```bash
docket kit --check   # exit 1 if the project's copy isn't the kit this docket carries, for CI
```

Don't hand-edit the skill or the block, since the next `docket kit`
overwrites them. To change the kit for every project, change it here. To
change it for one project, see below.

### Agents that need a setting

- **Claude Code** reads `AGENTS.md`, but not skills from `.agents/skills/`,
  so it follows the block to the skill rather than loading it by itself, and
  `/docket` doesn't invoke it.
- **Gemini CLI** reads `GEMINI.md`, not `AGENTS.md`, unless its
  `context.fileName` setting includes `AGENTS.md`. It reads the skill from
  `.agents/skills/` either way.
- **GitHub Copilot in VS Code** reads skills only from `.github/skills/`, so
  it finds the skill through `AGENTS.md`, which names its path.
- **Aider** reads `AGENTS.md` only when it's passed with `--read`.

An agent that reads neither `AGENTS.md` nor skills can be pointed at
`AGENTS.md` and `.agents/skills/docket/SKILL.md` by hand, or through its own
rules file.

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
