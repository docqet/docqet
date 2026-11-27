# <picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/logo/docqet-lockup-dark.svg"><img src="docs/assets/logo/docqet-lockup-light.svg" alt="docqet" height="44"></picture>

<a href="docqet/concepts/stability-level.md"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/stability-prototype-dark.svg">
  <img src="docs/assets/stability-prototype-light.svg" alt="Stability: Prototype · Exploring" height="18">
</picture></a>

**Intent as Code. Say what it's for. See where it stands. Know what would improve it.**

What your software is meant to do, written beside the code, linked to the
evidence of what it actually does, and readable by everyone with a stake in it.

> [!WARNING]
> Docqet is a **Prototype**. Anything here, the format included, may change
> completely or be thrown away. Don't build on it yet.

## The problem

Code shows what software does, not what it should do. A bug looks just like
a deliberate choice, and a half-built capability looks finished.

What it _should_ do lives in people's heads, or is scattered across wikis,
tickets and chat. None of it is linked to the code, so it drifts with every
change, and only people who read code can check it. Nobody can say for sure
which parts are ready to rely on.

AI agents now write much of the code. Without the software's purpose and
rules written down, they guess, and explain the bugs as if they were meant.

## What Docqet is

An open format, and the tools that read it, for writing down what your
software is meant to do: its capabilities, the rules they follow, the people
they serve, how stable each one is, and the gaps and tradeoffs you know about.

- **Intention is declared.** Each capability, rule or gap is a small Markdown
  doc in the repository, in the business's words ("a room can't be
  double-booked", not a database constraint), changed in the same commit as
  the code.
- **Evidence is linked.** Code and tests point back at what they implement
  and verify, with comments such as `docqet:implements` and `docqet:verifies`.
- **State is derived.** `docqet` reads both and works out the rest: each
  rule's evidence, each gap's risk, how mature and ready each part is, and
  any findings in the docs themselves.
- **The difference is the work.** Where intention and reality differ, Docqet
  shows it instead of hiding it.

With that, anyone, technical or not, person or agent, can see what the
software does and for whom, how stable each part is, what would make it
more ready, and the code and tests behind each rule.

## Who it's for

- **People who build the software**, engineers and agents, who need to know
  what it's meant to do before they change it.
- **People who depend on it**, such as product owners, designers, clients and
  support, who need to know what they can rely on without reading code.

Docqet works without agents. With them, its [agent kit](kit/) has them read
the rules before changing code and keep the docs current as they go. Nothing
an agent writes counts until a person confirms it.

## What it isn't

Not a task tracker, a test runner, or a score to maximize. It shows what's
missing and the evidence for what holds; people decide what it means and
when to act. See [Docqet's principles](docs/principles.md).

## Try it

```sh
go install github.com/docqet/docqet/cmd/docqet@latest

docqet init --id my-app --name "My App"   # writes docqet.yaml
docqet kit install                        # the agent kit
docqet check                              # exit 1 on any finding but advisory ones
```

[Installing](docs/installing.md) covers CI, and
[`examples/`](examples/) has made-up projects to look at.

## Learn more

- **The concepts.** The [Authoring](docqet/areas/authoring.md) and
  [Understanding](docqet/areas/understanding.md) areas, and their
  [concepts](docqet/concepts/), define the
  format: capabilities, rules, gaps, stability levels, maturity, readiness and
  the rest.
- **[Principles](docs/principles.md):** how Docqet supports software
  engineering, what it isn't, and what belongs in it.
- **[Docqet's parts](docs/parts.md):** the format, the kit, the `docqet` CLI
  and server, and where each is today.
- **[This repository](docs/repository.md):** Docqet is documented with
  Docqet, so here's what's Docqet's own docs, what's the format, and what's
  an example.
- **[Developing](docs/developing.md)** and
  [how `docqet` is built](docs/architecture/).

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md), and the
[Code of Conduct](CODE_OF_CONDUCT.md). Docqet is [MIT licensed](LICENSE).
