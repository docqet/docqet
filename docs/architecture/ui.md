# The UI

_How the UI gets from reading state files to reading only the server's API.
Part of [how `docket` is built](README.md)._

**The UI will read only from the server's API.** Today it reads
`projects.json` and whole `state.json` files, and works out combining,
maturity, readiness and risk itself in TypeScript. That goes once the
resources exist:

1. **Until then, `serve` and `docket ui` serve what the UI reads today**:
   `projects.json` and each project's `state.json`, from
   `internal/handlers/http`'s `StatesHandler`.
2. **The UI moves to the resources view by view**, as the read service and
   `derive` can serve each one. Its own combining and deriving are deleted as
   they're replaced.
3. **`projects.json` and the `StatesHandler` go** when the last view has
   moved, and the UI's dev server stops reading `examples/` itself.
4. **Make targets load the examples into the local server**, so the UI has
   real states to show while it's developed. The examples are folders in this
   repository rather than repositories of their own, so loading them sends
   each example's state as it is, rather than running `docket apply` over
   commits. How is decided when it's built.
