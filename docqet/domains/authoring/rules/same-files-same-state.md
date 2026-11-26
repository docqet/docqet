---
docqet: rule
id: same-files-same-state
domain: authoring
name: The same files always give the same state
why: >-
  So every reader gets the same answer from the same commit, and the server's
  history can always be rebuilt from the repository.
---

The commit and the time a state was indexed at are recorded beside it, not
worked out from anything else.
