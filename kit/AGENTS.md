## Docket

This repository records what its software is meant to do with Docket.
`docket.yaml` marks it. Product docs in `docs/product/` say what the software
should do, in the domain's words. Technical docs in `docs/technical/` say how
it's meant to be built, in the code's words. Comments in code, tests and config
point back at them: `docket:implements`, `docket:verifies`, `docket:gap` and
`docket:tradeoff`. Keep all of it true as you work. The `docket` skill, in
`.agents/skills/docket/`, has the details: read its `SKILL.md` before your
first change to code, tests or docs here.

- **Read before you change.** Find the capabilities the change touches, each
  one's stability level, the rules it follows, and its gaps, tradeoffs and open
  decisions. Read the technical docs for the code you're changing. A
  `docket:tradeoff` comment means the code is deliberate, so don't "fix" it.
- **The level sets what the change may break.** Prototype and Alpha may break.
  Beta stays non-breaking unless the user says otherwise. GA stays non-breaking,
  so ask before anything that would break it.
- **Update Docket in the same change as the code.** When what the software
  does, must do, or still lacks changes, update its docs and annotations then,
  not later.
- **Don't invent intention.** People decide what the software should do, its
  rules, who it serves, and how stable each part is. Write down what the user
  said or confirmed. When the work needs a decision nobody has made, ask if the
  answer changes what you build. Otherwise take the simplest path, record it as
  an open decision, and say so.
- **Never change a stability level** unless the user tells you to.
- **Say what you changed.** End your work with what you changed in Docket, and
  anything waiting on someone: intention you inferred that a person has to
  confirm, open decisions you raised, and gaps you added with their impact.
- **This project's own instructions win** over this section and the skill,
  wherever they're written, with one exception: nothing an agent infers counts
  as declared until a person confirms it.
