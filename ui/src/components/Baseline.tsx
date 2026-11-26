import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";

/*
 * What every page starts from: MUI's baseline in the scheme showing, then the
 * few things that have to be global. The page itself never scrolls; each
 * view scrolls inside the shell, so the top bar and side nav stay put. Text
 * is 14px, a little tighter than MUI's body, and headings, paragraphs and
 * lists start bare, each component spacing its own.
 */
export function Baseline() {
  return (
    <>
      <CssBaseline enableColorScheme />
      <GlobalStyles
        styles={(theme) => ({
          /* Every element, not just inheriting it: the inside of an open <details> doesn't inherit from it. */
          "*": { boxSizing: "border-box" },
          "html, body, #root": { height: "100%", margin: 0 },
          body: { fontSize: 14, lineHeight: 1.45, letterSpacing: "normal", overflow: "hidden" },
          code: { fontFamily: theme.typography.fontFamilyMono, fontSize: "0.92em" },
          "h1, h2, h3, p": { margin: 0 },
          ul: { listStyle: "none", margin: 0, padding: 0 },
        })}
      />
    </>
  );
}
