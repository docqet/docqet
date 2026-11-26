# Reads

_How every read, in the terminal, the server or the UI, is worked out the same
way. Part of [how `docqet` is built](README.md)._

Every read goes through one read service, whoever asks:

```text
handlers/http ───┐
commands: list,  ├──▶ read service ──▶ combine, derive
  show, status   ┘          │
                     a source of states
               ┌────────────┼─────────────┐
          sqlite store   working tree    the server
          docqet serve   docqet ui,      --remote
                         local reads
```

- **The read service takes its states from a source**, chosen where the app
  is wired: the server's store for `docqet serve`, the working tree, indexed
  in memory, for `docqet ui` and local reads, and the server's API for
  `--remote`.
- **So every reader shows the same thing.** `docqet list gaps` calls the same
  method the `GET /gaps` handler does. `docqet ui` serves exactly the server's
  API, over the working tree instead of what was applied, so the UI can't
  tell which one it's talking to.
- **This is how [Where a read comes from](../../cmd/docqet/README.md#where-a-read-comes-from)
  is built.** The source flags choose the source. The computation after it is
  the same.
