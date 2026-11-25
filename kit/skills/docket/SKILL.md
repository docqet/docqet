---
name: docket
description: How to read and keep current a repository's Docket docs (capabilities, features, rules, concepts, personas, initiatives, domains, mechanisms, components, gaps, tradeoffs, open decisions, stability levels) and its docket:implements, verifies, gap and tradeoff annotations. Use in any repository with a docket.yaml, before changing its code, tests or docs, to learn what the change touches and what it must keep; while changing them, to update the docs and annotations in the same change; when a product decision is needed that nobody has made; and when bringing Docket to a repository that doesn't have it yet.
---

# Docket

Docket separates what software is meant to do from what it does. People
declare the intention in small Markdown docs beside the code. Code and tests
point back at it as evidence, and tools derive the rest: evidence, risk,
maturity, readiness and problems. Your job in a Docket repository is to read the
intention before you change anything, keep it true as you change things, and
leave decisions about intention with people.

## The `docket` command

Everything here goes through `docket`. It reads the docs and annotations in
the working tree, uncommitted changes included, so it always shows your change
as it stands. Use it rather than searching the docs yourself: it resolves
references, follows links in both directions, and checks what grep can't.
Every command takes `--json`.

| When                             | Run                                                                           |
| -------------------------------- | ----------------------------------------------------------------------------- |
| Before planning a change         | `docket touches <paths>`, or `--base origin/main` for a whole branch          |
| Reading one doc, gap or tradeoff | `docket show <reference>`                                                     |
| Finding docs of a type, or gaps  | `docket list <kind>`, such as `docket list capabilities --domain guest-stays` |
| What a level expects             | `docket checklist`                                                            |
| Changing an ID                   | `docket rename <old> <new>`                                                   |
| Before finishing                 | `docket check --changed`, then `docket diff`                                  |

If `docket` isn't installed, stop and ask the user to install it.

## Where things are

A Markdown file is a Docket doc when its frontmatter has `docket`, its type.
Docs can be anywhere in the repository, and `docket list` finds them wherever
they are. Most projects keep them in the recommended layout:

```text
docket.yaml                                 the project's id and name, and its product
docket/
├── personas/                               who it serves, across every domain
├── initiatives/                            bodies of work, such as the MVP, across every domain
├── domains/<domain>/
│   ├── domain.md                           a part of the business with its own language
│   ├── features/                           a job the product does, listing its capabilities
│   ├── capabilities/                       one result of value; the only docs with a level
│   ├── rules/                              one rule per file: what must always or never happen
│   └── concepts/                           what a word means in this domain
├── mechanisms/                             how something works across the whole project
└── components/                             one area of the code, and the capabilities relying on it
.docket/                                    written by `docket`, gitignored, never edited
```

Personas, initiatives, domains, features, capabilities, rules and concepts are
product docs: what it should do, in the domain's words. Mechanisms and
components are technical docs: how it's meant to be built, in the code's words.

Every doc starts by saying what it is: `docket`, its type, `id`, its ID, such
as `no-double-booking`, and `domain`, for a feature, capability, rule or
concept. Everything else names it by reference, `<type>:<id>`, such as
`rule:no-double-booking`, in frontmatter and annotations alike, and
`docket show` lists everything that names it. A file's name and the folders
it's in mean nothing, so rename or move files freely. Put a new doc where the
project keeps others of its type, named after its ID. Changing an ID or a
`domain` is a breaking change: do it with `docket rename`, which changes every
reference to it.

Each doc's structure is its YAML frontmatter. Its body is free Markdown that
nothing reads. [docs.md](docs.md) has every type's fields.

## Before a change

1. **Find what the change touches.** Run `docket touches` on the files or
   folders you're about to change. It lists what their annotations name, the
   capabilities relying on the components there, and each capability's level,
   rules, gaps, tradeoffs and open decisions. When a task is described in
   product terms, find its capabilities with `docket list capabilities`, and
   look for the code through the components that list them.
2. **Read each capability it touches** with `docket show`: its `stability`,
   `personas`, the `rules` it follows, its `gaps`, `tradeoffs` and open
   `decisions`, and the evidence for each. Show those rules too, for their
   `why`, and the concepts for any term you're unsure of. A capability can be
   written in several domains, each with its own level. Use the domain the
   change is in.
3. **Read the technical docs** for the code: the components and mechanisms
   `touches` names, with `docket show`. Mechanisms apply to every capability,
   so `docket list mechanisms` too. A `docket:tradeoff` comment marks code
   that's wrong-looking on purpose. Leave it as it is unless the task is to
   change that choice.
4. **Check what the level allows** before planning. See
   [stability.md](stability.md). A part several capabilities share holds to the
   strictest of their levels, and `touches` lists every capability relying on
   it.

When `touches` finds nothing, the change may still create something that
belongs in Docket. Keep going and see the next section.

## Keeping it current

Update Docket in the same change as the code. Write only what's new or
changed, not docs to fill in the structure.

