---
id: api-docs
name: API docs
description: >-
  The reference at `GET /docs/api`: the OpenAPI spec bundled into one
  document, rendered by Scalar, with each endpoint's stability and each
  group's maturity drawn on top by our own script.
meets: [compatibility/prototype/marked]
gaps:
  - id: marks-depend-on-scalar-markup
    name: Stability marks depend on unpinned Scalar markup
    impact: inconvenient
    description: >-
      `stability-marks.js` finds what it upgrades through Scalar's markup, and
      the page loads `@scalar/api-reference` from jsdelivr without a version,
      so any Scalar release can change it. When it does, the marks, rings and
      overview stop appearing without an error, and nothing tests the rendered
      page.
    when: A Scalar release changes its markup.
  - id: no-release-notes
    name: No release notes for the API or apps
    outcome: compatibility/beta/changes-heard
    impact: inconvenient
    description: >-
      Nothing tells people what changed in a release, for the API or the apps,
      Beta features included. Changes show only in the reference and in git
      history.
---

- `NewDocsHandler` bundles the spec once at startup, inlining every `$ref`.
  An operation without a valid `x-stability` fails the bundle, so the API
  won't start rather than serve an unlabeled endpoint.
- The bundler gives each operation below GA an `x-badges` badge, ending its
  name with an invisible U+2060 so the script can find exactly those badges.
  It also writes every operation's level, each tag's levels, and the tags'
  navigation order into `window.EXALYNT_STABILITY` on the page. The script
  needs that because Scalar only draws a tag's operations once it's opened.
- `stability-marks.js` watches Scalar's DOM and, as it renders, swaps those
  badges for stability marks, adds a mark to each operation and a maturity
  ring to each tag in the navigation, and adds the overview under the
  introduction's `## Maturity` heading. Renaming that heading in `api.yaml`
  changes the id the script looks for, and the overview silently disappears.
- The levels, their colors and wording, and how maturity is weighted mirror
  the design package's `stability/stability.ts` and `maturity/maturity.ts`.
  They change there first, then here.
- Scalar's markdown styles start with `.scalar-app .markdown`, and are loaded
  after ours, so styles for anything we add inside the introduction start the
  same way, or Scalar's list and link styles win.
- The script relies on `li[data-sidebar-id]` links to `#tag/<slug>` in the
  navigation, the `group/button-label` class, and each introduction heading
  in its own child of `.introduction-description` with an id ending
  `/description/<slug>`. That was checked by hand against Scalar on
  2026-11-16. When Scalar changes them, the page falls back to Scalar's plain
  badges and the overview's explanation alone.
