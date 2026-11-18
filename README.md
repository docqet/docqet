# docket

See the true state of your software at a glance. A docs-as-data spec, agent kits that keep it current as you build, and a UI that shows capabilities, stability, rules, and known gaps, backed by code and tests.

## Layout

| Directory | What's in it |
|---|---|
| [`docs/`](docs/) | Docket's own docs, starting with [what its concepts mean](docs/domain/concepts.md) |
| [`spec/`](spec/) | The format: doc types, frontmatter, IDs, code and test annotations, and the `state.json` schema |
| [`kit/`](kit/) | Skills and rules that keep the docs and annotations current as agents build |
| [`tool/`](tool/) | The `docket` command (indexer) and the UI that reads its output |
