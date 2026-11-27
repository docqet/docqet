---
docqet: concept
id: archetype
name: Archetype
description: >-
  A kind of thing components are, such as a CLI, a service, a web app or a
  job, as the project names its own kinds. Each component says which it is,
  so anyone can see what kinds of thing build each capability.
confused-with:
  - concept: "concept:component"
    summary: >-
      one part of the code. An archetype is the kind of part it is, shared by many.
  - concept: "concept:mechanism"
    summary: >-
      how something works across the whole project. An archetype says nothing about how; it names a kind.
  - term: "A type, kind or category"
    summary: >-
      words Docqet already uses for doc types, the rubric's kinds of software and finding kinds. An archetype is only ever a kind of component.
---

Exalynt's API project says its components are an
[HTTP API](../../examples/exalynt/api/docqet/archetypes/http-api.md), and
its UI project that its components are a
[web app](../../examples/exalynt/ui/docqet/archetypes/web-app.md). A
capability served by components of both is built by an HTTP API and a web
app; one served only by the web app has nothing behind it that other software,
or an agent, can call.

- **The project names its archetypes.** Docqet defines none, and expects
  nothing of any one: what a job or a library is, and what's expected of
  every one, is the project's to say, in its body.
- **A component says which it is** with `is`. A part within a bigger
  [component](component.md) is that component's archetype unless it names its
  own.
- **What each builds is worked out**: its components, and the capabilities
  they serve. Each capability shows the archetypes of the components that
  serve it.
- **It's technical**, as components and mechanisms are, in the code's words,
  with no level, gaps or tradeoffs of its own.
- **It's one across projects by ID**, so two projects that both have web apps
  can share one archetype.

## How it's written

An archetype is a doc whose `docqet` is `archetype`. Its frontmatter, in
order, is `docqet`, `id`, `name` and `description`. Its body, optional, says
what being one means here, such as what every one is expected to do.
[`http-api.md`](../../examples/exalynt/api/docqet/archetypes/http-api.md):

```markdown
---
docqet: archetype
id: http-api
name: HTTP API
description: >-
  A service the apps and partners' software call over HTTPS, answering in
  JSON, and holding the data behind every app.
---

What it serves can be relied on by software no person is watching, so a
change to what it answers is a change to a contract.
```
