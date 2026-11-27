---
docqet: component
id: ui
name: UI
description: >-
  The web app `docqet` serves, built into the binary, that shows a product's
  projects, reading only the server's API.
is: archetype:web-app
serves:
  - capability:overview
  - capability:map
  - capability:readiness
  - capability:improvements
  - capability:personas
  - capability:initiative-scope
  - capability:product-view
  - capability:seeing-findings
  - capability:choices
  - capability:language
  - capability:how-its-built
  - capability:preview
gaps:
  - id: two-glossaries
    name: The product's words are in two places
    impact: negligible
    likelihood: certain
    reach: some
    description: >-
      The glossary in the top nav and the language section both list what
      words mean, so a newcomer finds two answers to one question.
  - id: initiatives-a-section
    name: Initiatives are a section, not a scope
    impact: inconvenient
    likelihood: certain
    reach: some
    description: >-
      An initiative is a page of its own and a header filter, rather than a
      scope every view takes the way improvements takes a problem or persona,
      so seeing one initiative across views means choosing it again.
  - id: findings-a-section
    name: Findings take a section of their own
    impact: negligible
    likelihood: certain
    reach: most
    description: >-
      What's wrong in the docs has a top-level section, though only someone
      keeping the docs acts on it. A notice that the docs need fixing, and a
      page under keeping them true, would leave the nav to the questions
      people come with.
---

How it's laid out is in [the UI's README](../../ui/README.md), and its move to
the API in [The UI](../../docs/architecture/ui.md).

Every view works the same way, so these hold across all its parts:

- **It reads only the server's API.** No view reads a repository or a state
  file, so what the browser shows is what the server has applied, or what
  `docqet preview` serves for the working tree.
- **The view is in the URL.** Which section, doc and tab is showing is in the
  query string, `?view=`, `?capability=` and the rest, so back and forward
  work, and any view can be linked to.
- **Each view answers a question.** A view's parts are the components within
  this one, each saying the question it answers.
