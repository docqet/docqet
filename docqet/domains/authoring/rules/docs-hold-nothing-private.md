---
docqet: rule
id: docs-hold-nothing-private
domain: authoring
name: Docs never hold anything private
concepts: [concept:doc]
respects: [constraint:repositories-hold-nothing-private]
why: >-
  Docs are committed with the code, so whatever they say goes everywhere the
  repository does, for good.
---

No doc holds a secret, a real person's details, or real client data.
Personas are invented people, and examples use made-up data.
