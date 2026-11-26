# Indexing

_How a project's docs and annotations become its state. Part of [how `docket`
is built](README.md)._

```go
func Index(project fs.FS) (*state.State, error)
```

- **It reads an `fs.FS` rooted at the project's folder**, the one with its
  `docket.yaml`. The working tree is `os.DirFS(root)`. A commit is an `fs.FS`
  over its tree in git, so `index --at`, `history` and `apply` index commits
  without checking them out, with the same code.
- **YAML is read with `go.yaml.in/yaml/v3`.** The standard library has no
  YAML, and this is the YAML organization's maintained continuation of
  `gopkg.in/yaml.v3`. Its nodes carry line numbers, which problems need to
  say `file:line`.
- **Only the CLI indexes.** The server never reads a repository, so it never
  calls `index`. What the CLI and the server share is `state`, `combine`,
  `derive` and `diff`.
- **The examples are its target.** Each example's `state.json` is written by
  hand to show what indexing should produce. Running `docket index --stdout`
  in an example and comparing it with that file checks the indexer by hand,
  as a Prototype is checked.
