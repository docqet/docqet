---
docqet: concept
id: trailer
name: Trailer
description: >-
  A line at the end of a commit message that says what something the commit
  removed became, so history can follow it.
---

How a project's docs changed is worked out by comparing its
[state](state.md) at one commit with its state at the next. A reference
names the same thing at every commit, so most of what changed shows on its
own: a capability promoted, a gap added or closed, a rule gaining evidence.

What comparing can't show is that something removed became something else: a
doc whose ID changed, a decision answered by a rule, or a gap accepted as a
tradeoff under a new key. When `capability:early-arrival` disappears and
`capability:early-check-in` appears, nothing in either state says they're
the same capability. When an open decision is deleted and a rule is added,
nothing says the rule answers it. The commit says so with a `Docqet-Became`
trailer in its message:

```text
Docqet-Became: capability:early-arrival -> capability:early-check-in
```

- **Docqet never guesses.** It doesn't match docs by their files, their
  content, their names, or git's own rename detection. Something removed
  became something else only when a commit says so, with a trailer. Without
  one, it was removed: deleted, closed, or answered with nothing to show for
  it.
- **History lives in git**, beside the change that made it, since the docs
  keep no link back to what they replaced.
- **It's git's own kind of trailer**, also called a footer, exactly as
  [git defines them](https://git-scm.com/docs/git-interpret-trailers), so git
  and every tool that reads trailers can read Docqet's too. Docqet adds one
  trailer, `Docqet-Became`, the way other tools add theirs: `Signed-off-by`
  for the Developer Certificate of Origin, `Co-authored-by` on GitHub,
  `Change-Id` in Gerrit, `Changelog` in GitLab.

## The format

A `Docqet-Became` trailer names one thing the commit removed, then `->`, then
one thing it became:

```text
Docqet-Became: <reference> -> <reference>
```

```text
Settle refunds to the original card

Refunds go back to the card the guest paid with, and splitting one across
cards is left for later.

Docqet-Became: capability:refunds#where-the-money-goes -> rule:refund-to-original-card
Docqet-Became: capability:refunds#where-the-money-goes -> capability:refunds#no-split-refunds
Signed-off-by: Ana Ruiz <ana@example.com>
```

- **It's a trailer as git defines it**: in the trailer block, the message's
  last paragraph, beside any others the commit has, such as `Signed-off-by`
  or `Co-authored-by`. Docqet finds the block and reads it as
  `git interpret-trailers --parse` does, and a `Docqet-Became` line anywhere
  else in the message isn't one.
- **One trailer for each pair.** Something removed that became several things
  has a trailer for each, with the key repeated, the way a commit with
  several authors has a `Co-authored-by` for each.
- **Each reference is written as everywhere else**, as
  [References](doc.md#references) describes, by type and ID alone, as in an
  [annotation](annotation.md).
- **The key is matched without regard to case**, as git matches every
  trailer's key. `Docqet-` names the tool it's for, as Chromium's `Cr-` does
  for its trailers, so it can't be mistaken for anyone else's.
- **Write each on one line.** Git allows a long value to carry on onto lines
  that start with a space, and Docqet reads those as git does, but
  references are short enough not to need it.

## Writing and reading them

Git writes and reads them with no help from Docqet:

```sh
git commit --trailer "Docqet-Became: capability:early-arrival -> capability:early-check-in"
git log --format="%h %(trailers:key=Docqet-Became,valueonly)"
```

`docqet rename` prints the `--trailer` argument for its rename, ready to pass
to `git commit`.

## When one is needed

| What happened | Trailer |
| --- | --- |
| A doc's ID changed | `Docqet-Became: capability:early-arrival -> capability:early-check-in` |
| A gap or tradeoff got a new key | `Docqet-Became: capability:room-booking#needs-mouse -> capability:room-booking#calendar-needs-a-mouse` |
| A decision was answered | `Docqet-Became: capability:refunds#where-the-money-goes -> rule:refund-to-original-card` |
| A gap was accepted as a tradeoff, under another key | `Docqet-Became: component:ledger#slow-balances -> component:ledger#balance-worked-out-on-read` |
| A capability was split in two | Two trailers: `Docqet-Became: capability:check-in -> capability:early-check-in` and `Docqet-Became: capability:check-in -> capability:late-check-in` |

What needs no trailer:

- **A gap accepted as a tradeoff under the same key**, on the same doc, such
  as `capability:room-booking#one-room-per-booking`. It's the same
  reference, so it's the same thing, now a tradeoff.
- **Anything removed that became nothing**: a gap closed, a capability
  dropped, a decision answered by deciding not to.
- **A change to anything other than an ID**, such as a name, a description,
  a level or a link.

## Rules

- **What's on the left must be gone after the commit.** It existed in the
  commit's first parent and doesn't exist in the commit. Something that's
  still there didn't become anything: a capability that keeps its ID while
  another is split from it is a new capability, with no trailer.
- **Everything on the right must exist after the commit.** It can be new in
  the commit or already there: a decision answered by a rule that already
  existed names that rule.
- **A doc's gaps, tradeoffs and decisions follow it.** When
  `capability:early-arrival` becomes `capability:early-check-in`, its gap
  `capability:early-arrival#no-room-ready-alert` becomes
  `capability:early-check-in#no-room-ready-alert` under the same trailer,
  with none of its own. One that gets a new key as well needs its own.
- **It's about the projects the commit is in.** A commit in a repository with
  several projects is in each of them, and each takes the trailers whose
  left-hand side it had in the commit's first parent. References to docs in
  other projects in the same repository are checked against the commit
  itself, and to docs in other repositories against what the server has
  applied, when there's one.
- **Changing an ID in one project changes references in others.** Each other
  project updates its references with no trailer, since it didn't remove
  anything: in a commit of its own, or in the same commit when it's in the
  same repository.

## Merges and squashes

The trailers a commit on the main branch brings in are its own, and those of
every commit a merge brings in with it. History attributes each to the
commit on the main branch that brought it in, since that's where the change
shows.

A squash merge makes one new commit, so only the trailers in its own trailer
block count. Hosts build a squash commit's message from the pull request's
description or its commits' messages, and let whoever merges edit it, so the
trailers belong in the description, or in the message as it's merged. One
left in the body of a squashed commit's message is lost, as `Signed-off-by`
and `Co-authored-by` are in the same place. GitLab's `Changelog` trailers
work the same way.

## Findings

Trailers are checked over a range of commits, such as a branch before it
merges, rather than in a project's state, since they're in commit messages
and not in files:

| Type | Raised when |
| --- | --- |
| `invalid-trailer` | A `Docqet-Became` trailer can't be read: no `->`, nothing on one side, more than one reference on a side, or something that isn't a reference |
| `misplaced-trailer` | A line starting `Docqet-Became:` is in the message but not in its trailer block, so git and Docqet don't read it, as happens when a squash merge leaves it in the body |
| `unknown-id` | What's on the left didn't exist before the commit, or what's on the right doesn't exist after it |
| `not-removed` | What's on the left still exists after the commit |
