/* Types `theme.vars.*`, which the components read. */
import "@mui/material/themeCssVarsAugmentation";
import { createTheme, type Shadows } from "@mui/material/styles";
import type { StabilityLevelId } from "./components/stability/stability";

/*
 * Docqet's colors beyond MUI's own roles. Each is defined for both schemes
 * below, and reaches components as `theme.vars.palette.<name>` and the
 * stylesheets as `--mui-palette-<name>-<key>`.
 */
type DocqetPalette = {
  /* The canvas and its panels: the dots behind the map, frosted panels, stronger borders, the accent's soft fill, and a card's shadow. */
  surface: { dot: string; panel: string; borderStrong: string; accentSoft: string; shadow: string };
  /* Domain concepts: a teal of their own, apart from features and capabilities. */
  concept: { main: string; soft: string };
  /* Personas: a blue of their own, apart from concepts, features and capabilities. */
  persona: { main: string; soft: string };
  /* Problems: a rose of their own, beside personas in the problem space. */
  problem: { main: string; soft: string };
  /* Constraints: a bronze of their own, apart from problems, for what comes from outside. */
  constraint: { main: string; soft: string };
  /* Readiness: from a quiet grey, unready, to green, ready. */
  ready: { low: string; high: string };
  /* Areas: a faint violet wash behind their features, darker than the canvas, lighter than a card. */
  area: { bg: string; border: string };
  /* What's lit on the canvas, hovered or open in the side panel. */
  lit: { ring: string; row: string };
  /* A blocking gap's impact (orange, between the warning's amber and the damaging red), and an inconvenient one's (a soft yellow). */
  impact: { blocking: string; inconvenient: string };
  /* Each stability level's color. */
  stability: Record<StabilityLevelId, string>;
  /*
   * The logo, the same in both schemes: its tile, from light to dark; the page,
   * a folded D; the page's fold; and its two rules, each a track (what's meant)
   * with a fill (what's met). `trackSmall` is a step darker, for 24px and below.
   */
  brand: { light: string; main: string; dark: string; mark: string; fold: string; track: string; trackSmall: string; fill: string };
};

declare module "@mui/material/styles" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Palette extends DocqetPalette {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface PaletteOptions extends Partial<DocqetPalette> {}
  /* Code, paths and identifiers: `sx={{ fontFamily: "fontFamilyMono" }}`. */
  interface TypographyVariants {
    fontFamilyMono: string;
  }
  interface TypographyVariantsOptions {
    fontFamilyMono?: string;
  }
}

const brand = {
  light: "#a78bfa",
  main: "#7c3aed",
  dark: "#5b21b6",
  mark: "#ffffff",
  fold: "#cab9fc",
  track: "#eae0fc",
  trackSmall: "#ddd0fb",
  fill: "#ae85f4",
};

/*
 * Docqet's MUI theme: violet and fuchsia, Geist, cards with tight 8px
 * corners. `shape` is 3px, so the popover's card, which DetailsPopover rounds
 * to 2.5 units, comes to about 7px. Light or dark follows the system's
 * setting until someone picks one.
 */
