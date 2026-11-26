# Contributing to Docqet

Thanks for your interest in Docqet. Contributions are welcome: bug reports,
ideas, docs, examples, tests and code.

This guide covers what's specific to Docqet. It builds on Exalynt's
[contributing guide](https://github.com/exalynt/community/blob/main/CONTRIBUTING.md),
which applies to every Exalynt project. By taking part, you agree to follow
the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

Docqet is a **Prototype**. The format, the commands and the UI may all
change a lot, so:

- **Small fixes** (typos, broken links, clear bugs) can go straight to a
  pull request.
- **Anything larger** (a new command, a change to the format, a new
  dependency) should start as an [issue](https://github.com/exalynt/docqet/issues),
  so we can agree on the problem before you put time into a solution.
- **Questions and open-ended ideas** go in
  [Exalynt's discussions](https://github.com/exalynt/community/discussions).

Check the open decisions in [`docqet/`](docqet/) too. If your idea touches
one, say so in the issue. [Docqet's principles](docs/principles.md) say what
belongs in Docqet and what doesn't.

## Setting up

You need Go (the version in [`go.mod`](go.mod)), Node 24 for the UI, and
`make`. Docker is optional.

```sh
git clone https://github.com/exalynt/docqet.git
cd docqet
cd ui && npm ci && cd ..
make test       # Go tests
make check      # formatting, vet, lint, docs and UI lint: run before every commit
```

[Developing](docs/developing.md) shows how to run the server and the UI
locally. [How `docqet` is built](docs/architecture/) explains the code.

## Docqet is documented with Docqet

This repository uses its own format. Its docs in [`docqet/`](docqet/) say
what Docqet does, its rules, and its gaps, tradeoffs and open decisions.
[This repository](docs/repository.md) says what's what. When you change
Docqet, keep those docs true in the same pull request:

- **Run `go run ./cmd/docqet touches <paths>`** before you change code. It
  lists the capabilities and rules involved, and any gaps or tradeoffs. A
  `docqet:tradeoff` comment means the code is deliberate.
- **Update the docs with the code.** If what Docqet does, must do or still
  lacks changes, update its docs and `docqet:` annotations in the same
  change. A change to the format changes its concept docs, in
  `docqet/domains/*/concepts/`.
- **Rename IDs with `docqet rename`**, never by hand.
- **Leave stability levels alone.** Maintainers decide them.
- **Finish with `go run ./cmd/docqet check --changed`**, which must report no
  problems.

Use `go run ./cmd/docqet` rather than an installed `docqet`, so you're
running the code you're changing.

### A few things that catch people out

- **`examples/` holds separate projects**, used as fixtures. Their
  `.docqet/state.json` files are written by hand, so never run `docqet index`
  in them without `--stdout`.
- **The agent kit's source is [`kit/`](kit/).** The copy in
  `.claude/skills/docqet/`, and the Docqet block in `CLAUDE.md`, are
  generated. Edit `kit/`, then run `go run ./cmd/docqet kit update`. CI fails
  if they differ. A change to a command's flags or output that the kit names
  changes the kit too.
- **`ui/` is built into the binary.** Run `make ui-build` before `go build`
  if you want the real UI in it.

## Pull requests

- **Keep each one focused** on one problem, and link its issue.
- **Say what changed and why**, how you tested it, and what it changed in
  `docqet/`. `go run ./cmd/docqet diff` shows that.
- **Include tests** for bug fixes and new behavior where practical.
- **Write commit messages** as one plain sentence saying what the change
  does, such as "Show every read's loading and failure". No prefixes needed.
  We may squash when merging.

CI checks every pull request: Go formatting, vet, lint, tests and `govulncheck`,
the UI's lint, format and build, the API docs lint, the Docker build,
`docqet check` and `docqet kit check`.

## Using AI agents

Agents are welcome, and Docqet is built with them. This repository has the
agent kit installed for Claude Code, and [`CLAUDE.md`](CLAUDE.md) gives an
agent the rules above. Whatever tools you use, you're responsible for what
you submit: understand it, test it, and check any intention an agent
inferred before it goes into `docqet/`.

## Reporting security issues

Please don't open a public issue for a vulnerability. See
[SECURITY.md](SECURITY.md).

## License

Docqet is [MIT licensed](LICENSE). By contributing, you agree that your
contribution is licensed under the same terms.
