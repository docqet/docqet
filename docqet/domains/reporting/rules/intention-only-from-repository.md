---
docqet: rule
id: intention-only-from-repository
domain: reporting
name: Intention changes only in the repository
why: >-
  The repository is the source of truth: intention is reviewed in pull
  requests with the code, and the server's history can be rebuilt from it.
---

The server keeps what's observed of each project, its applied states and the
results sent for them, and is never edited directly. Nothing edits a persona
or a gap on the server, and nothing will.
