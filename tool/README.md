# Tool

`docket` and the UI it serves.

- **[`docket`](cli/)** is one Go program, shipped as a binary and as a
  container image. As a CLI it indexes and checks a repository's docs,
  answers questions about them, follows how they change across commits, and
  sends state and test results to a Docket server. With `docket serve` it is
  that server, and with `docket ui` it shows the UI over a working tree. It
  works out everything Docket derives. Not built yet: its README is a draft of
  what we'll build.
- **[The UI](ui/)** is how Docket shows things. Once `docket` exists, it gets
  everything from `docket`'s API and works nothing out itself. Until then, it
  reads `state.json` files directly and works out maturity, readiness and risk
  itself, as described below. It answers, at a glance: what the
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
its projects, the initiative showing, search, and the glossary of Docket's
words. A nav down the side picks which question you're asking:

| Section | Answers | Address |
| --- | --- | --- |
| Overview | How is it doing? Maturity, readiness and what it still needs, who it's least ready for, where each domain stands, the riskiest gaps | (none) |
| Map | How does it fit together? Domains, features and capabilities on a canvas, with their personas | `?view=map` |
| Features | What can it do? Domains, features and capabilities as a tree | `?view=features` |
| Personas | Who it serves, and how ready it is for each | `?view=personas` |
| Initiatives | Bodies of work, such as the MVP, and how ready each is | `?view=initiatives` |
| Language | What the words mean: concepts, and the rules that must hold | `?view=language` |
| How it's built | Mechanisms and components | `?view=built` |
| What's left | Gaps and open decisions, for everything or one project, persona, initiative, domain, feature or capability, filtered and ordered by any part of risk | `?view=left&for=persona:<id>` |
| Decided | Tradeoffs and non-goals | `?view=decided` |
| Doc problems | Contradictions and mistakes in the docs | `?view=problems` |

Every domain, feature, capability, persona, initiative, concept, rule,
mechanism, component and gap has a page of its own, such as
`?capability=deposits`: a header saying what it is and how it's doing, then
tabs, each answering one question about it, kept in the address as
`&tab=left`. A count in a header links to the tab that lists what it counts.
Every link opens in the same tab, so back returns, and the platform, the
projects and the initiative showing ride along in the address.

Initiative, in the top bar, shows Everything or one initiative. It's hidden
when the platform has none. Showing one initiative, every page shows only its
capabilities and personas, every number counts only those, and
`?scope=<initiative-id>` in the address says which. Switching platform goes
back to Everything. Wherever a capability or persona is shown, tags name the
initiatives it's part of, and a feature, domain, rule, concept, mechanism,
component or gap shows those of its capabilities.

On the map, clicking something opens a small peek beside the canvas: what it
is, three figures, its riskiest gaps and a link to its page, all of it
whatever's showing. "Show" chooses what the canvas shows, one at a time:
Stability (each capability's level, and each feature's and domain's
maturity), Risk (the risk spread of each capability, feature and domain,
with rows tinted by risk) or Evidence (the evidence spread of each, how
their rules hold, tinted the same way). Each shows only its own marks, at
the right of each card and row. A persona's readiness always shows on their
card. Where
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
- **Maturity**: nothing in `state.json` says it, so the UI works it out,
  for one project or several, the same way. With several showing, its
  popover lists each project's.

### Maturity and readiness

Two different questions, worked out by the UI from each capability's level,
neither from the other:

- **Maturity** is how far along the work is, for planning: a weighted average
  of capabilities' level scores, drafts left out, in one of four bands. A
  domain's part of a feature counts its capabilities at their levels there.
  Anything spanning domains counts each capability once, at its level in
  short: a feature from its capabilities, and a project, or everything
  showing, from its features. A domain comes from its parts of features. It
  shows on features, domains, projects and the map, and on a persona's page
  as the maturity of what serves them.
- **Readiness** is how ready people can rely on it being, as a
  recommendation: the same weighted average as maturity, each capability at
  its level in short, except that one with a gap that's unacceptable on it
  scores as the level below its own until that's closed. It's a percentage in
  one of four quarters, Not ready, Partly ready, Mostly ready and Ready, drawn
  as a short straight bar from grey to green, never a ring, which is
  maturity's. Drafts are listed apart, as not
  started, and never count. It shows on personas, on a feature for a persona,
  on the overview, and on capability, feature and domain pages, each with
  what it still needs: each capability below Beta, or with an unacceptable
  gap, and what to do about it, linking to each.
- **Stability spread** is how many capabilities are at each level, as a
  short bar split by how many there are of each, in each level's color, with
  no number. It goes wherever maturity does, since maturity is worked out
  from it, and wherever capabilities are counted together. Its popover counts
  each level.
- **Risk spread** is how several gaps fall across the verdicts, as a short
  bar split by how many there are of each, with no number, since no one score
  stands for them all. Its popover counts each verdict and names the riskiest
  few. A single gap shows its own score, and its popover how it's worked out.

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
  with the milder impacts folded. A gap's page has its name, what it's in, and
  its risk profile, a section of its own: its risk, how it's worked out from
  its impact, likelihood, reach and stability, whether it breaks a promise
  and why, and its score on each capability it's on. Then its links: the rule
  or checklist outcome it falls short of, what it shows on, and where the
  code marks it.
- **What's left** is the open decisions and the gaps, and nothing else:
  missing evidence is never something left to do. Counts of it show the gap
  and decision marks with how many, and the worst impact. Its page is for
  everything showing, or for one project, persona, domain, feature or
  capability, chosen at the top right, with each gap scored on that one's
  capabilities. Its tiles are the gaps, with their risk spread and how many
  there are at each risk, and the open decisions. Gaps are a table showing
  each one's risk, which opens how it's worked out, its impact, likelihood,
  reach, the stability of the capability it scores highest on, its kind, and
  whether it breaks a promise. Impact, likelihood and reach are tags, each
  value in its color, the same in the table, the filters and their popovers. Each of those is a filter, with counts given
  the others, and the gaps can be ordered by risk or grouped by any of them,
  or by what they're on, riskiest first within each. All of it is in the
  address.
- **Tradeoffs** are listed by what they're on, with no risk, since each is
  chosen. Opening one shows its drawback, its benefit where one is written
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
