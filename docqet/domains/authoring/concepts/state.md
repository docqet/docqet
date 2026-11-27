---
docqet: concept
id: state
domain: authoring
name: State
description: >-
  What the [indexer](indexer.md) writes: a snapshot of a project at one commit,
  with everything declared and derived.
confused-with:
  - concept: "concept:doc"
    summary: >-
      what people write. The state is what's worked out from the docs, and nobody edits it by hand.
---

Everything Docqet shows is worked out from states, never from the repository
directly. `docqet` works it out, as the CLI or as the server, and the UI only
shows what `docqet` gives it. To show several projects together, `docqet`
reads each one's state and **combines** them: it puts each doc's
contributions together, works out reverse links again across them, and finds
the [contradictions](../../understanding/concepts/contradiction.md) between them. Showing only some
projects combines just what they define.

Some things are worked out only when the state is shown, since they depend on
other projects: which outcomes a capability meets with evidence,
[risk](../../understanding/concepts/risk.md), [maturity](../../understanding/concepts/maturity.md) and [readiness](../../understanding/concepts/readiness.md).
`docqet` works these out too, and the UI never does.

A state can be of a working tree, uncommitted changes included, or of a
commit. The server keeps each project's state at every commit applied to it
on its main branch, so how anything changed is worked out by comparing them.

## How it's written

`docqet index` writes `.docqet/state.json`, one per project, beside its
`docqet.yaml`. It holds everything the UI needs, so showing several projects
together means reading each one's `state.json`.
[Hotel Bookings'](../../../../examples/hotel-bookings/.docqet/state.json),
with each list cut down to its keys:

```json
{
  "docqet": "0.1",
  "project": { "id": "hotel-bookings", "name": "Hotel Bookings" },
  "commit": "4f2c9e1",
  "indexedAt": "2026-11-18T15:04:00Z",
  "summary": {
    "capabilities": { "draft": 1, "prototype": 4, "alpha": 1, "beta": 2, "ga": 1 },
    "gaps": 4,
    "tradeoffs": 3,
    "findings": 0
  },
  "domains": [], "features": [], "personas": [], "problems": [], "constraints": [], "initiatives": [],
  "capabilities": [], "rules": [], "concepts": [], "mechanisms": [],
  "components": [], "gaps": [], "tradeoffs": [], "findings": [],
  "rubric": {}
}
```

## What's in it

- **Header**: the `project` (its ID and name), its `product` (ID and name)
  when `docqet.yaml` declares one, and the commit indexed.
- **Every `file` is from the project's folder**, the one with its
  `docqet.yaml`, such as `docqet/domains/billing/concepts/bill.md`, not from
  the repository's root, so a project reads the same wherever it is.
- **`summary`**: how many domains, features, personas, problems, constraints and initiatives there
  are, capabilities per level with `draft` among them, how many rules, gaps,
  tradeoffs, mechanisms, components and findings. This is the at-a-glance
  view.
- **`domains`**: each of the project's domain docs.
- **`features`**: each with its capabilities and its `tradeoffs`. Each
  capability names the feature it's in, as a reference, or `null`, and lists
  its `gaps` and `tradeoffs`, by ID. Its `stability` can be `"draft"`. It
  lists the problems it `solves`, and its `personas`, those of the problems
  it solves, worked out.
- **`personas`**: each with its `name`, `role` and `title`, `role` and
  `title` as `null` where it has none, the problems that name them, the
  capabilities that serve them, the features those are in, and the
  `initiatives` it lists, as references. Personas aren't in a domain, so
  these have no `domain`.
- **`problems`**: each with its ID, file, `name`, `description`, `cost`, or
  `null`, the `personas` it names, the capabilities that solve it, drafts
  among them, and its body. Problems aren't in a domain either.
- **`constraints`**: each with its ID, file, `name`, `description`,
  `source`, or `null`, the rules that respect it, with their domains, the
  mechanisms that respect it, and its body. A rule and a mechanism each list
  the constraints they `respect`.
- **`initiatives`**: each with its ID, file, `name`, `description`, the
  capabilities that list it, the features those are in, the personas that
  list it, and its body. Like personas, they have no `domain`. Each
  capability lists its `initiatives`, as references.
- **One list per doc type**: each entry has its ID, its `domain`, file, name,
  description, and links, in both directions, its type's other frontmatter
  fields, and its `body` as Markdown, exactly as written, or `""` with none.
  A doc declared in two of the project's domains has an entry for each. Its
  own `id` is bare, as its frontmatter has it. Its links, in both directions,
  are references, `<type>:<id>`, as declared, with `@<domain>` where the doc
  named one.
- **Fields are named in camel case**, as the rest of `state.json` is:
  `confused-with` is `confusedWith`. A field the doc leaves out is there
  anyway, as `[]` for a list and `null` otherwise, such as a rule's `why` or
  a persona's `image`. Each decision is its `topic`, or `null`, its
  `question`, its `affects`, and its `impact`, `likelihood` and `reach`,
  each `null` when it isn't rated. Each `confusedWith` is its `concept` or
  `term`, the other `null`, and `summary`.
- **`mechanisms`** and **`components`**: each with its ID, file, name,
  `description`, `capabilities`, `meets`, its `gaps` and `tradeoffs` by ID,
  its `decisions`, its `evidence`, and its body. A component's
  `capabilities` are as it lists them. A mechanism also has `applies`, and
  its `capabilities` are worked out: every capability the project declares,
  other than drafts, then every one its components list that isn't already
  there. For one that applies to its product, that's only this project's
  part, since the indexer can't see the others: combining adds the rest.
  They're in no domain, so they have no `domain`.
- **Evidence**: each rule's, capability's, mechanism's and component's entry
  also has `evidence`, with `verifies` and `implements` lists of each place's
  `file`, `line` and `text`, as [annotation](annotation.md) describes. Both
  are empty when it has none.
- **`gaps`**: every gap from every doc, each with its ID, its `domain` when
  it's a capability's, the references it `affects` as written, its `impact`,
  `likelihood` and `reach`, its `name` and `description`, and
  `places`: where `docqet:gap` annotations mark it, in the same shape as
  evidence.
- **`tradeoffs`**: every tradeoff from every doc, each with its ID, its
  `domain` when it's a feature's or capability's, the outcomes it `affects`,
  `name`, `description`, `benefit`, or `null` where it has none, `drawback`,
  and `places`, from `docqet:tradeoff` annotations.
- **`findings`**: everything the indexer found wrong, each about a doc with
  that doc's `domain` (see [finding](finding.md)).
- **`rubric`**: [the stability rubric](rubric.md) the project was
  indexed against, so the UI can show it beside each capability. It's the
  YAML's `kinds`, and its `qualities`, each with its `levels` as a list in
  level order. Each level has its `level`, `summary` as `null` where it has
  none, and its `outcomes`, `implementation` and `overengineering`, each a
  list, empty where it has none. Each outcome has its reference,
  `outcome:<quality>/<level>/<id>`, as its ID, its `level`, `text`, `until`
  as `null` where it has none, and its own `implementation` and
  `overengineering`. Every example in either is its `text` and `kinds`, with
  `kinds` empty where it isn't tagged.
