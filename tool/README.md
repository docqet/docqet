# Tool

The `docket` command and the UI.

- **`docket index`** reads the docs, scans the code and tests for
  annotations, and writes `state.json`, stamped with the commit it describes.
  Not built yet.
- **[The UI](ui/)** reads only `state.json`. It answers, at a glance: what the
  software can do, who it serves and how far along it is for each of them, how
  stable each capability is, the rules each follows, and what the gaps
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

The side panel summarizes a doc: what it is, how far along it is, what's
left, and who it serves. Its tradeoffs and the rules it follows are folded
until opened, each with how many it holds. Each rule it follows has the same
mark as on the checklist: held with evidence, held on trust, or not held yet,
when one of the capability's gaps names it. Its
**Details** link opens everything about it, such as what it's built on, each
rule's evidence, the stability checklist and the code, in a new tab, at an
address like `?capability=deposits` that keeps the projects showing.

Every doc shows what it is apart from its body, the same way everywhere.
First what it is, from its frontmatter: its name, description, level, and fields
such as a rule's why or what a concept is confused with. Then its body, the Markdown
its authors wrote, under *More about it*: folded in the side panel, the
concepts panel and a rule's row, and a section of its own on a detail page.
A doc with no body shows nothing there.

Where the software differs from what's intended shows where it's declared,
and wherever it matters. Each kind looks the same everywhere, on the map, in
the side panel, on a detail page and on the checklist: one mark and one color
per kind (gaps, open decisions, tradeoffs), and each
item a row with its mark, which a detail page adds more under. A gap's mark is
an open circle with a dotted edge, the same for product and technical gaps,
and each gap is labelled *Product* or *Technical*.

- **Open decisions** show on the map as their mark and how many: on each
  capability's row, after a feature's name and after a domain's, each
  counting its own. In the side panel's lists, each row counts what opening
  it shows under what's left; a domain's features, and mechanisms and
  components, count their own.
- **What's left** on a capability lists its open decisions and its gaps,
  and nothing else: missing evidence is never something left to do. Its gaps
  are one list: its product gaps, then
  the technical gaps of the mechanisms and components it's built on. Over the
  list, how many there are of each kind; with both, each count shows only
  that kind, and pressing it again shows all. A feature's or domain's
  adds its own open decisions; a persona's leaves technical gaps out.
- **Tradeoffs** show on their capability, and on a feature as what it's
  decided not to build: in the side panel, what was chosen; on the detail
  page, each with its benefits and drawbacks as lists, and the code it
  explains.
- **Drafts** show as the word Draft, with no mark, and count toward no
  maturity or readiness.
- **The checklist** marks each outcome not met, not met by choice (a tradeoff
  names it), met with evidence (a mechanism or component the capability is
  built on meets it), or met on its level's word. A tradeoff's detail card
  says which outcome it falls short of.
- **A mechanism's or component's page**, at `?mechanism=deployment` or
  `?component=bookings`, has how it's built, its technical gaps, tradeoffs,
  where it is in the code, the outcomes it meets, open decisions, and what it
  applies to or what relies on it.
- **Gaps and tradeoffs**, at `?view=gaps` and from the header, has every gap
  and tradeoff by what it's on, every open decision by where it is, for
  everything, product gaps, or technical gaps.

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
