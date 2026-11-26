# Docket

This repository is Docket: the format, the `docket` command (Go, in `cmd/`
and `internal/`), its UI (`ui/`) and the agent kit (`kit/`). `README.md`
explains it, and `docs/architecture/` says how it's built.

## Docket in this project

- **Docket is documented with Docket.** Its docs are in `docket/`, and its
  concept docs define the format: a change to the format changes its concept
  docs in the same commit.
- **`examples/` holds projects of their own**, each with a `docket.yaml`,
  used as fixtures. Their `.docket/state.json` files are written by hand, so
  never run `docket index` in them without `--stdout`.
- **The kit's source is `kit/`.** It's installed here for Claude Code: the
  copy in `.claude/skills/docket/`, and the block below, are written by
  `go run ./cmd/docket kit update`: edit `kit/`, then run it. CI fails when they
  differ. A change to a command's flags or output that the kit names changes
  the kit in the same commit.
- **Use the command you're building.** Run `go run ./cmd/docket` rather than
  an installed `docket` when the change is to the command itself.
- Run `make check` before committing.

<!-- docket-kit:start -->
## Docket

This repository records what its software is meant to do with Docket.
`docket.yaml` marks it. Its docs, usually in `docket/`, are the Markdown files
whose frontmatter has `docket`. Product docs say what the software should do,
in the domain's words. Technical docs, mechanisms and components, say how it's
meant to be built, in the code's words. Comments in code, tests and config
point back at them: `docket:implements`, `docket:verifies`, `docket:gap` and
`docket:tradeoff`. Keep all of it true as you work.

You work with it through the `docket` command, which reads the docs and
annotations and checks them. If `docket` isn't installed, ask the user to
install it before changing anything here. The `docket` skill, in
`.claude/skills/docket/`, has the details: read its `SKILL.md` before your
first change to code, tests or docs here, whether or not your agent loads
skills from that folder.

- **Read before you change.** Run `docket touches <paths>` on what you're
  about to change. It lists the capabilities involved, each one's stability
  level, the rules it follows, and its gaps, tradeoffs and open decisions.
  Read the technical docs for the code you're changing. A `docket:tradeoff`
  comment means the code is deliberate, so don't "fix" it.
- **The level sets what the change may break.** Prototype and Alpha may break.
  Beta stays non-breaking unless the user says otherwise. GA stays non-breaking,
  so ask before anything that would break it.
- **Update Docket in the same change as the code.** When what the software
  does, must do, or still lacks changes, update its docs and annotations then,
  not later. Change an ID only with `docket rename`.
- **Don't invent intention.** People decide what the software should do, its
  rules, who it serves, and how stable each part is. Write down what the user
  said or confirmed. When the work needs a decision nobody has made, ask if the
  answer changes what you build. Otherwise take the simplest path, record it as
  an open decision, and say so.
- **Never change a stability level** unless the user tells you to.
- **Finish clean.** `docket check --changed` must report no problems before
  you're done.
- **Say what you changed.** End your work with what you changed in Docket,
  from `docket diff`, and anything waiting on someone: intention you inferred
  that a person has to confirm, open decisions you raised, and gaps you added
  with their impact.
- **This project's own instructions win** over this section and the skill,
  wherever they're written, with one exception: nothing an agent infers counts
  as declared until a person confirms it.
<!-- docket-kit:end -->
