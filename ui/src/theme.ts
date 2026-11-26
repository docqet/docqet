/* Types `theme.vars.*`, which the design components read. */
import "@mui/material/themeCssVarsAugmentation";
import { createTheme, type Shadows } from "@mui/material/styles";

/*
 * Docket's MUI theme: violet and fuchsia, Geist, cards with tight 8px
 * corners, and the same surface colors as styles.css. `shape` is 3px, so the
 * popover's card, which DetailsPopover rounds to 2.5 units, comes to about
 * 7px. Light or dark follows the system's setting.
 */
const base = createTheme();
const shadows = [...base.shadows] as Shadows;
/* Cards. */
shadows[1] = "0 1px 2px rgb(30 16 70 / 0.05), 0 8px 24px -8px rgb(60 30 140 / 0.14)";
/* Popovers (DetailsCard). */
shadows[8] = "0 2px 6px rgb(20 10 50 / 0.08), 0 18px 40px -12px rgb(40 20 100 / 0.32)";

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "media" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#7c3aed" },
        secondary: { main: "#c026d3" },
        background: { default: "#f6f5fb", paper: "#ffffff" },
        divider: "#e6e2f2",
        text: { primary: "#16121f", secondary: "#615a74", disabled: "#9a93ad" },
        action: { hover: "rgb(124 58 237 / 0.06)" },
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
      },
    },
  },
  shape: { borderRadius: 3 },
  shadows,
  typography: {
    fontFamily: '"Geist Variable", ui-sans-serif, system-ui, sans-serif',
    subtitle1: { fontSize: 15.5, fontWeight: 650, letterSpacing: "-0.015em" },
    subtitle2: { fontWeight: 650 },
    body2: { fontSize: 13 },
    button: { textTransform: "none", fontWeight: 600 },
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
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
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

export default theme;
