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

Run anywhere in a [project](project.md)'s folder, it indexes that project, the
one whose `docket.yaml` is nearest above:

```sh
docket index
```

It reads `docket.yaml`, every Markdown file in the project whose frontmatter
has `docket`, wherever it is, and every file in the project for annotations,
leaving out folders inside it with a `docket.yaml` of their own. It writes
`.docket/state.json` beside `docket.yaml`, which is gitignored. Where a doc is
tells it nothing:

```text
docket.yaml                    → the project's ID and name
**/*.md with `docket:`         → docs, links, levels, gaps, tradeoffs
src/**, test/**, db/**, ...    → annotations
                               ⇒ .docket/state.json
```

## Not to be confused with

- The server and the UI: the server holds the states it's sent, and the UI
  shows what `docket` works out from them. Neither reads the repository.
