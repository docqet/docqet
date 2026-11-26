# UI

How Docket shows things. The UI gets everything from `docket`'s API and works
nothing out itself: the server combines a product's projects and works out
maturity, readiness and risk, as described below. It's built into the binary,
and `docket serve` and `docket ui` serve it. It answers, at a
glance: what the software can do, who it serves and how far along it is for
each of them, how stable each capability is, the rules each follows, and what
the gaps are. A rule shows the code and tests that point at it.

The UI shows a product's projects together, as the server put them together.
One Docket server serves one client, so every project it shows belongs to
that client, and there's no sign-in yet. See
[Docket's parts](../docs/parts.md#docket).

## Running the UI

The dev server passes `/api` on to a running Docket server, so start one and
give it something to show first:

```sh
make run                                      # the server, on localhost:8080
make examples                                 # load the examples into it, or make apply for Docket itself
cd ui && npm install && npm run dev
DOCKET_API=http://localhost:8090 npm run dev  # or another server, such as make build's
```

### How it's laid out

A bar across the top says where you are and finds anything: the product and
its projects, the initiative showing, search, and the glossary of Docket's
words. A nav down the side picks which question you're asking:

| Section        | Answers                                                                                                                                              | Address                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Overview       | How is it doing? Maturity, readiness and what it still needs, who it's least ready for, where each domain stands, the riskiest gaps                  | (none)                        |
| Map            | How does it fit together? Domains, features and capabilities on a canvas, with their personas                                                        | `?view=map`                   |
| Features       | What can it do? Domains, features and capabilities as a tree                                                                                         | `?view=features`              |
| Personas       | Who it serves, and how ready it is for each                                                                                                          | `?view=personas`              |
| Initiatives    | Bodies of work, such as the MVP, and how ready each is                                                                                               | `?view=initiatives`           |
| Language       | What the words mean: concepts, and the rules that must hold                                                                                          | `?view=language`              |
| How it's built | Mechanisms and components                                                                                                                            | `?view=built`                 |
| What's left    | Gaps and open decisions, for everything or one project, persona, initiative, domain, feature or capability, filtered and ordered by any part of risk | `?view=left&for=persona:<id>` |
| Decided        | Tradeoffs and non-goals                                                                                                                              | `?view=decided`               |
| Doc problems   | Contradictions and mistakes in the docs                                                                                                              | `?view=problems`              |

Every domain, feature, capability, persona, initiative, concept, rule,
mechanism, component and gap has a page of its own, such as
`?capability=deposits`: a header saying what it is and how it's doing, then
tabs, each answering one question about it, kept in the address as
`&tab=left`. A count in a header links to the tab that lists what it counts.
Every link opens in the same tab, so back returns, and the product, the
projects and the initiative showing ride along in the address.

Initiative, in the top bar, shows Everything or one initiative. It's hidden
when the product has none. Showing one initiative, every page shows only its
capabilities and personas, every number counts only those, and
`?scope=<initiative-id>` in the address says which. Switching product goes
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
the cards sit is this browser's own, for each product.

### Several projects

- **Products**: the UI shows one product at a time, the projects whose
  `docket.yaml` names the same product. The product's name in the top bar
  opens a list of every product to switch to, each with its maturity, then
  the product's projects to tick, some or all of them. Everything then covers
  only those, and `?product=<id>&project=<id>,<id>` in the address says which
  are showing. With no product named, it's the first, and with no projects
  named, all of its projects are.
- **Seeing them**: a doc's page and each search result say which projects
  define it. On the map, each domain is one region holding every project's
  part of it, and a feature that spans domains has a card in each.
- **Maturity**: the server works it out, for one project or several, the
  same way. With several showing, its popover lists each project's.

### Maturity and readiness

Two different questions, worked out by the server from each capability's
level, neither from the other:

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
  its impact, likelihood, reach and stability, whether it breaks a claim
  and why, and its score on each capability it's on. Then its links: the
  rules and expected outcomes it affects, the open decisions it waits on,
  what it shows on, and where the code marks it.
- **What's left** is the open decisions and the gaps, and nothing else:
  missing evidence is never something left to do. Counts of it show the gap
  and decision marks with how many, and the worst impact. Its page is for
  everything showing, or for one project, persona, domain, feature or
  capability, chosen at the top right, with each gap scored on that one's
  capabilities. Its tiles are the gaps, with their risk spread and how many
  there are at each risk, and the open decisions, each with what it affects
  and the risk of the riskiest gap waiting on it. Gaps are a table showing
  each one's risk, which opens how it's worked out, its impact, likelihood,
  reach, the stability of the capability it scores highest on, its kind, and
  whether it breaks a claim. Impact, likelihood and reach are tags, each
  value in its color, the same in the table, the filters and their popovers. Each of those is a filter, with counts given
  the others, and the gaps can be ordered by risk or grouped by any of them,
  or by what they're on, riskiest first within each. All of it is in the
  address.
- **Tradeoffs** are listed by what they're on, with no risk, since each is
  chosen. Opening one shows its drawback, its benefit where one is written
  down, the expected outcomes it falls short of on purpose, and any open
  decision that reopens it.
- **Drafts** show as the word Draft, with no mark, and count toward no
  maturity or readiness.
- **The stability rubric** marks each outcome not met (a gap affects it), not met by
  choice (a tradeoff affects it), open (a decision affects it), met with evidence (a mechanism or component the capability is
  built on meets it), or met on its level's word.

`npm run build` writes the UI to `dist/`, which `go build` embeds in the
binary, so `docket serve` and `docket ui` serve it beside the API it reads.
