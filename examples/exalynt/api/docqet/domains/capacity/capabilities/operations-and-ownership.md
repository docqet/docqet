---
docqet: capability
id: operations-and-ownership
domain: capacity
name: Operations and ownership
description: >-
  Clients choose whether they or Exalynt operate the software Exalynt builds
  for them, and keep what they own.
stability: prototype
solves: [problem:dependent-on-the-builder]
initiatives: [initiative:operations-and-ownership]
decisions:
  - topic: Choosing who operates
    question: >-
      The client chooses how their software is operated and can decide any
      time before launch. Exalynt operates only software it built.
  - topic: Operations fee
    question: >-
      For software Exalynt operates, the operations fee starts only once
      it's in production use. Infrastructure is passed through at cost.
  - topic: Taking over
    question: >-
      A client can take over operations at any time. The handoff is
      one-way, and Exalynt doesn't take operations back.
  - topic: Ownership
    question: >-
      The client owns the custom software, its source code, and their
      data, and keeps them when they stop. Exalynt keeps its reusable
      libraries, tooling, and frameworks.
  - topic: Going live
    question: >-
      Who marks software as live in production, which starts the
      operations fee?
  - topic: Takeover handoff
    question: >-
      Who carries out a takeover, and how are source code, data, and
      deployment and configuration artifacts handed over?
  - topic: Infrastructure charges
    question: >-
      Who records infrastructure pass-through charges, and how often are
      they billed?
  - question: >-
      Operations needs fleshing out as a whole. Client capabilities and
      rules are written, but Exalynt's side isn't decided yet.
---

## Includes

- Clients see whether each piece of their software is live in production, and
  whether it's **Self Operated** or **Operated by Exalynt**.
- Clients take over operations of software Exalynt operates, and receive its
  source code, data, and deployment and configuration artifacts.
- Clients get their source code and data at any time, including when they stop
  working with Exalynt.
- Clients see where their code lives and who has access to it.
