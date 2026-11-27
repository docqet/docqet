---
docqet: capability
id: applying
domain: understanding
name: Applying states
description: >-
  CI sends each commit on the main branch to the team's server, and the server
  keeps its state and checks it again.
stability: prototype
solves:
  - problem:knowledge-stuck-in-the-repository
  - problem:teams-accounts-disagree
concepts: [concept:state@authoring, concept:finding@authoring]
rules:
  - rule:one-client-per-server@understanding
  - rule:intention-only-from-repository@understanding
  - rule:applying-twice-changes-nothing@understanding
  - rule:same-findings-everywhere@understanding
gaps:
  - id: no-sign-in
    name: No sign-in
    affects:
      - outcome:security/alpha/access
    impact: damaging
    likelihood: possible
    reach: all
    description: >-
      Anyone who can reach a server can send it states and read every project
      on it, so a server holding a client's real projects must only be
      reachable by that client's people, such as on a private network.
tradeoffs:
  - id: one-server-per-client
    name: A server for each client
    description: >-
      Each client gets a Docqet server of its own, rather than one server
      holding every client's projects.
    benefit: >-
      One client's projects can't be shown to another, with no permissions to
      get right.
    drawback: >-
      A server to run for every client.
decisions:
  - topic: Signing in
    question: >-
      How do people sign in to a server, and what may each of them see once
      they have?
    affects:
      - capability:applying#no-sign-in
  - topic: Which commits
    question: >-
      Does `docqet apply` index every commit, or only the head of each push?
      Every commit gives the finest history and should be cheap, since
      indexing only reads docs and searches for annotations. If it isn't on a
      large repository, the head of each push and every commit's trailers
      would do.
---

Today it's `docqet apply`.
