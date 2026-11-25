# Indexer

The program that reads a project's docs and annotations, and writes down
everything derived about them, as the project's [state](state.md), for a
particular commit.

## Details

`docket index` is Docket's indexer, but the format belongs to no one tool:
anyone can write their own. It doesn't parse code, run tests or read their
results. It reads the [docs](doc.md), finds every
[annotation](annotation.md) by its text, and works out evidence, reverse
links and [problems](problem.md).

It isn't built yet. The examples' state is written by hand, to show what it
would produce.

## In the spec

Run at a repository's root:

```sh
docket index
```

It reads `docket.yaml`, every Markdown file whose frontmatter has `docket`,
wherever it is, and every file for annotations, and writes
`.docket/state.json`, which is gitignored. Where a doc is tells it nothing:

```text
docket.yaml                    → the project's ID and name
**/*.md with `docket:`         → docs, links, levels, gaps, tradeoffs
src/**, test/**, db/**, ...    → annotations
                               ⇒ .docket/state.json
```

## Not to be confused with

- The server and the UI: the server holds the states it's sent, and the UI
  shows what `docket` works out from them. Neither reads the repository.
