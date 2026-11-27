# This repository

_We use Docqet to build Docqet, so this repository is a Docqet project as
well as the home of the format. It's easy to mix up what's Docqet's and
what's an example, so this says which is which._

| What                      | Where                                                                                 | It says                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Docqet, the product**   | [`docqet.yaml`](../docqet.yaml) and [`docqet/`](../docqet/)                           | What Docqet does and must never do, in Docqet's format: its personas and problems, capabilities, rules, and its gaps, tradeoffs and open decisions                    |
| **The format**            | The concepts in [`docqet/concepts/`](../docqet/concepts/) | What the words mean: what a capability, rule or gap is, and how each is written                                                                          |
| **The stability rubric**  | [`internal/rubric/rubric.yml`](../internal/rubric/rubric.yml)                         | What each stability level expects, built into `docqet`, and explained by the [stability rubric](../docqet/concepts/rubric.md) concept |
| **How `docqet` is built** | [`docs/architecture/`](architecture/)                                                 | How the code is laid out and why, linked from the components in `docqet/`                                                                                |
| **Examples**              | [`examples/`](../examples/)                                                           | Other, made-up projects, each a Docqet project of its own                                                                                                |

- **What we're working on lives in `docqet/`.** Gaps, tradeoffs and open
  decisions are written there, on the capability, feature, mechanism or
  component they're about, not as lists in other docs.
- **A concept defines a word, and a rule is one Docqet follows.** The
  [rule](../docqet/concepts/rule.md) concept says what a
  rule is in any project. A rule doc in `docqet/`, such as "nothing is read
  from an ignored file", is a rule Docqet itself follows.
- **The examples are separate projects.** Each has a `docqet.yaml` of its
  own, so indexing this repository leaves them out.
- **[`.docqetignore`](../.docqetignore) leaves out the kit's skill files.**
  They show example annotations about the hotel projects, which would
  otherwise be read as Docqet's own evidence.

`docqet check` at the root checks Docqet's own docs, and `docqet index` then
`docqet ui` shows them.

## Layout

| Directory                       | What's in it                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [`docqet/`](../docqet/)         | Docqet's own Docqet docs: what it does, the concepts that define the format, and its gaps, tradeoffs and open decisions |
| [`docs/`](.)                    | Docs about Docqet that aren't Docqet docs, such as [how `docqet` is built](architecture/)                   |
| [`examples/`](../examples/)     | Example projects laid out as repositories, each with the `state.json` indexing would produce                 |
| [`kit/`](../kit/)               | The agent development kit: skills and rules that keep docs and annotations current                           |
| [`cmd/docqet/`](../cmd/docqet/) | `docqet`, the Go program that's the CLI and the server, with the draft of its commands                       |
| `internal/`                     | `docqet`'s code, and the [stability rubric](../internal/rubric/rubric.yml) it's built with                   |
| [`ui/`](../ui/)                 | The UI `docqet` serves, built into the binary                                                                |
