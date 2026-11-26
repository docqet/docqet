# The UI

_How the UI reads only the server's API. Part of [how `docket` is
built](README.md)._

**The UI reads only the server's API.** It never reads a state file, and works
out no figure: the server combines a product's projects and derives maturity,
readiness, risk and exposure, and the UI shows them. State files are the
CLI's, which writes and sends them, and the server's, which takes them.

- **It loads the product showing at once.** `ui/src/services/docket/` has a
  module for each resource under `/api/v1/products/{product}`, with `client.ts`
  paging through each list and adding `?project=` and `?initiative=` for
  what's showing. `ui/src/model.ts` reads them all and turns them into the
  docs the pages hold, with each doc's figures on it. Pages and components
  never call the API themselves.
- **What no doc's figures cover, it asks for.** Readiness for the capabilities
  in a feature that serve a persona, or in one domain's part of a feature, is
  `/status?for=`, with several references for the capabilities they share.
  The gaps a scope puts at stake are `/gaps?for=`. Search is `/search`.
- **Every read can be slow or fail.** `useRead` in `model.ts` cancels a read
  once what it's for changes, so an old answer never replaces a newer one, and
  says whether it's loading or failed, with a retry. A part waiting on one
  shows a skeleton after a moment, keeps what it showed while the next
  arrives, or says what couldn't load. Each page renders inside an error
  boundary, so one that crashes leaves the shell working.
- **Lookups and presentation stay in the UI.** Finding a doc by ID, the cards
  on the map, filtering, ordering and counting what the server sent by what
  it says, and showing only some of a figure's gaps, such as a persona's own,
  are how the UI shows things, not figures. So is coloring a server's number
  by its band or verdict, with the same cutoffs the glossary shows.
- **`serve` and `docket ui` serve the same API**, from what was applied or
  from `.docket/state.json`, so the UI can't tell which it's talking to.
- **The UI's dev server passes `/api` on** to a running server: `make run`'s,
  or `DOCKET_API`'s. `make examples` loads the examples into it. They're
  folders in this repository rather than repositories of their own, so each
  one's state is sent as it is, at this repository's HEAD.
- **It's styled from the MUI theme alone.** `ui/src/theme.ts` holds every
  color, for light and dark, along with the shadows, breakpoints and MUI
  components' defaults, such as menus and tables. Components style
  themselves with `sx` in the theme's terms, and there are no stylesheets.
  A class name is only a hook another component's `sx` or code reaches
  through, such as `grip`, which the map's canvas uses to tell a drag from
  a click, and each says so where it's set.
