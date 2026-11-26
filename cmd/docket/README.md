# The `docket` command

_A draft of what we'll build. Every command here may change or be dropped.
Each is scaffolded in [`internal/commands`](../../internal/commands/) with the
flags drafted here, and the global `--json` and `-C`, but answers that it isn't
built yet and exits 2. So far only [`serve`](#docket-serve) and
[`ui`](#docket-ui) do anything, and `ui` shows a project's
`.docket/state.json` as written, without re-indexing._

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

**Contents:** [Principles](#principles) · [Commands at a glance](#commands-at-a-glance) · [Where a read comes from](#where-a-read-comes-from) · [Setting up](#setting-up) · [Reading](#reading) · [Renaming](#renaming) · [History](#history) · [Acting on the server](#acting-on-the-server) · [Serving](#serving) · [How clients use it](#how-clients-use-it) · [Conventions](#conventions) · [Left out for now](#left-out-for-now) · [Open questions](#open-questions)

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
  or the whole product's, is chosen with flags on that command, never by
  something selected earlier. See [Where a read comes from](#where-a-read-comes-from).
- **It doesn't care where the repository is hosted.** It talks only to git
  and to the Docket server over HTTP. It never calls GitHub's, GitLab's or
  anyone else's API. Posting a comment on a pull request is the CI's job, and
  the command gives it the text.
- **Everything local works without a server.** Indexing, checking, reading
  and history all work offline. A server adds the rest of the product and a
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
| [`docket checklist`](#docket-checklist) | What each stability level expects, or what a promotion needs | Read |
| [`docket rename`](#docket-rename) | Change an ID everywhere in the project, and say so in history | Changing |
| [`docket diff`](#docket-diff) | What changed in Docket between two points | Read |
| [`docket log`](#docket-log) | How one thing changed over time | Read |
| [`docket history`](#docket-history) | Index every commit on a branch, for history offline | Setting up |
| [`docket preview`](#docket-preview) | `diff --remote --product`, for CI | Read |
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

**Which projects:** this one, or the whole product.

| Flag | Reads |
| --- | --- |
| _(none)_ | This project alone |
| `--product` | This project, combined with every other project in its product, as the server last applied them |
| `--product=<id>` | The same, naming the product. Outside a repository it's how to say which; inside one it must be the product `docket.yaml` names |
| `--project=<id>` | Outside a repository, one project as the server has it |

`--product` means the whole product wherever it's used. Its ID is only ever
given after `=`, as git's `--color[=when]` is, since without one it's a switch:
`--product hotel` would read `hotel` as an argument, and says so.

So the same command answers different questions:

```sh
docket list gaps                        # this project, as it is on my machine
docket list gaps --at v1.4              # this project, at a release
docket list gaps --remote               # this project, as the server has it
docket list gaps --product             # my working tree, among the rest of the product
docket list gaps --remote --product    # the whole product as the server has it: what the UI shows
```

- **Inside a repository, the working tree is the default**, since it's what
  engineers and agents want nearly every time.
- **Outside one, the server is the only source**, so `--remote` is implied,
  and `--product=<id>` or `--project=<id>` says which. Someone with no clone
  can still ask: `docket list gaps --product=hotel`.
- **Nothing is selected and remembered.** No `docket use server`, no current
  context. What a command reads is in the command, so an agent checking its
  own change can never be shown the server's state by something run earlier,
  and a script means the same thing every time it's run.
- **The other projects in `--product` always come from the server**, since
  their repositories aren't here. They're fetched when needed and kept in
  `.docket/product/`, gitignored. When the server can't be reached, the
  copies kept there are used, and the output says how old they are.
- **With `--at` and `--product`**, the other projects are as the server had
  them at that commit's time.
- **Every read says what it's showing.** Its first line, such as
  `hotel-bookings · working tree (4f2c9e1 + uncommitted)` or
  `hotel product · server, applied 2026-11-20 15:04`, and a `source` field
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
for the project's ID and name, and the product it's part of, or takes them as
flags. It also adds `.docket/` to
`.gitignore`. It doesn't write any docs: the kit's `adopting.md` covers
bringing Docket to existing code.

```sh
docket init --id hotel-bookings --name "Hotel Bookings" --product hotel
```

### `docket kit`

Installs the [agent kit](../../kit/) into the project, or updates it: the
skill under `.agents/skills/docket/`, the link from `.claude/skills/docket`,
the block in `AGENTS.md`, and the import in `CLAUDE.md`. The kit is built into
the binary, so it's always the one written for this version's commands.

```sh
docket kit           # install or update; safe to re-run
docket kit --check   # exit 1 if the project's copy isn't this version's kit, for CI
```

- **It owns the skill's folder and the block, and nothing else.** It makes
  `.agents/skills/docket/` match the kit exactly, removing files the kit no
  longer has, and replaces only what's between the `docket-kit:start` and
  `docket-kit:end` markers in `AGENTS.md`. The rest of `AGENTS.md` and
  `CLAUDE.md` is the project's, and it only ever adds to them.
- **It reports each file** as `added`, `updated`, `removed` or `ok`.
- **It stops at what it can't safely change**, such as a
  `.claude/skills/docket` that isn't its link, or a start marker with no end,
  and exits 1 saying what to fix.

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
and exits 1 if there are any. Agents run it with `--changed` before they
finish, as the kit tells them to.

```sh
docket check                          # everything in the working tree
docket check --changed                # only problems in files changed since the main branch
docket check --changed --base v1.4    # changed since some other point
docket check --commits origin/main..HEAD   # also check the Docket trailers in these commits
docket check --product               # with the rest of the product
```

- **`--changed`** keeps hooks and agents focused on their own change in a
  repository that already has problems. The main branch is `origin/HEAD`
  unless `--base` says otherwise.
- **`--commits`** checks every [trailer](#trailers) in a range: that each
  names something that existed before, and something that exists after, and
  that none is left in a message's body where git won't read it.
- **`--product`** resolves a link to a rule another project defines, and
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
docket touches src/billing/ --product --json   # with capabilities other projects declare
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
docket list gaps --initiative mvp --sort risk --product
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
docket status --remote --product --initiative mvp
docket status --for persona:front-desk-clerk --json
```

Maturity, readiness and risk are worked out by readers, not the indexer, so
the command is a reader too. It's the same Go code the server uses, and the UI
shows only what that code works out, so `docket status` and the UI always
agree.

### `docket checklist`

The [stability checklist](../../spec/README.md#stability-checklist): what
each level expects of the work, quality by quality, with each outcome's
examples. It's part of the spec, so it's built into the binary and is the
same for every project. Agents read it here, and `check` uses it to validate
every outcome named in `affects` and `meets`.

```sh
docket checklist                                  # every quality, level and outcome
docket checklist --level beta                     # everything Beta expects, including what it carries up
docket checklist outcome:reliability/beta/data-kept   # one outcome, with its examples
docket checklist --for capability:room-booking --to ga   # what promoting it needs
```

With `--for` and `--to`, it's the first step of promoting a capability: each
outcome the target level expects that the current one doesn't, and, for each,
what already affects or meets it, from the capability and the mechanisms and
components it relies on:

```text
hotel-bookings · working tree (4f2c9e1)

capability:room-booking   Beta → GA in Guest stays

outcome:reliability/ga/recovery        gap       component:bookings#no-restore-drill (blocking, possible, all)
outcome:usability/ga/all-accessible    gap       capability:room-booking#calendar-needs-a-mouse (blocking, certain, few)
outcome:efficiency/ga/speed-targets    open      decision on capability:room-booking: "Does the calendar need to open in under a second?"
outcome:security/ga/traceable          met       mechanism:audit-log
outcome:compatibility/ga/stable-interface  —     nothing affects it, so promoting claims it's met
```

Only `--for` reads the project, so only then does it take the
[source flags](#where-a-read-comes-from). It never changes a level: that's a
person's call, made in the capability's doc.

## Renaming

### `docket rename`

Changes an ID, and every reference to it in the project, and prints the
[trailer](#trailers) that tells history it's the same thing. Changing an ID is
a breaking change, and history only follows one that a commit says it should,
so renaming is always done on purpose, with this command.

```sh
docket rename <old> <new>
```

```sh
docket rename capability:early-arrival capability:early-check-in
docket rename rule:same-day-turnover@guest-stays rule:same-day-turnover@property   # to another domain
docket rename capability:room-booking#needs-mouse capability:room-booking#calendar-needs-a-mouse
docket rename capability:early-arrival capability:early-check-in --dry-run          # what would change
docket rename capability:early-arrival capability:early-check-in --product         # also list other projects' references
```

```text
hotel-bookings · working tree (4f2c9e1)

docket/domains/guest-stays/capabilities/early-arrival.md
  → docket/domains/guest-stays/capabilities/early-check-in.md     id
docket/domains/guest-stays/features/front-desk.md                 capabilities
docket/components/bookings.md                                     capabilities
src/booking/arrival.ts:12                                         docket:implements
features/arrival.feature:3                                        docket:verifies

Its gaps and tradeoffs follow it: capability:early-check-in#no-room-ready-alert

Add this trailer when you commit:
  git commit --trailer "Docket-Became: capability:early-arrival -> capability:early-check-in"
```

- **It changes the doc itself**: its `id`, or its `domain` for a rule or
  concept moving to another domain, or a gap's or tradeoff's key. A doc's
  file is renamed with it when the file is named after the old ID, as the
  spec recommends, and left alone otherwise.
- **It changes every reference to it in the project**: links in every doc's
  frontmatter, every annotation, and the IDs of the doc's own gaps and
  tradeoffs, which follow it under the same trailer.
- **It doesn't change what people wrote in a doc's body**, since nothing reads
  it, and doesn't change other projects. With `--product`, it lists the
  references in other projects in the product, from the server, so they can
  be changed there, each in a commit of its own, with no trailer.
- **It refuses** when the new ID is already taken, since that would make two
  things one, or when the old one doesn't exist.
- **It doesn't commit.** It prints the trailer as a `git commit --trailer`
  argument, and with `--json` returns it as `trailer`, for whoever commits to
  add, with git's own `--trailer` or by hand.

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
gap removed                  component:ledger#slow-balances
tradeoff added               component:ledger#balance-worked-out-on-read
rule:minimum-stay@guest-stays  +1 verifies (src/booking/stay.test.ts:14)

Removed with no trailer yet. If any became something, say so in the commit message:
  component:ledger#slow-balances
```

Between commits, it shows what a removed thing became only where a commit's
`Docket-Became` [trailer](#trailers) says so, and never guesses:

```text
hotel-billing · v1.3 → v1.4

decision answered            capability:refunds#where-the-money-goes
  became                     rule:refund-to-original-card@billing
  became                     capability:refunds#no-split-refunds
capability renamed           capability:early-arrival → capability:early-check-in
```

Anything removed without one is shown as removed, and anything added as
added. For a change that isn't committed yet, there's no message to read, so
it lists what the change removes instead, for its author to say in a trailer
what any of it became. [`docket rename`](#docket-rename) prints the trailer
for a rename itself.

With `--product`, it also shows what only the rest of the product shows: a
contradiction with another project, a link to another project's doc resolving
or breaking, or readiness changing for a persona another project also serves.

### `docket log`

How one thing changed over time, newest first, each change with its commit
and date.

```sh
docket log capability:room-booking
docket log capability:room-booking --remote
docket log gaps --initiative mvp --since 2026-09-01 --remote --product
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

A commit says what something it removed became with a `Docket-Became`
trailer, one of git's own trailers, beside any others such as `Signed-off-by`.
The [spec's trailers](../../spec/trailers/) are the whole format.

```text
Settle refunds to the original card

Docket-Became: capability:refunds#where-the-money-goes -> rule:refund-to-original-card@billing
Docket-Became: capability:refunds#where-the-money-goes -> capability:refunds#no-split-refunds
```

Git writes and reads them itself, with `git commit --trailer` and
`%(trailers:key=Docket-Became)`, and the command reads them the way git does,
from each message's trailer block. How it uses them:

- **`diff` and `log` read them** to show what became what, and show nothing as
  having become anything without one.
- **`rename` prints the one for its rename**, as a `--trailer` argument.
- **`check --commits` validates them** over a range, and CI runs it on a
  branch before it merges.
- **`apply` sends them** with each commit's state, so the server's history has
  them, including those from commits a merge brought in.

### `docket preview`

The same as `docket diff --remote --product`: what merging the working tree's
branch would change on the server, across the product. It's a name of its
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
branch, each commit's test and QA results, and the product those projects
make up. These commands are how anything gets there. They aren't reads, so
they take no source flags.

### Signing in

Where the server is goes in `docket.yaml`, since it's not a secret:

```yaml
server: https://docket.example.com
```

Outside a repository, `DOCKET_SERVER` says where it is.

**The first server has no sign-in.** Each client gets a server of their own,
reachable only by that client's people, such as on a private network, so
neither credential below exists yet. They're drafted for when sign-in comes.
There are two kinds of credentials, and neither is ever written into the
repository:

- **A project token** lets CI apply state and send results for one project,
  and nothing else. It's made on the server and kept in the CI's secrets as
  `DOCKET_TOKEN`.
- **A person's sign-in** lets them read the projects they're allowed to see,
  from `docket login`. Every `--remote` and `--product` read uses it, and
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
docket ui --product            # among the rest of the product, from the server
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
`results`, answers `--remote` and `--product` reads, and serves the UI to the
people allowed to see each project.

```sh
docket serve --config /etc/docket/server.yaml
```

- **It keeps what it holds in SQLite**, in one file, so it runs with nothing
  else beside it. A deployment that needs more can bring Postgres when it
  does.
- **It serves one client.** Each client gets a server of their own, so one
  never holds another's projects. It has no sign-in yet, so it must only be
  reachable by that client's people, such as on a private network.
- **It's what the image runs** unless told to run another command. The same
  image runs any other command too, such as `docker run <image> apply` in a
  CI that works in containers.
- **It never reads a repository.** Everything it holds was sent to it.

What its API looks like, whole states for the CLI and REST resources for the
UI, is planned in [How `docket` is built](../../docs/architecture/api.md).
How it's configured will be drafted once the commands that talk to it settle.

## How clients use it

### Bringing Docket to a repository

```sh
docket init --id hotel-bookings --name "Hotel Bookings" --product hotel
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

When `diff` lists something the change removed, the agent says what it
became, if it became anything, with a trailer on the commit: a decision it
answered, or a gap it turned into a tradeoff. It asks when it isn't sure. When
it renamed something, it uses `docket rename`, and passes the `--trailer` that
prints to `git commit`.

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
docket check --product --commits "$BASE_SHA..HEAD"
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
docket log gaps --initiative mvp --since 2026-09-01 --remote --product   # what did the MVP close this quarter?
```

### Checking readiness before a release

```sh
docket status --remote --product --initiative mvp
docket list gaps --remote --product --initiative mvp --sort risk
```

### Asking without the repository

A product manager, or an agent working somewhere else, asks the server
directly. Outside a repository, `--remote` is implied.

```sh
export DOCKET_SERVER=https://docket.example.com
docket login
docket status --product=hotel --for persona:front-desk-clerk
docket list decisions --product=hotel --initiative mvp
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
- **Remembering trailers.** `rename` prints its trailer, and nothing keeps it
  for the commit, since nothing a command did earlier changes what another
  does. A `prepare-commit-msg` hook that adds it can come later, if renames
  committed without one turn out to be common.
- **Branch history on the server.** Only the main branch's commits are
  applied. A branch is shown by `preview`, not stored.
- **Integrations with hosts or CI services.** No GitHub App, no GitLab
  integration, no posting comments. They'd each tie Docket to one host.
- **Changing anything on the server but observations.** There's no command to
  edit a persona or a gap on the server, and won't be: intention changes in
  the repository.
- **Watching for changes**, an editor plugin, or a language server.
- **Signing in**, project tokens and `docket login`, for now. A server serves
  one client and is kept off the open internet instead (see
  [Signing in](#signing-in)).

## Open questions

- **Decisions need keys** before `rename`, a trailer or `log` can name one.
  It's a spec change, an open decision in the
  [spec's trailers](../../spec/trailers/#open-decisions).
- **A trailer left out can't be added later.** A rename committed without its
  trailer reads in history as one thing removed and another added, and the
  only way to fix it is to rewrite that commit. If that happens often, a later
  commit could be allowed to say what an earlier one's removal became.
- **How well test cases can be matched to evidence.** JUnit names a test by
  its class or file and its name, while an annotation is on a file and line.
  We'll find out how rough the match is on real projects before making it
  smarter, or before asking for an annotation format that names the test.
- **Whether `apply` indexes every commit, or only the head of each push.**
  Indexing every commit gives the finest history, and should be cheap, since
  indexing only reads docs and searches for annotations. If it isn't on a
  large repository, the head of each push and every commit's trailers would do.
