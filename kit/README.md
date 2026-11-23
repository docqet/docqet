# Agent kit

Instructions that teach any coding agent to work in a Docket repository: to
read a capability's level, rules, gaps and decisions before changing its code,
to keep the docs and annotations current in the same change, and to leave
decisions about intention with people, asking when it matters and recording an
open decision when it doesn't.

It isn't written for one agent. It's plain Markdown, in the two forms most
agents now read:

- **`AGENTS.md`**, which Codex, Cursor, GitHub Copilot, Gemini CLI and most
  other agents load in every session. Claude Code loads it through
  `CLAUDE.md`. The kit's part is short: what Docket is, and the handful of
  things an agent must always do.
- **An [Agent Skills](https://agentskills.io) skill**, `docket`, which agents
  load when the work calls for it. It has the details: where things are, what
  to update when, what to ask, and how to write each doc, gap, tradeoff,
  decision and annotation.

```text
kit/
├── AGENTS.md                    # the always-on part, written into a project's AGENTS.md
├── skills/docket/
│   ├── SKILL.md                 # before a change, keeping it current, what to ask, before finishing
│   ├── docs.md                  # each doc type's fields, and how to write it
│   ├── gaps-and-decisions.md    # gaps and rating their impact, tradeoffs, decisions
│   ├── annotations.md           # docket:implements, verifies, gap and tradeoff
│   ├── stability.md             # levels, what a change may break, the checklist, promoting
│   ├── adopting.md              # bringing Docket to a repository that doesn't have it
│   └── checklist.yml            # a link to the spec's stability checklist
└── install.sh                   # installs all of it into a project
```

## Installing it in a project

```bash
kit/install.sh path/to/repo
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
the import line is added at the end. Re-run it to update the kit. It reports
each file as `added`, `updated` or `ok`, replaces only what's between the
markers, and never deletes anything.

Don't hand-edit the copy or the block, since the next install overwrites them.
To change the kit for every project, change it here. To change it for one
project, see below.

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

- Product docs for the Exalynt platform are in the exalynt-api repository.
  This repository has technical docs only, and its components list that
  repository's capabilities.
- Our domains are accounts, agreements, billing and capacity. Ask before
  adding another.
- Each acceptance test's Gherkin `Rule:` gets a `docket:verifies` for the rule
  it checks.
- Agents can add and close decisions on technical docs without asking.
```

The kit leaves conventions and standards, such as how a project handles
errors or writes its tests, to the project's own rules. How the project meets
a stability checklist outcome is a mechanism or component that `meets` it, in
the project's technical docs.

## Keeping it in step with the spec

The kit restates the [spec](../spec/) for agents, so a change to the spec
that changes what an agent writes or reads changes the kit in the same
commit. `checklist.yml` is a link to the spec's, so it never drifts here, and
the install copies it as a file.

## Known gaps

- **The indexer would read the kit's examples as annotations.** The spec has
  the indexer look for annotations in every file outside `docs/`, so the
  examples in `.agents/skills/docket/` would be reported as annotations naming
  docs that don't exist. The spec needs to leave the kit out, or agent
  instructions in general, before the indexer is built.
- **Inferred intention has no marker.** The spec hasn't decided how to mark
  intention an agent worked out from code, so the kit has agents propose it
  and write it once a person confirms it.
- **GitHub Copilot may not find the skill.** Sources differ on whether it
  reads `.agents/skills/` or only `.github/skills/`. It still reads
  `AGENTS.md`, which points at the skill.
- **Nothing checks the docs yet.** Until the indexer exists, the skill has
  agents check their own frontmatter, links and annotations before finishing.
- **No workflows yet.** Forge's `/implement`, `/promote` and
  `stability-reviewer` aren't part of the kit. The skill describes promoting
  as steps an agent follows when a person asks for it.
