# Tool

The `docket` command and the UI.

- **`docket index`** reads the docs, scans the code and tests for
  annotations, and writes `state.json`, stamped with the commit it describes.
  Not built yet.
- **[The UI](ui/)** reads only `state.json`. It answers, at a glance: what the
  software can do, who it serves and how far along it is for each of them, how
  stable each capability is, the rules each follows, and what the known gaps
  are. A rule shows the code and tests that point at it.

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

With more than one project on a platform, the UI shows them all on one map:

- **Seeing them**: each card says which projects define it, and so does each
  search result and doc in the side panel. Each domain is one region, holding
  every project's part of it, and a feature that spans domains has a card in
  each, saying where else it is.
- **Platforms**: the map shows one platform at a time, the projects whose
  `docket.yaml` names the same platform. The platform's name in the header
  opens a list of every platform to switch to, each with its maturity, then
  the platform's projects to tick, some or all of them. Searching for a
  project and choosing it shows only that one. The map, search, concepts,
  counts and maturity then cover only those, and
  `?platform=<id>&project=<id>,<id>` in the address says which are showing.
  With no platform named, it's the first, and with no projects named, all of
  its projects are. Each platform keeps its own card layout.
- **Maturity**: with one project showing, the header has its own. With
  several, it's worked out from all their parts of features, the same way as
  one project's, and its popover lists each project's.

The side panel summarizes a doc: what it is, what's left, and what it's
connected to. Its **Details** link opens everything about it, such as each
rule's evidence, the stability checklist and the code, in a new tab, at an
address like `?capability=deposits` that keeps the projects showing.

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
