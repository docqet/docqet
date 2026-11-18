# Tool

The `docket` command and the UI.

- **`docket index`** reads the docs, scans the code and test annotations, takes
  in test results (Cucumber JSON, JUnit XML), and writes `state.json`, stamped
  with the commit it describes. Not built yet.
- **[The UI](ui/)** reads only `state.json`. It answers, at a glance: what the
  software can do, who it serves and how far along it is for each of them, how
  stable each capability is, which rules are enforced, and what the known gaps
  are. Each answer links to the code and tests behind it.

The UI shows several projects together, each from its own `state.json`. Before
a view shows projects belonging to different clients, it needs access control,
so one client never sees another's projects.

## Running the UI

```sh
cd tool/ui
npm install
npm run dev                                   # every project in spec/examples
DOCKET_STATE=path/to/state.json npm run dev   # any other state.json
DOCKET_STATE=a/state.json:b/state.json npm run dev   # several, separated as in PATH
```

With more than one project, the UI shows them all on one map:

- **Seeing them**: each card says which projects define it, and so does each
  search result and doc in the side panel. Each domain is one region, holding
  every project's part of it, and a feature that spans domains has a card in
  each, saying where else it is.
- **Filtering them**: the projects' name in the header opens a list to tick
  some or all of them, each with its maturity, and searching for a project and
  choosing it shows only that one. The map, search, concepts, counts and
  maturity then cover only those, and `?project=<id>,<id>` in the address says
  which are showing. With none named, all of them are.
- **Maturity**: with one project showing, the header has its own. With
  several, it's worked out from all their parts of features, the same way as
  one project's, and its popover lists each project's.

`npm run build` writes a static site to `dist/`. Put a `state.json` beside its
`index.html` and serve the folder. Nothing else runs on the server. To show
several projects, put a `projects.json` there instead, listing where each
one's `state.json` is, relative to the page:

```json
{
  "projects": [
    { "state": "hotel-bookings/state.json" },
    { "state": "hotel-billing/state.json" }
  ]
}
```

Everyone who can open the page can see every project it lists, so list only
projects they're all allowed to see.