const base = createTheme();
const shadows = [...base.shadows] as Shadows;
/* Cards. */
shadows[1] = "0 1px 2px rgb(30 16 70 / 0.05), 0 8px 24px -8px rgb(60 30 140 / 0.14)";
/* Popovers (DetailsCard) and menus. */
shadows[8] = "0 2px 6px rgb(20 10 50 / 0.08), 0 18px 40px -12px rgb(40 20 100 / 0.32)";
/* Dialogs, such as open search. */
shadows[24] = "0 2px 6px rgb(20 10 50 / 0.08), 0 32px 72px -16px rgb(40 20 100 / 0.42)";

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#7c3aed" },
        secondary: { main: "#c026d3" },
        background: { default: "#f6f5fb", paper: "#ffffff" },
        divider: "#e6e2f2",
        text: { primary: "#16121f", secondary: "#615a74", disabled: "#9a93ad" },
        action: { hover: "rgb(124 58 237 / 0.06)" },
        /* Contradictions between scopes: an amber that reads as "look at this", not as an error. */
        warning: { main: "#b45309" },
        /* A rule's tests: passing, or failing. */
        success: { main: "#15803d" },
        error: { main: "#b91c1c" },
        surface: {
          dot: "#d9d3ec",
          panel: "rgb(255 255 255 / 0.78)",
          borderStrong: "#d6d0e8",
          accentSoft: "#f2ecff",
          shadow: "0 1px 2px rgb(30 16 70 / 0.05), 0 8px 24px -8px rgb(60 30 140 / 0.14)",
        },
        concept: { main: "#0f766e", soft: "rgb(15 118 110 / 0.09)" },
        persona: { main: "#1d4ed8", soft: "rgb(29 78 216 / 0.08)" },
        problem: { main: "#be123c", soft: "rgb(190 18 60 / 0.07)" },
        constraint: { main: "#8a5a2b", soft: "rgb(138 90 43 / 0.08)" },
        ready: { low: "#6f6982", high: "#047857" },
        area: { bg: "rgb(124 58 237 / 0.045)", border: "rgb(124 58 237 / 0.16)" },
        lit: {
          ring: "0 0 0 3px color-mix(in srgb, #7c3aed 18%, transparent), 0 8px 24px -14px rgb(60 30 140 / 0.35)",
          row: "color-mix(in srgb, #7c3aed 9%, transparent)",
        },
        impact: { blocking: "#c2410c", inconvenient: "#957a35" },
        stability: { prototype: "#6f6982", alpha: "#db2777", beta: "#2563eb", ga: "#047857" },
        brand,
      },
    },
    dark: {
      palette: {
        primary: { main: "#a78bfa" },
        secondary: { main: "#e879f9" },
        background: { default: "#0b0a10", paper: "#14111b" },
        divider: "#262130",
        text: { primary: "#f4f1fa", secondary: "#aaa2bd", disabled: "#6f6882" },
        action: { hover: "rgb(167 139 250 / 0.08)" },
        warning: { main: "#fbbf24" },
        success: { main: "#4ade80" },
        error: { main: "#f87171" },
        surface: {
          dot: "#26212f",
          panel: "rgb(22 19 30 / 0.74)",
          borderStrong: "#342d42",
          accentSoft: "rgb(167 139 250 / 0.12)",
          shadow: "0 1px 2px rgb(0 0 0 / 0.4), 0 12px 32px -12px rgb(0 0 0 / 0.7)",
        },
        concept: { main: "#2dd4bf", soft: "rgb(45 212 191 / 0.1)" },
        persona: { main: "#60a5fa", soft: "rgb(96 165 250 / 0.12)" },
        problem: { main: "#fb7185", soft: "rgb(251 113 133 / 0.12)" },
        constraint: { main: "#d6a46c", soft: "rgb(214 164 108 / 0.12)" },
        ready: { low: "#aaa4ba", high: "#34d399" },
        area: { bg: "rgb(167 139 250 / 0.055)", border: "rgb(167 139 250 / 0.2)" },
        lit: {
          ring: "0 0 0 3px color-mix(in srgb, #a78bfa 18%, transparent), 0 8px 24px -14px rgb(60 30 140 / 0.35)",
          row: "color-mix(in srgb, #a78bfa 9%, transparent)",
        },
        impact: { blocking: "#f97316", inconvenient: "#d6c88f" },
        stability: { prototype: "#aaa4ba", alpha: "#f472b6", beta: "#60a5fa", ga: "#34d399" },
        brand,
      },
    },
  },
  /*
   * Phones below sm, tablets and narrow windows from sm to md, where the
   * side nav folds into a drawer, and desktops from md. sm is 720 rather than
   * MUI's 600, so a phone held sideways still gets the stacked layout.
   */
  breakpoints: { values: { xs: 0, sm: 720, md: 900, lg: 1200, xl: 1536 } },
  shape: { borderRadius: 3 },
  shadows,
  typography: {
    fontFamily: '"Geist Variable", ui-sans-serif, system-ui, sans-serif',
    fontFamilyMono: '"Geist Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace',
    subtitle1: { fontSize: 15.5, fontWeight: 650, letterSpacing: "-0.015em" },
    subtitle2: { fontWeight: 650 },
    body2: { fontSize: 13 },
    button: { textTransform: "none", fontWeight: 600 },
    /* The small uppercase label over a group, a figure or a column: `sx={{ typography: "overline" }}`, usually in text.disabled. */
    overline: { fontSize: 11, fontWeight: 650, lineHeight: 1.45, letterSpacing: "0.08em", textTransform: "uppercase" },
  },
  components: {
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          boxShadow: theme.shadows[1],
          backgroundColor: theme.vars.palette.background.paper,
        }),
      },
    },
    /* Menus, such as the header's lists of projects and initiatives: a card like a popover's, with rounded rows lit in the accent's soft fill. */
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.vars.palette.background.paper,
          backgroundImage: "none",
          border: `1px solid ${theme.vars.palette.divider}`,
          borderRadius: 8,
          boxShadow: theme.shadows[8],
        }),
        list: { padding: 6 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          gap: 10,
          minHeight: 0,
          padding: "7px 10px",
          borderRadius: 5,
          font: "inherit",
          "&:hover, &.Mui-focusVisible, &.Mui-selected, &.Mui-selected:hover, &.Mui-selected.Mui-focusVisible": {
            backgroundColor: theme.vars.palette.surface.accentSoft,
          },
        }),
      },
    },
    /*
     * Tables: a row per thing, its name first, ruled off, with small
     * uppercase headings. A row lights faintly under the pointer, and links
     * in it read as its text until hovered. Wrap a table in a
     * TableContainer so a wide one scrolls sideways inside it, never the
     * page; numbers go in cells with align="right".
     */
    MuiTable: {
      styleOverrides: { root: { fontSize: 13.5 } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: "10px 12px",
          fontSize: "inherit",
          lineHeight: "inherit",
          letterSpacing: "normal",
          color: "inherit",
          borderBottom: `1px solid ${theme.vars.palette.divider}`,
          "& a": { color: "inherit", fontWeight: 600, textDecoration: "none", "&:hover": { color: theme.vars.palette.primary.main } },
        }),
        head: ({ theme }) => ({
          padding: "8px 12px",
          fontSize: 11,
          fontWeight: 650,
          lineHeight: "inherit",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: theme.vars.palette.text.disabled,
        }),
        alignRight: { fontVariantNumeric: "tabular-nums" },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          ".MuiTableBody-root > &:hover": { backgroundColor: `color-mix(in srgb, ${theme.vars.palette.text.primary} 2.5%, transparent)` },
        }),
      },
    },
    /*
     * A plain tooltip: a few words on hover or focus about what something is
     * or does, describing what it's on rather than naming it, so a button
     * keeps the name its words or aria-label give it. Text with line breaks
     * keeps them. (A card that opens on hover is a DetailsPopover.)
     */
    MuiTooltip: {
      defaultProps: { describeChild: true, disableInteractive: true, enterDelay: 300, enterNextDelay: 150 },
      styleOverrides: {
        tooltip: {
          whiteSpace: "pre-line",
          fontSize: 12,
          fontWeight: 500,
          borderRadius: 4,
          padding: "5px 9px",
          backgroundColor: "#1d1728",
        },
      },
    },
  },
});

/*
 * MUI writes `--mui-palette-stability-prototype` but leaves `prototype` out
 * of `theme.vars`, as it does any key named like `__proto__` or
 * `constructor`, so components reading `theme.vars.palette.stability[level]`
 * would get nothing for Prototype. Point it at the variable MUI did write,
 * here and each time the provider builds the vars again.
 */
const withPrototype = (vars: typeof theme.vars) => {
  vars.palette.stability.prototype = "var(--mui-palette-stability-prototype)";
  return vars;
};
withPrototype(theme.vars);
const generateThemeVars = theme.generateThemeVars;
theme.generateThemeVars = () => withPrototype(generateThemeVars());

export default theme;
