# Tool

The `docket` command and the UI.

- **`docket index`** reads the docs, scans the code and test annotations, takes
  in test results (Cucumber JSON, JUnit XML), and writes `state.json`, stamped
  with the commit it describes. Not built yet.
- **[The UI](ui/)** reads only `state.json`. It answers, at a glance: what the
  software can do, how stable each capability is, which rules are enforced, and
  what the known gaps are. Each answer links to the code and tests behind it.

Planned order: a single repository first, aggregating several repositories
later. Before a view aggregates repositories belonging to different clients,
it needs access control, so one client never sees another's projects.

## Running the UI

```sh
cd tool/ui
npm install
npm run dev                                   # every project in spec/examples
DOCKET_STATE=path/to/state.json npm run dev   # any other state.json
DOCKET_STATE=a/state.json:b/state.json npm run dev   # several, separated as in PATH
```

The UI shows one project at a time. With more than one, the project's name in
the header switches between them, and `?project=<id>` in the address says which
is showing.

`npm run build` writes a static site to `dist/`. Put a `state.json` beside its
`index.html` and serve the folder. Nothing else runs on the server. To show
several projects, put a `projects.json` there instead, listing each project and
where its `state.json` is, relative to the page:

```json
{
  "projects": [
    { "id": "exalynt", "name": "Exalynt", "state": "exalynt/state.json" },
    { "id": "hotel-bookings", "name": "Hotel Bookings", "state": "hotel-bookings/state.json" }
  ]
}
```

Everyone who can open the page can see every project it lists, so list only
projects they're all allowed to see.
