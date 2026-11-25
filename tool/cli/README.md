# The `docket` command

_A draft of what we'll build. None of it exists yet, and every command here
may change or be dropped._

One command for everything Docket does with a repository: setting it up,
indexing and checking its docs, answering questions about it, following how
it's changed, and sending its state and its test results to a Docket server.
Engineers use it at the terminal and in hooks, agents use it while they work,
CI uses it on every push, and people without the repository use it to ask
the server.

It's a Go program, and the same binary is also the Docket server and serves
the UI (see [the proposed architecture](../../README.md#proposed-architecture)).
Everything Docket works out is worked out in Go, once, so the command, the
server and the UI never disagree.

**Contents:** [Principles](#principles) · [Commands at a glance](#commands-at-a-glance) · [Where a read comes from](#where-a-read-comes-from) · [Setting up](#setting-up) · [Reading](#reading) · [History](#history) · [Acting on the server](#acting-on-the-server) · [Serving](#serving) · [How clients use it](#how-clients-use-it) · [Conventions](#conventions) · [Left out for now](#left-out-for-now) · [Open questions](#open-questions)

## Principles

- **The repository owns intention, and the server owns what was observed.**
  Docs, levels, gaps and decisions are only ever declared in the repository.
  The server holds what happened at each commit: the state indexed from it,
  and test and QA results. The command never asks the server to change
  intention, and the server never reads a repository.
- **History comes from git.** How a gap became a tradeoff, or a capability
  went from Alpha to Beta, is worked out by indexing commits and comparing
  them. Nothing records history by hand, and the server's history can always
  be rebuilt from git.
- **A read is the same wherever its states come from.** Listing gaps, showing
  a capability or working out readiness is one computation over some states.
  Which states, the working tree's, a commit's, the server's, this project's
  or the whole platform's, is chosen with flags on that command, never by
  something selected earlier. See [Where a read comes from](#where-a-read-comes-from).
- **It doesn't care where the repository is hosted.** It talks only to git
  and to the Docket server over HTTP. It never calls GitHub's, GitLab's or
  anyone else's API. Posting a comment on a pull request is the CI's job, and
  the command gives it the text.
- **Everything local works without a server.** Indexing, checking, reading
  and history all work offline. A server adds the rest of the platform and a
  shared timeline.
- **It's written for agents as much as for people.** Every command takes
  `--json`, says what it's showing, prompts only in a terminal, and uses the
  same exit codes as every other (see [Conventions](#conventions)).

## Commands at a glance

Reads take the [source flags](#where-a-read-comes-from). Commands that act on
the server are separate, since they aren't reads.

| Command | What for | Kind |
| --- | --- | --- |
| [`docket init`](#docket-init) | Make a folder a Docket project | Setting up |
| [`docket kit`](#docket-kit) | Install or update the agent kit | Setting up |
| [`docket index`](#docket-index) | Write the state for the working tree or a commit | Setting up |
| [`docket check`](#docket-check) | Find problems in the docs, annotations and commit trailers | Read |
| [`docket touches`](#docket-touches) | What a set of files or a change is about | Read |
| [`docket show`](#docket-show) | One doc, with everything derived about it | Read |
| [`docket list`](#docket-list) | Docs, gaps, decisions or tradeoffs, filtered and ordered | Read |
| [`docket status`](#docket-status) | Maturity, readiness and what's left, at a glance | Read |
| [`docket diff`](#docket-diff) | What changed in Docket between two points | Read |
| [`docket log`](#docket-log) | How one thing changed over time | Read |
| [`docket history`](#docket-history) | Index every commit on a branch, for history offline | Setting up |
| [`docket preview`](#docket-preview) | `diff --remote --platform`, for CI | Read |
| [`docket login`](#docket-login) | Sign in to a server, as a person | Server |
| [`docket apply`](#docket-apply) | Send the main branch's new commits to the server | Server |
| [`docket results`](#docket-results) | Send test or QA results for a commit | Server |
| [`docket ui`](#docket-ui) | Show the UI over the working tree, on this machine | Serving |
| [`docket serve`](#docket-serve) | Run the Docket server | Serving |

## Where a read comes from

Every read is worked out from one or more projects' states. Two questions
decide which, each with its own flag, and every read takes both.

**When:** whose version of this project.

| Flag | Reads | Needs |
| --- | --- | --- |
| _(none)_ | The working tree, uncommitted changes included | The repository |
| `--at <rev>` | Any commit, branch or tag, indexed from git without checking it out | The repository |
| `--remote` | The server's latest applied state for this project | The server |
| `--remote --at <rev>` | What the server applied at that commit | The server |

**Which projects:** this one, or the whole platform.

| Flag | Reads |
| --- | --- |
| _(none)_ | This project alone |
| `--platform` | This project, combined with every other project on its platform, as the server last applied them |

So the same command answers different questions:

```sh
docket list gaps                        # this project, as it is on my machine
docket list gaps --at v1.4              # this project, at a release
docket list gaps --remote               # this project, as the server has it
docket list gaps --platform             # my working tree, among the rest of the platform
docket list gaps --remote --platform    # the whole platform as the server has it: what the UI shows
```

- **Inside a repository, the working tree is the default**, since it's what
  engineers and agents want nearly every time.
- **Outside one, the server is the only source**, so `--remote` is implied,
  and `--platform <id>` or `--project <id>` says which. Someone with no clone
  can still ask: `docket list gaps --platform hotel`.
- **Nothing is selected and remembered.** No `docket use server`, no current
  context. What a command reads is in the command, so an agent checking its
  own change can never be shown the server's state by something run earlier,
  and a script means the same thing every time it's run.
- **The other projects in `--platform` always come from the server**, since
  their repositories aren't here. They're fetched when needed and kept in
  `.docket/platform/`, gitignored. When the server can't be reached, the
  copies kept there are used, and the output says how old they are.
- **With `--at` and `--platform`**, the other projects are as the server had
  them at that commit's time.
- **Every read says what it's showing.** Its first line, such as
  `hotel-bookings · working tree (4f2c9e1 + uncommitted)` or
  `hotel platform · server, applied 2026-11-20 15:04`, and a `source` field
  in its JSON:

  ```json
  "source": {
    "when": "working-tree",
    "commit": "4f2c9e1",
    "uncommitted": true,
    "projects": [
      { "id": "hotel-bookings", "from": "working-tree" },
      { "id": "hotel-billing", "from": "server", "commit": "a71c0de", "appliedAt": "2026-11-20T15:04:00Z" }
    ]
  }
  ```

## Setting up

### `docket init`

Writes `docket.yaml` in the current folder, making it a project: usually the
repository's root, or a package's folder in a repository with several. It asks
for the project's ID and name, and the platform it's part of, or takes them as
flags. It also adds `.docket/` to
`.gitignore`. It doesn't write any docs: the kit's `adopting.md` covers
bringing Docket to existing code.

```sh
docket init --id hotel-bookings --name "Hotel Bookings" --platform hotel
```

### `docket kit`

Installs the agent kit into the project, or updates it: the skill under
`.agents/skills/docket/`, the link from `.claude/skills/docket`, the block in
`AGENTS.md`, and the import in `CLAUDE.md`. It does what
[`kit/install.sh`](../../kit/install.sh) does today, and replaces it, so the
kit's version follows the command's.

```sh
docket kit           # install or update; safe to re-run
docket kit --check   # exit 1 if the project's copy is out of date, for CI
```

### `docket index`

Reads the docs and annotations and writes the project's state, as the
[spec](../../spec/README.md#index-output) describes. By default it indexes the
working tree, uncommitted changes included, into `.docket/state.json`.

```sh
docket index                  # working tree → .docket/state.json
docket index --at 4f2c9e1     # a commit, read from git, without checking it out
docket index --stdout         # print it instead of writing it
```

Indexing a commit reads its files straight from git, so it's fast enough to
run over hundreds of commits. `--at`, [history](#history) and
[`apply`](#docket-apply) depend on that.

Reads index whatever they need first, so nobody has to remember to run this.
It's for tools that want the state file itself.

## Reading

Each of these takes the [source flags](#where-a-read-comes-from). The
examples show the ones each is most often used with.

### `docket check`

Reports every [problem](../../spec/README.md#problems), with the file and line,
and exits 1 if there are any. It's what the kit's "Before you finish" list
asks agents to check by hand today.

```sh
docket check                          # everything in the working tree
docket check --changed                # only problems in files changed since the main branch
docket check --changed --base v1.4    # changed since some other point
docket check --commits origin/main..HEAD   # also check the Docket trailers in these commits
docket check --platform               # with the rest of the platform
```

- **`--changed`** keeps hooks and agents focused on their own change in a
  repository that already has problems. The main branch is `origin/HEAD`
  unless `--base` says otherwise.
- **`--commits`** checks every [trailer](#trailers) in a range: that each
  names something that existed before, and something that exists after.
- **`--platform`** resolves a link to a rule another project defines, and
  finds contradictions with other projects. Without it, a link into another
  project is reported as `unknown-id`, with a note that it may be defined
  elsewhere.

### `docket touches`

Given files, or a change, lists what they're about: the capabilities, rules,
mechanisms and components their annotations name, the capabilities relying on
those components, and each capability's level, gaps, tradeoffs and open
decisions. It's the kit's "Find what the change touches" step as one call.

```sh
docket touches src/booking/                  # files or folders
docket touches --staged                      # what's staged
docket touches --base origin/main            # everything the branch changes
docket touches src/billing/ --platform --json   # with capabilities other projects declare
```

```text
hotel-bookings · working tree (4f2c9e1 + uncommitted)

src/booking/availability.ts
  implements rule:no-double-booking@guest-stays
  implements component:bookings

component:bookings
  relied on by capability:room-booking (beta), capability:early-arrival (alpha)

capability:room-booking   Beta in Guest stays
  rules      no-double-booking, minimum-stay, same-day-turnover
  gaps       calendar-needs-a-mouse (blocking, certain, all)
  tradeoffs  one-room-per-booking
  decisions  none open
```

A change at Beta must not break anything, so an agent that sees this knows
what it has to keep before it plans. It's about files, so it reads a working
tree or a commit, and never `--remote` alone.

### `docket show`

One doc, with its frontmatter, its links in both directions, its evidence,
its gaps scored by risk, and its body as written. With `--remote`, its
evidence also shows the latest test and QA results for what verifies it.

```sh
docket show capability:room-booking
docket show rule:no-double-booking@guest-stays --remote --json
docket show capability:room-booking#calendar-needs-a-mouse   # a gap
```

### `docket list`

Docs of one kind, or gaps, decisions or tradeoffs, with the same filters
the UI's views have.

```sh
docket list capabilities --stability alpha
docket list gaps --initiative mvp --sort risk --platform
docket list gaps --for persona:front-desk-clerk --impact damaging,blocking
docket list decisions --domain guest-stays --remote
docket list tradeoffs --on component:ledger
```

### `docket status`

The overview, in the terminal: capabilities at each level, maturity and
readiness, what readiness still needs, the riskiest gaps, open decisions and
problems. `--initiative` and `--for` narrow it as the UI does.

```sh
docket status
docket status --remote --platform --initiative mvp
docket status --for persona:front-desk-clerk --json
```

Maturity, readiness and risk are worked out by readers, not the indexer, so
the command is a reader too. It's the same Go code the server uses, and the UI
shows only what that code works out, so `docket status` and the UI always
agree.

## History

How each thing changed is worked out from the states of successive commits.
`diff` compares two of them, and `log` follows one thing through all of them.
Locally, both index the commits they need from git, and keep them so the next
run is faster. With `--remote`, they read the server's timeline instead, and
nothing is indexed here.

### `docket diff`

What changed in Docket between two points, in Docket's words rather than as
lines: capabilities added, removed or moved between levels, gaps opened and
closed, decisions answered, rules gaining or losing evidence, new problems.

```sh
docket diff [<from>] [<to>]
```

Each point is a commit, branch or tag, or a state file. `<to>` is the working
tree when it's left out, and `<from>` is the last commit.

```sh
docket diff                       # last commit → working tree: what my change does
docket diff --staged              # last commit → what's staged
docket diff origin/main           # the main branch → working tree: what the branch does
docket diff v1.3 v1.4             # between two commits
docket diff a.json b.json         # between two state files
docket diff --remote              # what the server has → working tree
docket diff --remote v1.3 v1.4    # between two commits, as the server applied them
```

With `--remote` and no `<from>`, it starts from the newest commit the server
has applied that's in your history: the main branch where you are, or where
your branch left it. That's what merging would change, so it's what
[`preview`](#docket-preview) shows.

```text
hotel-bookings · last commit (9b1e004) → working tree

capability:early-arrival     alpha → beta
gap closed                   capability:room-booking#calendar-needs-a-mouse
decision answered            capability:refunds#where-the-money-goes
  became                     rule:refund-to-original-card@billing        (Docket-Became trailer)
  became                     capability:refunds#no-split-refunds         (gap, guessed)
rule:minimum-stay@guest-stays  +1 verifies (src/booking/stay.test.ts:14)
```

A **transition** is something removed that became something else. `diff`
finds them two ways:

- **Trailers** say so outright, and are trusted. See [Trailers](#trailers).
- **Guesses** fill in the rest: something removed, and something added on the
  same doc in the same commit, probably became it. A gap that keeps its key
  and turns into a tradeoff is the same thing with a new kind. Guesses are
  marked as guessed.

When `diff --staged` guesses a transition, it prints the trailer that would
confirm it, so an agent can put it in the commit message when it's right.

With `--platform`, it also shows what only the rest of the platform shows: a
contradiction with another project, a link to another project's doc resolving
or breaking, or readiness changing for a persona another project also serves.

### `docket log`

How one thing changed over time, newest first, each change with its commit
and date.

```sh
docket log capability:room-booking
docket log capability:room-booking --remote
docket log gaps --initiative mvp --since 2026-09-01 --remote --platform
```

```text
hotel-bookings · main, 0a9f6b3 → 9b1e004

2026-11-20  9b1e004  gap closed            #calendar-needs-a-mouse
2026-10-02  51ac7d2  promoted              alpha → beta
2026-09-14  e04f9aa  became tradeoff       #one-room-per-booking  (was a gap)
2026-08-30  c3d1a88  decision answered     #who-can-book → rule:staff-book-for-guests
2026-07-11  0a9f6b3  added                 draft
```

Locally it follows the current branch's first-parent line. With `--remote` it
follows the main branch as applied.

### `docket history`

Indexes each commit on a branch's first-parent line into
`.docket/history/<sha>.json`, skipping the ones already there. `diff` and
`log` do this for themselves as they need it, so it's only for building the
whole history ahead of time, such as before going offline.

```sh
docket history                    # the current branch, from its first commit
docket history --since 2026-06-01
docket history --branch release
```

### Trailers

A commit says what an answered decision or a removed gap became with a
`Docket-Became` trailer in its message:

```text
Settle refunds to the original card

Docket-Became: capability:refunds#where-the-money-goes -> rule:refund-to-original-card@billing, capability:refunds#no-split-refunds
```

- **One trailer per thing removed**, naming everything it became, separated
  by commas. A trailer is only needed where the guess would be wrong or
  missing.
- **History is in git, not in the docs.** The docs keep no link back to what
  they replaced, as the spec intends, and the link survives anyway.
- **They're found anywhere in the message**, not only in its last paragraph,
  since squash merges put each squashed commit's message into the body.
- **`docket check --commits` validates them**, and CI can run it on a branch
  before it merges.

Naming a decision this way needs decisions to have keys, the way gaps and
tradeoffs do. See [Open questions](#open-questions).

### `docket preview`

The same as `docket diff --remote --platform`: what merging the working tree's
branch would change on the server, across the platform. It's a name of its
own because it's what CI runs on every pull request, and `--format markdown`
gives it text to post there.

```sh
docket preview
docket preview --format markdown > docket-preview.md
```

Without a server, it's `docket diff` from the merge base with the main
branch, and says so.

## Acting on the server

The server holds each project's applied state at every commit on its main
branch, each commit's test and QA results, and the platform those projects
make up. These commands are how anything gets there. They aren't reads, so
they take no source flags.

### Signing in

Where the server is goes in `docket.yaml`, since it's not a secret:

```yaml
server: https://docket.example.com
```

Outside a repository, `DOCKET_SERVER` says where it is. There are two kinds
of credentials, and neither is ever written into the repository:

- **A project token** lets CI apply state and send results for one project,
  and nothing else. It's made on the server and kept in the CI's secrets as
  `DOCKET_TOKEN`.
- **A person's sign-in** lets them read the projects they're allowed to see,
  from `docket login`. Every `--remote` and `--platform` read uses it, and
  shows only what they're allowed to see.

#### `docket login`

Opens the server's sign-in in a browser and keeps the token in the user's
config directory, outside every repository. `docket logout` forgets it.

```sh
docket login
```

### `docket apply`

Sends the main branch's new commits to the server, oldest first:

1. Asks the server for the last commit it has for this project.
2. Walks from there to `HEAD` along the first-parent line, and indexes each
   commit.
3. Collects the trailers from every commit in the range, including commits
   brought in by a merge, and attaches each to the first-parent commit that
   brought it in.
4. Sends each commit's state with its SHA, parents, commit time and trailers.

```sh
docket apply                            # in CI, on the main branch
docket apply --from 0a9f6b3             # a project's first apply, or a backfill
docket apply --from 0a9f6b3 --replace   # re-index and replace, after a spec change
docket apply --dry-run                  # what would be sent
```

- **It's run on the main branch only.** CI decides when to run it: the
  command doesn't try to tell which branch is the main one.
- **Sending a commit twice changes nothing,** so a retried CI job is
  harmless, and a job that was skipped is caught up by the next one.
- **A push of several commits runs CI once,** at its head. Walking from the
  server's last commit covers every commit in between.
- **When the server's last commit isn't in the branch's history**, because
  main was rewritten, it stops and says so, rather than guessing. `--from`
  then says where to start.
- **What leaves the repository** is the state: every doc's frontmatter and
  body, and, for each annotation, its file, line and the one line of code
  below it. No other code, and nothing about who made each commit.

### `docket results`

Sends results for a commit, `HEAD` unless `--commit` says otherwise. The
server keeps them as sent and matches them to Docket when it shows them, so
a better matcher later works on old results too.

```sh
docket results junit reports/*.xml               # automated tests
docket results qa qa-run.json                     # a QA run
docket results junit reports/*.xml --commit 9b1e004
```

- **Test results** are JUnit XML, which nearly every test runner can write.
  A test case is matched to evidence when its file is an annotated place's
  file, and its name is in the annotated line's text, such as
  `it("rejects a stay that ends the day it starts", () => {`. The match is
  rough on purpose. A rule's evidence then shows whether what verifies it
  passed at that commit.
- **QA results** name what they're about directly, so they need no matching:

  ```json
  {
    "name": "Busy-season QA, round 2",
    "url": "https://qa.example.com/runs/412",
    "results": [
      { "about": "capability:room-booking", "outcome": "passed" },
      { "about": "rule:minimum-stay@guest-stays", "outcome": "failed", "note": "Same-day stays accepted on mobile" }
    ]
  }
  ```

Results for a commit that's never applied are kept, and shown once it is.

## Serving

The UI is a web app built into the binary. It shows only what `docket` gives
it through its API, and works nothing out itself, so it looks and counts the
same whichever of these serves it.

### `docket ui`

Serves the UI over this project, as the [source flags](#where-a-read-comes-from)
choose, so anyone can see their branch the way the server will show it. It
re-indexes as files change, so the page follows the working tree.

```sh
docket ui                       # the working tree, at http://127.0.0.1:4100
docket ui --platform            # among the rest of the platform, from the server
docket ui --at v1.4             # a release
```

- **It's only reachable from this machine.** It listens on `127.0.0.1`,
  needs no sign-in, and can't be told to listen anywhere else, so it can never
  be deployed as the server by mistake.
- **It only reads.** It never writes to the repository or the server.
- **It replaces the UI's own dev server** for anyone looking at their docs.
  Working on the UI itself still uses Vite, against `docket ui`'s API.

### `docket serve`

Runs the Docket server: it takes applied states and results from `apply` and
`results`, answers `--remote` and `--platform` reads, and serves the UI to the
people allowed to see each project.

```sh
docket serve --config /etc/docket/server.yaml
```

- **It won't start without its storage and sign-in set up**, so a server is
  never running open by mistake.
- **It's what the image runs** unless told to run another command. The same
  image runs any other command too, such as `docker run <image> apply` in a
  CI that works in containers.
- **It never reads a repository.** Everything it holds was sent to it.

How it's configured, and what its API looks like, will be drafted once the
commands that talk to it settle.

## How clients use it

### Bringing Docket to a repository

```sh
docket init --id hotel-bookings --name "Hotel Bookings" --platform hotel
docket kit
# write the first docs, with an agent following the kit's adopting.md
docket check
git add docket.yaml docket/ .agents/ .claude/ AGENTS.md CLAUDE.md .gitignore
git commit -m "Adopt Docket"
```

### An agent making a change

The kit tells agents to do this. Each step is one command, and each reads the
working tree unless told otherwise, so the agent is always looking at its own
change.

```sh
docket touches src/booking/ --json     # before planning: what this is about, and its level
# ... change the code, docs and annotations ...
docket check --changed --json          # before finishing: anything broken
docket diff --json                     # what the change does to Docket, for its report
```

When `diff` guesses a transition, the agent puts the suggested trailer in the
commit message if it's right, and asks if it isn't sure.

### An engineer's pre-commit hook

```sh
#!/bin/sh
exec docket check --changed --base HEAD
```

### CI, on any host

The same calls in any CI. Only posting the comment is particular to the host,
and the CI does that with whatever tool it already has.

```sh
# On every pull request or merge request
docket check --platform --commits "$BASE_SHA..HEAD"
docket preview --format markdown > docket-preview.md
# post docket-preview.md as a comment: gh, glab, the Bitbucket API, ...

# On every push to the main branch
docket apply
docket results junit reports/*.xml
```

### Connecting an existing project to a server

Its history is already in git, so its first apply can start at its first
commit with Docket, and the server's timeline goes back that far from day
one.

```sh
export DOCKET_TOKEN=...        # the project's token, from the server
docket apply --from "$(git log --format=%H --diff-filter=A -- docket.yaml | tail -1)"
```

### Asking about the past

```sh
docket log capability:room-booking --remote     # when did it reach Beta, and what was left then?
docket diff v1.3 v1.4                           # what did this release change, in Docket's words?
docket log gaps --initiative mvp --since 2026-09-01 --remote --platform   # what did the MVP close this quarter?
```

### Checking readiness before a release

```sh
docket status --remote --platform --initiative mvp
docket list gaps --remote --platform --initiative mvp --sort risk
```

### Asking without the repository

A product manager, or an agent working somewhere else, asks the server
directly. Outside a repository, `--remote` is implied.

```sh
export DOCKET_SERVER=https://docket.example.com
docket login
docket status --platform hotel --for persona:front-desk-clerk
docket list decisions --platform hotel --initiative mvp
```

## Conventions

- **`--json` on every command**, with one documented shape per command.
  With it, stdout is only JSON, even on failure, and an error is an `error`
  field.
- **Every read says what it's showing**, in its first line and in its JSON's
  `source`, as [Where a read comes from](#where-a-read-comes-from) describes.
- **Exit codes**: `0` when everything's fine, `1` when it found what it was
  asked to fail on, such as a problem in `check` or an out-of-date kit in
  `kit --check`, and `2` when it couldn't run: bad usage, not in a project, or
  a server it couldn't reach or wasn't allowed into.
- **No prompts unless it's run in a terminal.** Anything it would ask, it
  takes as a flag, and without one it fails with exit 2 and says which flag.
- **`-C <dir>`** runs it in another directory, as git's does.
- **It acts on one project**: the one whose `docket.yaml` is nearest above
  the directory it's run in. In a repository with several projects, run it in
  each one's folder, or point `-C` at it.
- **References are written as everywhere else**: `<type>:<id>`, a rule or
  concept with `@<domain>`, a gap, tradeoff or decision with `#<key>`.
- **Configuration** is `docket.yaml` for the project, `DOCKET_TOKEN` and
  `DOCKET_SERVER` in the environment, and the user's config directory for a
  person's sign-in. Nothing secret is ever read from or written to the
  repository.

## Left out for now

- **A selected context.** No `docket use`, no current stack or server to
  switch between. Every command says where it reads from, so nothing run
  earlier changes what it shows.
- **Writing docs.** No `docket new capability`. Agents write docs directly
  from the kit's `docs.md`, and people copy one. We'll add it if writing them
  by hand turns out to be slow.
- **Changing an ID everywhere.** No `docket rename` yet, though the kit has
  agents do it by hand, and it's the likeliest next addition.
- **Branch history on the server.** Only the main branch's commits are
  applied. A branch is shown by `preview`, not stored.
- **Integrations with hosts or CI services.** No GitHub App, no GitLab
  integration, no posting comments. They'd each tie Docket to one host.
- **Changing anything on the server but observations.** There's no command to
  edit a persona or a gap on the server, and won't be: intention changes in
  the repository.
- **Watching for changes**, an editor plugin, or a language server.

## Open questions

- **Where the server keeps what it holds.** SQLite would let `docket serve`
  run with nothing else beside it. A deployment that needs more can bring
  Postgres when it does.
- **Decisions need keys.** A decision is a `topic` and a `question` today,
  with nothing that names it. To be named in a trailer or followed by `log`,
  each needs a key like a gap's, such as
  `capability:refunds#where-the-money-goes`. That's a spec change.
- **What else trailers should say.** `Docket-Became` covers what was removed
  and became something. A gap that was deleted because it was never real,
  rather than closed by work, looks the same as one that was closed. We'll
  add a trailer for that if the difference turns out to matter.
- **How well test cases can be matched to evidence.** JUnit names a test by
  its class or file and its name, while an annotation is on a file and line.
  We'll find out how rough the match is on real projects before making it
  smarter, or before asking for an annotation format that names the test.
- **Whether `apply` indexes every commit, or only the head of each push.**
  Indexing every commit gives the finest history, and should be cheap, since
  indexing only reads docs and searches for annotations. If it isn't on a
  large repository, the head of each push and every commit's trailers would do.
