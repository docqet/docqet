# Docqet

This repository is Docqet: the format, the `docqet` command (Go, in `cmd/`
and `internal/`), its UI (`ui/`) and the agent kit (`kit/`). `README.md`
explains it, and `docs/architecture/` says how it's built.

## Docqet in this project

- **Docqet is documented with Docqet.** Its docs are in `docqet/`, and its
  concept docs define the format: a change to the format changes its concept
  docs in the same commit.
- **`examples/` holds projects of their own**, each with a `docqet.yaml`,
  used as fixtures. Their `.docqet/state.json` files are written by hand, so
  never run `docqet index` in them without `--stdout`.
- **The kit's source is `kit/`.** It's installed here for Claude Code: the
  copy in `.claude/skills/docqet/`, and the block below, are written by
  `go run ./cmd/docqet kit update`: edit `kit/`, then run it. CI fails when they
  differ. A change to a command's flags or output that the kit names changes
  the kit in the same commit.
- **Use the command you're building.** Run `go run ./cmd/docqet` rather than
  an installed `docqet` when the change is to the command itself.
- Run `make check` before committing.

<!-- docqet-kit:start -->
## Docqet

This repository records what its software is meant to do with Docqet.
`docqet.yaml` marks it. Its docs, usually in `docqet/`, are the Markdown files
whose frontmatter has `docqet`. Product docs say what the software should do,
in the domain's words. Technical docs, mechanisms and components, say how it's
meant to be built, in the code's words. Comments in code, tests and config
point back at them: `docqet:implements`, `docqet:verifies`, `docqet:gap` and
`docqet:tradeoff`. Keep all of it true as you work.

You work with it through the `docqet` command, which reads the docs and
annotations and checks them. If `docqet` isn't installed, ask the user to
install it before changing anything here. The `docqet` skill, in
`.claude/skills/docqet/`, has the details: read its `SKILL.md` before your
first change to code, tests or docs here, whether or not your agent loads
skills from that folder.

- **Read before you change.** Run `docqet touches <paths>` on what you're
  about to change. It lists the capabilities involved, each one's stability
  level, the rules it follows, and its gaps, tradeoffs and open decisions.
  Read the technical docs for the code you're changing. A `docqet:tradeoff`
  comment means the code is deliberate, so don't "fix" it.
- **The level sets what the change may break.** Prototype and Alpha may break.
  Beta stays non-breaking unless the user says otherwise. GA stays non-breaking,
  so ask before anything that would break it.
- **Update Docqet in the same change as the code.** When what the software
  does, must do, or still lacks changes, update its docs and annotations then,
  not later. Change an ID only with `docqet rename`.
- **Don't invent intention.** People decide what the software should do, its
  rules, who it serves, and how stable each part is. Write down what the user
  said or confirmed. When the work needs a decision nobody has made, ask if the
  answer changes what you build. Otherwise take the simplest path, record it as
  an open decision, and say so.
- **Never change a stability level** unless the user tells you to.
- **Finish clean.** `docqet check --changed` must report no findings before
  you're done.
- **Say what you changed.** End your work with what you changed in Docqet,
  from `docqet diff`, and anything waiting on someone: intention you inferred
  that a person has to confirm, open decisions you raised, and gaps you added
  with their impact.
- **This project's own instructions win** over this section and the skill,
  wherever they're written, with one exception: nothing an agent infers counts
  as declared until a person confirms it.
<!-- docqet-kit:end -->

<!-- forge:start -->
## Forge

This repository follows Exalynt's way of working, installed by forge: how we
engineer, and skills for the workflows that apply it. Forge says how to do the
work. How much a capability needs, and what it's meant to do, is the
project's intention (see "Where intention lives").

### Engineering philosophy

Build only as much software as we currently have reason to build. The best
implementation is the simplest one that appropriately meets the capability's
needs and stability level today: appropriate complexity, not minimal code.

- A capability's stability level is both a bar the work must meet and a
  ceiling on how much to invest. Meeting it is required. Exceeding it is not a
  virtue, and over-engineering is as much a problem as under-engineering.
- Build against concrete, current requirements. "We'll probably need it
  eventually" isn't a reason to build it now.
- Complexity needs a reason that exists now: a demonstrated failure, a real
  second use case, a measured performance problem, an explicit requirement, a
  security or privacy need, or what the capability's level expects.
- Add an abstraction for a problem that exists now: real duplication, a second
  real implementation, or a boundary that's genuinely hard to reason about
  without it. No interfaces, extension points, plugin mechanisms, or
  configuration because they could be useful someday. A few similar concrete
  blocks often beat one premature abstraction.
