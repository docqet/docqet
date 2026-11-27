---
docqet: concept
id: indexer
domain: authoring
name: Indexer
description: >-
  The program that reads a project's docs and annotations, and writes down
  everything derived about them, as the project's [state](state.md), for a
  particular commit.
confused-with:
  - term: "The server and the UI"
    summary: >-
      the server holds the states it's sent, and the UI shows what `docqet` works out from them. Neither reads the repository.
---

`docqet index` is Docqet's indexer, but the format belongs to no one tool:
anyone can write their own. It doesn't parse code, run tests or read their
results. It reads the [docs](doc.md), finds every
[annotation](annotation.md) by its text, and works out evidence, reverse
links and [findings](finding.md).

`docqet index` is one. The examples' state is written by hand, to show what
indexing should produce, and checks `docqet index` against it.

## How it's written

Run anywhere in a [project](project.md)'s folder, it indexes that project, the
one whose `docqet.yaml` is nearest above:

```sh
docqet index
```

It reads `docqet.yaml`, every Markdown file in the project whose frontmatter
has `docqet`, wherever it is, and every file in the project for annotations,
leaving out folders inside it with a `docqet.yaml` of their own, and whatever
the project's `.docqetignore` lists. It writes
`.docqet/state.json` beside `docqet.yaml`, which is gitignored. Where a doc is
tells it nothing:

```text
docqet.yaml                    → the project's ID and name
**/*.md with `docqet:`         → docs, links, levels, gaps, tradeoffs
src/**, test/**, db/**, ...    → annotations
                               ⇒ .docqet/state.json
```