| What happened                                                              | What to write                                                                                                                             |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| The software can now do something new for someone                          | A capability, at the level the user gives, in the feature whose job it serves. A new job is a new feature. Ask which when it isn't clear. |
| A capability was asked for and not started                                 | A capability with `stability: draft`                                                                                                      |
| Something must always or never happen, and the user said so                | A rule, linked from every capability that follows it                                                                                      |
| A rule is followed but not held yet                                        | A gap on each capability that doesn't hold it, naming it in `rule`                                                                        |
| Something is missing that you or the user mean to fix                      | A gap: on the capability if people using it would notice, on the component or mechanism if only someone working on the code would         |
| Something was chosen over an alternative, with a drawback                  | A tradeoff on the doc it's about, with its `benefit` and `drawback`, and `docket:tradeoff` on the code where it shows                     |
| A question about intention came up that nobody has answered                | An open decision on the doc it's about. Ask first if the answer changes what you build                                                    |
| A decision was made                                                        | Delete it, and write the answer as whatever it became                                                                                     |
| A gap was closed                                                           | Remove it and its `docket:gap` annotations, which `docket show <gap>` lists                                                               |
| Code now implements or verifies a rule, capability, mechanism or component | A `docket:implements` or `docket:verifies` annotation on it. See [annotations.md](annotations.md)                                         |
| A new area of code has something the code can't say                        | A component, with `docket:implements` on its entry points. Most code needs no doc                                                         |
| How something already documented works has changed                         | Its body, so it no longer says something untrue                                                                                           |
| A domain word is used in a new sense, or a new one appears                 | A concept, or a change to it                                                                                                              |
| Work was grouped into an initiative, or taken out of one                   | The capability's or persona's `initiatives` link, added or removed, and a doc for a new initiative, deleted once nothing links it         |
| A doc's ID needs to change                                                 | `docket rename`, which changes every link and annotation here. With `--product`, it lists other projects' references to change there      |
| Code that an annotation names was deleted or moved                         | Move or remove the annotation with it                                                                                                     |

[gaps-and-decisions.md](gaps-and-decisions.md) covers gaps, tradeoffs and
decisions, including how to rate a gap's impact, likelihood and reach. [docs.md](docs.md) covers how
to write each doc.

Product docs never name pages, buttons, endpoints, tables or functions, so a
redesign doesn't make them wrong. Technical docs use the code's names. A gap
with a visible effect and a technical cause is the capability's gap, and the
component's body explains the cause.

## What you decide, and what you ask

Intention belongs to people. You can propose it, but it counts only once a
person has stated or confirmed it.

| Who decides | What                                                                                                                                                                                                      |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A person    | What the software should do, its rules, who it serves, each capability's level, which feature a capability is in, which initiatives it's part of, whether a gap is closed later or accepted as a tradeoff |
| You         | Annotations, what a technical doc says about how the code works, gaps you found or left and each one's impact, likelihood and reach, and tradeoffs in how you built something, all listed in your report  |

- **The user's request is a decision.** When they say what the software should
  do, write it down. When they say a rule, write the rule.
- **Ask when the answer changes what you build** and the repository can't
  answer it: a rule nobody stated, who something is for, a behavior the docs
  and the code disagree on. Ask once, with your recommendation, and group
  questions rather than stopping at each one.
- **Otherwise don't stop.** Take the simplest path that keeps every option
  open, record the question as an open decision on the doc it's about, and say
  so in your report.
- **Never encode a bug as intention.** Code that contradicts a rule is a gap
  or a bug, not a reason to change the rule. Code doing something no doc
  mentions is a question, not a rule. Intention read from code repeats the
  code's bugs.
- **Never change a capability's `stability`** unless the user tells you to.
  Promoting it is described in [stability.md](stability.md).

## Before you finish

1. **Run `docket check --changed`** and fix every problem it reports in what
   you changed: invalid frontmatter, a link or annotation that doesn't
   resolve, a rule no capability follows, an outcome that isn't in the
   checklist. Leave problems that were there before your change alone, unless
   the task is to fix them. A link into another project is reported as
   `unknown-id` unless you add `--product`.
2. **Check what it can't**, since it reads frontmatter and annotations, never
   meaning:
   - Every annotation you added is true: the test checks the rule, the code
     enforces it.
   - Nothing is in both the frontmatter and the body.
   - No doc holds a secret, a real person's details, or real client data.
3. **Run `docket diff`** to see what your change does to Docket, in Docket's
   words, for your report.

Then tell the user, in a short **Docket** section at the end of your report:

- What you changed in the docs and annotations.
- What's waiting on them: intention you inferred that needs confirming,
  questions you recorded as open decisions, and gaps and tradeoffs you added,
  each with its impact, likelihood and reach.

## Committing

Don't commit unless you're asked to. When you do, the commit says what
anything it removed became, so history can follow it. That's a
`Docket-Became` trailer, one of git's own trailers, for each pair:

```sh
git commit --trailer "Docket-Became: component:ledger#slow-balances -> component:ledger#balance-worked-out-on-read"
```

- **`docket diff` lists what the change removed with no trailer yet.** For
  each, say what it became, if it became anything: a gap accepted as a
  tradeoff under another key, or a capability split in two. Something closed,
  dropped or answered with nothing to show needs none. Ask when you aren't
  sure.
- **`docket rename` prints the trailer for its rename.** Pass it to
  `git commit` as it is.
- **Trailers go in the trailer block**, the message's last paragraph, beside
  any others such as `Co-authored-by`. When the work will be squash-merged,
  put them in the pull request's description too, since a squash keeps only
  the merged message's own trailers.
- **`docket check --commits origin/main..HEAD`** checks the trailers in your
  commits.

## More

| When                                                    | Read                                           |
| ------------------------------------------------------- | ---------------------------------------------- |
| Writing or changing any doc                             | [docs.md](docs.md)                             |
| Adding or closing a gap, tradeoff or decision           | [gaps-and-decisions.md](gaps-and-decisions.md) |
| Adding or moving an annotation                          | [annotations.md](annotations.md)               |
| Deciding what a level allows, or promoting a capability | [stability.md](stability.md)                   |
| Naming a checklist outcome                              | `docket checklist`                             |
| Bringing Docket to a repository that doesn't have it    | [adopting.md](adopting.md)                     |

This project's own instructions win over this skill, wherever they're written,
except that nothing an agent infers counts as declared until a person confirms
it.
