# Docqet's own docs

> [!IMPORTANT]
> **This folder isn't Docqet's code, and it isn't an example.** It's Docqet
> using Docqet: the docs that describe Docqet itself, written in Docqet's own
> format, the way any project that adopts Docqet writes its own. `docqet`
> doesn't read this folder, except to index this repository as a project like
> any other.

We build Docqet with Docqet. Together with [`docqet.yaml`](../docqet.yaml) at
the root of the repository, this folder makes the repository a Docqet project.
Its docs say what Docqet does and must never do, who it's for, what its words
mean, and what we're working on: its gaps, tradeoffs and open decisions.

## The format is defined here

Docqet's own concepts are the format's words: capability, rule, gap,
maturity and the rest. So the concept docs in [`concepts/`](concepts/) are
the definition of the format. There's no separate spec.

- **Start with the areas.** [Authoring](areas/authoring.md)
  introduces declaring intention, keeping it current, and how the concepts
  fit together. [Understanding](areas/understanding.md) introduces
  the questions Docqet answers for everyone involved, and what it works out
  to answer them: maturity, readiness, risk and improvements.
- **A concept defines a word for any project.** The
  [rule](concepts/rule.md) concept says what a rule is
  wherever Docqet is used.
- **A rule, capability or gap here is Docqet's own.** A rule doc in
  [`rules/`](rules/), such as "nothing is
  read from an ignored file", is a rule Docqet itself follows.
- **The [stability rubric](concepts/rubric.md)** is data
  `docqet` is built with, so it lives with the code, in
  [`internal/rubric/rubric.yml`](../internal/rubric/rubric.yml).
  The concept explains it.

## What's here, and what isn't

| Here, in `docqet/`                                         | Elsewhere                                                                                            |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| What Docqet does: its areas, features and capabilities     | `docqet`'s code: [`internal/`](../internal/), [`cmd/`](../cmd/), [`ui/`](../ui/)                     |
| What the format's words mean: its concepts                 | The stability rubric's data: [`internal/rubric/`](../internal/rubric/)                        |
| The rules Docqet follows, such as "a draft claims nothing" | How `docqet`'s code is laid out and why: [`docs/architecture/`](../docs/architecture/)               |
| Who Docqet is for: its personas                            | The agent kit that `docqet kit` installs: [`kit/`](../kit/)                                          |
| Docqet's gaps, tradeoffs and open decisions                | Made-up projects that show the format: [`examples/`](../examples/), each a Docqet project of its own |

## Layout

```text
docqet/
├── areas/
│   ├── authoring.md       declaring intention and evidence, and keeping both current: the entry point to the format
│   └── understanding.md   what everyone involved can learn from it: where it stands, what it means, what changed
├── features/
├── capabilities/
├── rules/                 what Docqet must always or never do
├── concepts/              the format's words: doc, capability, rule, gap, maturity, readiness…
├── personas/              who Docqet is for
├── problems/              the pain points they share
├── constraints/           what's imposed on Docqet from outside
├── mechanisms/            how something works across docqet's code
├── components/            one part of docqet's code, within a bigger one, linked to docs/architecture/
└── archetypes/            the kinds of component docqet has: a CLI, a service, a web app
```

## Working with it

- **Track work here, not in prose.** A gap, tradeoff or open decision goes on
  the capability, feature, mechanism or component it's about, not as a list
  in a README or an architecture doc.
- **Change it in the same commit as the code** it describes, as any Docqet
  project would. A change to the format changes its concept doc.
- **Check it** from the root of the repository:

  ```sh
  go run ./cmd/docqet check
  go run ./cmd/docqet index && go run ./cmd/docqet ui
  ```

- **[`.docqetignore`](../.docqetignore)** at the root leaves out the kit's
  skill files, since their example annotations about other projects would
  otherwise be read as Docqet's own evidence.

This README has no frontmatter, so it isn't a Docqet doc, and indexing leaves
it alone.
