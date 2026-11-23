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

### How it's laid out

A bar across the top says where you are and finds anything: the platform and
its projects, search, and the glossary of Docket's words. A nav down the side
picks which question you're asking:

| Section | Answers | Address |
| --- | --- | --- |
| Overview | How is it doing? Maturity, what's left, who it's least ready for, where each domain stands, the riskiest gaps | (none) |
| Map | How does it fit together? Domains, features and capabilities on a canvas, with their personas | `?view=map` |
| Features | What can it do? Domains, features and capabilities as a tree | `?view=features` |
| Personas | Who it serves, and how ready it is for each | `?view=personas` |
| Language | What the words mean: concepts, and the rules that must hold | `?view=language` |
| How it's built | Mechanisms and components | `?view=built` |
| What's left | Gaps and open decisions, by impact | `?view=left` |
| Decided | Tradeoffs, non-goals and closed decisions | `?view=decided` |
| Doc problems | Contradictions and mistakes in the docs | `?view=problems` |

Every domain, feature, capability, persona, concept, rule, mechanism,
component and gap has a page of its own, such as `?capability=deposits`: a
header saying what it is and how it's doing, then tabs, each answering one
question about it, kept in the address as `&tab=left`. A count in a header
links to the tab that lists what it counts. Every link opens in the same tab,
so back returns, and the platform and projects showing ride along in the
address.

On the map, clicking something opens a small peek beside the canvas: what it
is, three figures, its riskiest gaps and a link to its page. "Color by" tints
the canvas by stability, risk, readiness for a persona, or evidence. Where
the cards sit is this browser's own, for each platform.

### Several projects

- **Platforms**: the UI shows one platform at a time, the projects whose
  `docket.yaml` names the same platform. The platform's name in the top bar
  opens a list of every platform to switch to, each with its maturity, then
  the platform's projects to tick, some or all of them. Everything then covers
  only those, and `?platform=<id>&project=<id>,<id>` in the address says which
  are showing. With no platform named, it's the first, and with no projects
  named, all of its projects are.
- **Seeing them**: a doc's page and each search result say which projects
  define it. On the map, each domain is one region holding every project's
  part of it, and a feature that spans domains has a card in each.
- **Maturity**: with several projects showing, it's worked out from all their
  parts of features, the same way as one project's, and its popover lists
  each project's.

### How things are shown

Every doc shows what it is apart from its body, the same way everywhere: first
what it is, from its frontmatter, then its body, the Markdown its authors
wrote, in its page's About tab. A doc with no body has no About tab.

Each of Docket's words, where it labels something, opens what it means on
hover. Each stability level, maturity, readiness and impact opens a popover
saying what it means for that thing. In lists, a capability's stability is
just its mark.

Where the software differs from what's intended shows where it's declared,
and wherever it matters, with one mark per kind everywhere: gaps, open
decisions and tradeoffs.

- **Gaps** are listed one line each, by name, grouped by impact, worst first,
  with the milder impacts folded. A gap's page has its name, what it's in, its
  impact, whether it breaks a promise, when it bites, and its links: the rule
  or checklist outcome it falls short of, what it shows on, the decision it
  waits on, and where the code marks it.
- **What's left** is the open decisions and the gaps, and nothing else:
  missing evidence is never something left to do. Counts of it show the gap
  and decision marks with how many, and the worst impact.
- **Tradeoffs** are listed the same way as gaps, grouped by their drawback's
  impact. Opening one shows its drawback, its benefit where one is written
  down, and the checklist outcome it falls short of on purpose.
- **Drafts** show as the word Draft, with no mark, and count toward no
  maturity or readiness.
- **The checklist** marks each outcome not met, not met by choice (a tradeoff
  names it), met with evidence (a mechanism or component the capability is
  built on meets it), or met on its level's word.

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