- When uncertain, prefer the decision that's cheapest to reverse, and code
  that's easy to delete or replace.
- Replace early work once it has served its purpose. Don't contort new work to
  stay compatible with code that was always meant to be temporary.
- Optimize, and add operational infrastructure (dashboards, alerting,
  elaborate retries, caches, queues, flag systems, scaling machinery), on
  evidence of a need or when the level expects it, not on intuition about
  future scale.
- Decide what not to build, and say so briefly. A plainly stated known gap is
  part of a complete answer. When existing code already exceeds what's needed,
  point that out instead of extending the pattern.
- Simple doesn't mean sloppy. What we build is correct and clear.

### Security and privacy

Never speculative, the same at every level, and never a known gap:

- One tenant or client can't see or interact with another's real data.
- Anything touching real client systems or data has authentication and
  authorization. Only work that holds nothing but sample data can go without.
- Real secrets are never leaked anywhere: not in code, version control, sample
  data, logs, error messages, output, client bundles, or third-party services.
- Real client data is never copied into code or fixtures.
- Personal data is collected only where it's needed.
- Untrusted input can't run as code.

Sample, mock, or fake data and throwaway placeholder credentials aren't
covered.

### Git

Don't create a branch unless asked. Work on the current branch. The
`implement` skill does too, unless asked for a worktree.

### Subagents

If your agent can run subagents, use them for independent work in parallel
when that saves real time or keeps a large search out of the main session:
research across separate areas, read-only reviews, changes in disjoint files.
Keep work that shares state (the same files, the git index, a database or test
data, a running server or browser, ports, installs) and questions for the user
in the main session. Without subagents, do the same work yourself in sequence.

### Where intention lives

A capability is one result of value, and the thing that carries a stability
level: draft, prototype, alpha, beta, or ga. A feature is a group of
capabilities.

**With Docqet**, when there's a `docqet.yaml` at the working directory or
above it, within the repository: the Docqet kit, its block in this file and
its `docqet` skill, is the authority on each capability's level, its business
rules, the personas it serves, its gaps, tradeoffs, and open decisions, and
what each level expects (`docqet rubric`). Read them with `docqet touches`,
`docqet show`, and `docqet list`. Forge's skills record intention only the
kit's way, and only after a person confirms it.

**Without Docqet**: a capability's level is whatever the user says. Ask only
when the answer changes the work. Nothing about intention is recorded: no
levels, rules, personas, or gaps written anywhere. The only record is the code
and tests the user approves. The `stability-review` and `promote` skills need
Docqet, and say so.

### Precedence

On intention, Docqet's instructions win over forge's. This project's own
instructions win over both, except for Docqet's rule that nothing an agent
infers counts as declared until a person confirms it. Project-specific
architecture and domain rules belong in the project's own instructions,
outside this block.

### Conventions

How code is built comes in three layers, each a skill: `standards`, for every
project in any language, then a language, such as `go`, then a stack under
it, such as `go-http`. This repository has `standards`, `go` → `go-http`, and `typescript` → `typescript-react`.

Each layer only adds to or narrows the one above it. Start from the most
specific skill installed for the code you're changing: its index lists, for
each topic, the file in every layer, to read in order. Where layers differ,
the more specific one wins, and this project's own instructions win over all
of them. Security and privacy, above, apply whatever any layer says.

### Skills

Forge's skills are in `.claude/skills/<name>/SKILL.md`. An agent that doesn't
load skills from there reads a skill's `SKILL.md` when its work comes up, or
when someone asks for it by name ("use implement", "/implement"). The ones marked "on request" run only when someone asks.

- `implement` (on request): build a feature, improvement, or fix on the
  current branch, or in its own worktree and pull request when asked.
- `commit` (on request): commit changes as small, related commits.
- `pr` (on request): commit, push, and open or update a pull request labeled
  with its stability level.
- `qa` (on request): QA a capability end to end against its business rules.
- `ux` (on request): walk a main flow as a type of user and report the
  friction.
- `use` (on request): usability test a flow with one player per person.
- `stability-review`: review work against a level, for what's missing and
  what's premature. Needs Docqet.
- `promote` (on request): move a capability to a higher level, doing only the
  delta. Needs Docqet.
- `standards`: conventions for every project, whenever you write or change
  code, APIs, schemas, CI, or UI.
- `testing`: how we write and organize tests, whenever you write or change
  them.
- `observability`: how we add traces, logs, and metrics.
- Language and stack skills, such as `go`, `go-http`, `typescript`, or
  `typescript-react`, where installed: conventions for that kind of code.
<!-- forge:end -->
