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

- **`AGENTS.md`**, which Codex, Cursor, GitHub Copilot, Gemini CLI and most
  other agents load in every session. Claude Code loads it through
  `CLAUDE.md`. The kit's part is short: what Docket is, and the handful of
  things an agent must always do.
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
release of the command carries the kit written for its commands.

## Installing it in a project

```bash
docket kit
```

It writes these into the project, to be committed with it, so everyone working
on it gets them, whatever agent they use:

| Written                  | What for                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `.agents/skills/docket/` | A copy of the skill, where Codex, Cursor and Gemini CLI look for a project's skills |
| `.claude/skills/docket`  | A link to that copy, where Claude Code looks                                        |
| `AGENTS.md`              | The kit's block, between `docket-kit:start` and `docket-kit:end` markers            |
| `CLAUDE.md`              | An `@AGENTS.md` line, so Claude Code reads `AGENTS.md`, unless it already has one   |

An existing `AGENTS.md` or `CLAUDE.md` keeps everything it had: the block or
the import line is added at the end. Run it again after updating `docket` to
update the kit. It reports each file as `added`, `updated`, `removed` or `ok`,
and changes only what's the kit's: the skill's folder, which it makes match
the kit exactly, and what's between the markers.

```bash
docket kit --check   # exit 1 if the project's copy isn't the kit this docket carries, for CI
```

Don't hand-edit the copy or the block, since the next `docket kit` overwrites
them. To change the kit for every project, change it here. To change it for
one project, see below.

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
in Docket's own docs. Installing the kit adds its folder to a project's
`.docketignore`, so its example annotations aren't read as the project's own
(see [Installing the kit](../docket/domains/authoring/capabilities/kit-install.md)).
