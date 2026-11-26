# This repository

_We use Docket to build Docket, so this repository is a Docket project as
well as the home of the format. It's easy to mix up what's Docket's and
what's an example, so this says which is which._

| What                      | Where                                                                                 | It says                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Docket, the product**   | [`docket.yaml`](../docket.yaml) and [`docket/`](../docket/)                           | What Docket does and must never do, in Docket's format: its capabilities, rules, personas, and its gaps, tradeoffs and open decisions                    |
| **The format**            | The concepts in [`docket/domains/*/concepts/`](../docket/domains/authoring/concepts/) | What the words mean: what a capability, rule or gap is, and how each is written                                                                          |
| **The stability rubric**  | [`internal/rubric/rubric.yml`](../internal/rubric/rubric.yml)                         | What each stability level expects, built into `docket`, and explained by the [stability rubric](../docket/domains/authoring/concepts/rubric.md) concept |
| **How `docket` is built** | [`docs/architecture/`](architecture/)                                                 | How the code is laid out and why, linked from the components in `docket/`                                                                                |
| **Examples**              | [`examples/`](../examples/)                                                           | Other, made-up projects, each a Docket project of its own                                                                                                |

- **What we're working on lives in `docket/`.** Gaps, tradeoffs and open
  decisions are written there, on the capability, feature, mechanism or
  component they're about, not as lists in other docs.
- **A concept defines a word, and a rule is one Docket follows.** The
  [rule](../docket/domains/authoring/concepts/rule.md) concept says what a
  rule is in any project. A rule doc in `docket/`, such as "nothing is read
  from an ignored file", is a rule Docket itself follows.
- **The examples are separate projects.** Each has a `docket.yaml` of its
  own, so indexing this repository leaves them out.
- **[`.docketignore`](../.docketignore) leaves out the kit's skill files.**
  They show example annotations about the hotel projects, which would
  otherwise be read as Docket's own evidence.

`docket check` at the root checks Docket's own docs, and `docket index` then
`docket ui` shows them.

## Layout

| Directory                       | What's in it                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [`docket/`](../docket/)         | Docket's own Docket docs: what it does, the concepts that define the format, and its gaps, tradeoffs and open decisions |
| [`docs/`](.)                    | Docs about Docket that aren't Docket docs, such as [how `docket` is built](architecture/)                   |
| [`examples/`](../examples/)     | Example projects laid out as repositories, each with the `state.json` indexing would produce                 |
| [`kit/`](../kit/)               | The agent development kit: skills and rules that keep docs and annotations current                           |
| [`cmd/docket/`](../cmd/docket/) | `docket`, the Go program that's the CLI and the server, with the draft of its commands                       |
| `internal/`                     | `docket`'s code, and the [stability rubric](../internal/rubric/rubric.yml) it's built with                   |
| [`ui/`](../ui/)                 | The UI `docket` serves, built into the binary                                                                |
