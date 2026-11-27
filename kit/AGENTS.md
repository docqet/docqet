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
`{{skills}}/docqet/`, has the details: read its `SKILL.md` before your
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
