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
maturity and the rest. So the concept docs in each domain's `concepts/` folder
are the definition of the format. There's no separate spec.

- **Start with the domains.** [Authoring](domains/authoring/domain.md)
  introduces writing intention down and how the concepts fit together.
  [Reporting](domains/reporting/domain.md) introduces how it's shown:
  maturity, readiness, risk and what's left.
- **A concept defines a word for any project.** The
  [rule](domains/authoring/concepts/rule.md) concept says what a rule is
  wherever Docqet is used.
- **A rule, capability or gap here is Docqet's own.** A rule doc in
  [`domains/authoring/rules/`](domains/authoring/rules/), such as "nothing is
  read from an ignored file", is a rule Docqet itself follows.
- **The [stability rubric](domains/authoring/concepts/rubric.md)** is data
  `docqet` is built with, so it lives with the code, in
  [`internal/rubric/rubric.yml`](../internal/rubric/rubric.yml).
  The concept explains it.

## What's here, and what isn't

| Here, in `docqet/`                                         | Elsewhere                                                                                            |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| What Docqet does: its domains, features and capabilities   | `docqet`'s code: [`internal/`](../internal/), [`cmd/`](../cmd/), [`ui/`](../ui/)                     |
| What the format's words mean: its concepts                 | The stability rubric's data: [`internal/rubric/`](../internal/rubric/)                        |
| The rules Docqet follows, such as "a draft claims nothing" | How `docqet`'s code is laid out and why: [`docs/architecture/`](../docs/architecture/)               |
| Who Docqet is for: its personas                            | The agent kit that `docqet kit` installs: [`kit/`](../kit/)                                          |
| Docqet's gaps, tradeoffs and open decisions                | Made-up projects that show the format: [`examples/`](../examples/), each a Docqet project of its own |

## Layout

```text
docqet/
├── personas/              who Docqet is for
├── domains/
│   ├── authoring/         writing intention and annotations, then indexing and checking them
│   │   ├── domain.md      the entry point to the format
│   │   ├── concepts/      the format's words: doc, capability, rule, gap, annotation…
│   │   ├── features/
│   │   ├── capabilities/
│   │   └── rules/
│   └── reporting/         the server, maturity and readiness, history, and the UI
│       └── …              the same, with maturity, readiness, risk and exposure as concepts
├── mechanisms/            how something works across docqet's code
└── components/            one area of docqet's code, linked to docs/architecture/
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
