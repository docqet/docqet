---
docket: mechanism
id: stability-marks
name: Stability marks
description: >-
  How every app page shows its stability level, from one record of every
  feature in every app.
meets: [compatibility/prototype/marked]
tradeoffs:
  - id: levels-kept-in-the-ui
    name: Page levels declared in the UI, apart from the docs
    description: >-
      Each page's level is declared once in the UI, in
      `src/featureStability.ts`, for the rail and the pages to read, apart
      from the capability docs' levels in the API's repository.
    drawback: >-
      A level change is made in both repositories, and nothing checks that
      they agree. That shows when a feature's level is changed in one
      repository and not the other.
---

`FEATURES` in `src/featureStability.ts` names each app feature and its level,
grouped by app (`portal`, `console`, `admin`, `hub`), with the profile pages
every app has at the top. The rail (`access/navigation.ts`, drawn by
`SidebarNav`), the page header and section cards take an entry as `feature`
and show the design system's `StabilityMark` for it, so the sidebar and the
pages can't disagree, and moving a feature up is a one-line change.

- **A Prototype page is topped by `PrototypeNotice`** instead, the design
  system's `StabilityBanner`, which says plainly what isn't real on it,
  usually that it runs on the app's `data/mock.ts`. Its `PageHeader` then
  takes no `feature`, since the banner carries the level.
- **A GA feature shows no mark.** Nothing passes it a `feature`, and its
  entry stays as the record.
- **Each entry's comment is its description.** It says what the feature is,
  what's real and what isn't, and its known gaps, often only the technical
  ones where the capability doc lists the rest.
- **The levels mean what the file's header says.** Prototype runs on
  placeholder data, or changes only the page's own state. Alpha reads and
  writes the API. Beta has unit tests in CI for the logic the API doesn't
  check, reports unexpected failures (see
  [error reporting](error-reporting.md)), and has been through QA in a
  browser.

A level here is a page's, and Docket keeps levels only on capabilities. Most
pages have their capability's level. Where a page is still behind it, the
component doc says so: a client's block page in the portal, and the admin's
Scheduling, accepted agreements and engineer invitations.
