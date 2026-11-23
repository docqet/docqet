---
name: docket
description: How to read and keep current a repository's Docket docs (capabilities, features, rules, concepts, personas, domains, mechanisms, components, gaps, tradeoffs, open decisions, stability levels) and its docket:implements, verifies, gap and tradeoff annotations. Use in any repository with a docket.yaml, before changing its code, tests or docs, to learn what the change touches and what it must keep; while changing them, to update the docs and annotations in the same change; when a product decision is needed that nobody has made; and when bringing Docket to a repository that doesn't have it yet.
---

# Docket

Docket separates what software is meant to do from what it does. People
declare the intention in small Markdown docs beside the code. Code and tests
point back at it as evidence, and tools derive the rest: evidence, risk,
maturity, readiness and problems. Your job in a Docket repository is to read the
intention before you change anything, keep it true as you change things, and
leave decisions about intention with people.

## Where things are

```text
docket.yaml                                 the project's id and name, and its platform
docs/product/                               what it should do, in the domain's words
├── personas/<slug>.md                      who it serves, across every domain
└── domains/<domain>/
    ├── domain.md                           a part of the business with its own language
    ├── features/<slug>.md                  a job the product does, listing its capabilities
    ├── capabilities/<slug>.md              one result of value; the only docs with a level
    ├── rules/<topic>/<slug>.md             one rule per file: what must always or never happen
    └── concepts/<slug>.md                  what a word means in this domain
docs/technical/                             how it's meant to be built, in the code's words
├── mechanisms/<slug>.md                    how something works across the whole project
└── components/<slug>.md                    one area of the code, and the capabilities relying on it
.docket/state.json                          derived by `docket index`, never edited
```

A doc's ID is its path under its type's folder, without `.md`, so the rule
`docs/product/domains/guest-stays/rules/booking/no-double-booking.md` is
`booking/no-double-booking`. There's no `id:` field. Renaming or moving a file
changes its ID, and every link and annotation to it has to follow.

Each doc's structure is its YAML frontmatter. Its body is free Markdown that
nothing reads. [docs.md](docs.md) has every type's fields.

## Before a change

1. **Find what the change touches.** Search for annotations on the code
   you're changing (`grep -rn "docket:" <path>`), and for the code's area in
   `docs/technical/components/`. A component's `capabilities` lists the
   capabilities relying on it. A mechanism applies to every capability the
   project serves. When a task is described in product terms, search
   `docs/product/` for its words. If `.docket/state.json` exists, it has the
   links in both directions, but it may be out of date: the docs win.
2. **Read each capability it touches**: its `stability`, `personas`, the
   `rules` it follows, its `gaps`, `tradeoffs` and open `decisions`. Read
   those rules, with their `why`, and the concepts for any term you're unsure
   of. A capability can be written in several domains, each with its own
   level. Use the domain the change is in.
3. **Read the technical docs** for the code: how it works, its gaps, and its
   tradeoffs. A `docket:tradeoff` comment marks code that's wrong-looking on
   purpose. Leave it as it is unless the task is to change that choice.
4. **Check what the level allows** before planning. See
   [stability.md](stability.md). A part several capabilities share holds to the
   strictest of their levels.

When nothing in Docket covers the code, the change may still create something
that belongs there. Keep going and see the next section.

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
| A decision was made                                                        | Close it: `status: closed`, its `answer`, and in `became` what it was written as                                                          |
| A gap was closed                                                           | Remove it, its `docket:gap` annotations, and its key from any decision's `gaps`                                                           |
| Code now implements or verifies a rule, capability, mechanism or component | A `docket:implements` or `docket:verifies` annotation on it. See [annotations.md](annotations.md)                                         |
| A new area of code has something the code can't say                        | A component, with `docket:implements` on its entry points. Most code needs no doc                                                         |
| How something already documented works has changed                         | Its body, so it no longer says something untrue                                                                                           |
| A domain word is used in a new sense, or a new one appears                 | A concept, or a change to it                                                                                                              |
| A doc was renamed or moved                                                 | Every link and annotation to its old ID                                                                                                   |
| Code that an annotation names was deleted or moved                         | Move or remove the annotation with it                                                                                                     |

[gaps-and-decisions.md](gaps-and-decisions.md) covers gaps, tradeoffs and
decisions, including how to rate a gap's impact. [docs.md](docs.md) covers how
to write each doc.

Product docs never name pages, buttons, endpoints, tables or functions, so a
redesign doesn't make them wrong. Technical docs use the code's names. A gap
with a visible effect and a technical cause is the capability's gap, and the
component's body explains the cause.

## What you decide, and what you ask

Intention belongs to people. You can propose it, but it counts only once a
person has stated or confirmed it.

| Who decides | What                                                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A person    | What the software should do, its rules, who it serves, each capability's level, which feature a capability is in, whether a gap is closed later or accepted as a tradeoff       |
| You         | Annotations, what a technical doc says about how the code works, gaps you found or left, tradeoffs in how you built something, and each one's impact, all listed in your report |

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

Nothing checks Docket docs automatically yet, so check them yourself:

- Frontmatter is valid YAML, has each required field, and uses only the values
  the spec allows (see [docs.md](docs.md)).
- Every link and annotation resolves: search for each ID you wrote or renamed.
- Every rule is followed by at least one capability, and every capability is in
  at most one feature.
- Every gap's or tradeoff's `outcome` is an ID in
  [checklist.yml](checklist.yml).
- Nothing is in both the frontmatter and the body.
- No doc holds a secret, a real person's details, or real client data.

Then tell the user, in a short **Docket** section at the end of your report:

- What you changed in the docs and annotations.
- What's waiting on them: intention you inferred that needs confirming,
  questions you recorded as open decisions, and gaps and tradeoffs you added,
  each with its impact.

Don't commit unless you're asked to.

## More

| When                                                    | Read                                           |
| ------------------------------------------------------- | ---------------------------------------------- |
| Writing or changing any doc                             | [docs.md](docs.md)                             |
| Adding or closing a gap, tradeoff or decision           | [gaps-and-decisions.md](gaps-and-decisions.md) |
| Adding or moving an annotation                          | [annotations.md](annotations.md)               |
| Deciding what a level allows, or promoting a capability | [stability.md](stability.md)                   |
| Naming a checklist outcome                              | [checklist.yml](checklist.yml)                 |
| Bringing Docket to a repository that doesn't have it    | [adopting.md](adopting.md)                     |

This project's own instructions win over this skill, wherever they're written,
except that nothing an agent infers counts as declared until a person confirms
it.
