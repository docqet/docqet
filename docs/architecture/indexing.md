# Indexing

_How a project's docs and annotations become its state, and how its problems
are found. Part of [how `docqet` is built](README.md)._

**Code:** `internal/index` (reading docs and annotations), `internal/check`
(problems a state shows), `internal/state` (the types), `internal/git` (the
files of the working tree or a commit).

```go
func Index(project fs.FS) (*state.State, error)
```

## Reading a project

- **It reads an `fs.FS` rooted at the project's folder**, the one with its
  `docqet.yaml`, and leaves out `.git`, `.docqet` and any folder with a
  `docqet.yaml` of its own, which is another project.
- **The working tree is the files git tracks or would**: `git ls-files
  --cached --others --exclude-standard`, so what `.gitignore` leaves out, such
  as `node_modules`, is never read. Outside a repository, it's every file.
- **A commit is its files from `git archive`**, read in the project's folder,
  so `index --at` and `apply` index commits without checking them out, with
  the same code.
- **YAML is read with `go.yaml.in/yaml/v3`.** The standard library has no
  YAML, and this is the YAML organization's maintained continuation of
  `gopkg.in/yaml.v3`. Its nodes carry line numbers, which problems need to
  say `file:line`.
- **It's pure.** The commit and the time it was indexed are the caller's to
  set, so the same files always index to the same state.
- **Only the CLI indexes.** The server never reads a repository, so it never
  calls `index`.

## What it works out

- **Each doc's entry**, from its frontmatter, with its body trimmed of the
  blank lines around it, and every list `[]` rather than `null`.
- **Evidence and places.** An annotation is recorded as its own line, with
  the text of the first line below it that isn't blank or another
  annotation, as the [annotation](../../docqet/domains/authoring/concepts/annotation.md)
  concept says. Every file is scanned in path order, so evidence is ordered by file,
  then line.
- **Reverse links.** A draft claims nothing, so it's left out of the
  capabilities that follow a rule or use a concept, though it still counts
  for its personas and initiatives, and as following a rule for
  `unlinked-rule`. A mechanism's capabilities are every capability the
  project declares but drafts, then each its components list.
- **The summary**, counting a feature written in several domains once.
- **The rubric**, embedded from
  `internal/rubric/rubric.yml` through the `rubric`
  package, as `ui` and `kit` embed theirs.

## Problems

Problems are found in two places, so the server can check a state the same
way the CLI does:

- **`check.Check` finds what a state shows on its own**: required fields,
  allowed values, links of the wrong type or to nothing, outcomes not in the
  rubric, duplicate IDs, unlinked rules, capabilities in two features.
  Each is about a doc, gap or tradeoff, its `subject`. `index` runs it on
  what it reads, and the server runs it again on every state it's sent.
- **`index` finds what only files show**: frontmatter that isn't YAML, a
  `docqet` type that isn't one, a doc or gap with no ID, an annotation naming
  nothing or a rule without its domain, and broken relative links. These
  have no `subject`, and say where they are with `file` and `line`.
- **`check.Validate` decides whether a state is one at all**: the format's
  version, a project, an ID for every entry. `apply` runs it before sending,
  and the server refuses a state that fails it. A state with problems in its
  docs is still a state.
- **The server keeps its own problems** (`check.Recheck`): it works them out
  again with `Check`, and keeps from what it's sent only the problems with
  no subject, which it can't see.

Every problem also carries its doc's `file`, beyond what the format lists, so
`docqet check` can say where to fix it.

## Checking it against the examples

Each example's `state.json` is written by hand to show what indexing should
produce. `docqet index --stdout` in an example, compared with that file field
by field, checks the indexer by hand, as a Prototype is checked. Hotel
Bookings matches exactly. The others differ only where the hand-written file
is out of date, such as Hotel Billing's, written before initiatives, or where
Exalynt UI's flags a mechanism's worked-out capabilities as unknown rather
than the component that lists them.

`docqet index` without `--stdout` writes over an example's hand-written
`state.json`, so compare with `--stdout`.
