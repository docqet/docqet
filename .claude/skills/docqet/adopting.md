# Bringing Docqet to a repository

A folder becomes a Docqet project with a `docqet.yaml` in it, which
`docqet init` writes. That's usually the repository's root. A repository
holding several pieces of software, such as a monorepo, can have one in each
one's folder instead, and each is a project of its own:

```yaml
project:
  id: hotel-bookings      # kebab case, unique among the product's projects
  name: Hotel Bookings    # named for the software
product:                  # optional: the software product it's part of, with its other projects
  id: hotel
  name: Hotel             # named for the product
```

```sh
docqet init --id hotel-bookings --name "Hotel Bookings" --product hotel
docqet kit install    # add --agent claude for Claude Code
```

`docqet init` also adds `.docqet/` to `.gitignore`, and `docqet kit install`
installs this kit, if it isn't already there, for the agents the project
uses: `docqet kit agents` lists them.

## Intention read from code isn't declared

You can work out a lot of the intention from existing code, tests and docs.
That's useful, but it repeats what the code does, bugs included, so it isn't
declared until a person confirms it. Docqet has no marker for unconfirmed
intention yet, so:

- **Propose, then write.** Show the person what you'd declare, in small
  batches they can check, before writing it as docs. Their confirmation is
  what makes it declared.
- **Say where it came from.** For each capability or rule, say what in the
  code or existing docs it rests on, so they can judge it.
- **Ask about what looks like a bug.** Code that seems to contradict its own
  intent is a question, not a rule.
- **Levels are theirs.** Propose each capability's level from what the
  repository shows, and ask them to confirm it.

## Where to start

Start small, with one feature the person cares about, rather than the whole
repository:

1. **The domains.** Ask, or propose from how the business talks about itself,
   not from how the code is split up. Most projects have one or two.
2. **The personas** the feature is for, and **the problems** they have that
   it's there to solve, in their words and never naming the software. Only a
   person can usually say these: propose them from the code and docs, and ask.
3. **The feature and its capabilities**, each as one sentence saying who does
   what, at its level, with the problems it `solves`. Capabilities asked for
   but not started are drafts. One whose problem nobody can say yet can leave
   `solves` out: it's reported as an advisory finding, which doesn't fail the
   check, and serves nobody until its problem is written.
4. **The rules** they follow, each with its `why`, which only a person can
   usually give. A rule without a known why is worth asking about.
5. **The gaps** people already know about, and the tradeoffs they've already
   made.
6. **Annotations** on the code and tests that implement or verify those rules
   and capabilities, as you go.

Technical docs come last and only where the code can't say something. Most of
the code needs none.

Run `docqet check` after each batch, and `docqet status` to show the person
what Docqet now says about their software.

If the project already keeps any of this somewhere else, such as a wiki,
tickets or another docs folder, offer to bring it into Docqet and leave a
pointer behind, rather than keeping two copies.

## Telling the project about itself

Anything this project does differently from the kit goes in its own agent
instructions, outside the kit's block in `AGENTS.md`. Write it down there
when it's settled, such as which project holds the product docs for the
product, or what the project's domains are.
