import { useState, type ReactNode } from "react";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { barIconSx } from "./barIcon";
import { ConceptIcon } from "../Concepts";
import { ColorSchemeToggle } from "./ColorSchemeToggle";
import Logo from "./Logo";
import { PersonaIcon } from "../Personas";
import { ProblemIcon } from "../names";
import ProductFilter, { type ProductChoice } from "./ProductFilter";
import ScopeFilter, { InitiativeIcon } from "./ScopeFilter";
import type { Scope } from "../../scope";
import { followLink, navigate, sectionHref, sectionOf, docHref, type Route, type Section } from "../../routes";
import Search, { type Selection } from "./Search";
import { failingFindings, pageHref, type DocqetState, type Product } from "../../state";

/*
 * Every view's frame: a bar across the top that says where the reader is and
 * lets them find anything (the product and its projects, search, the
 * glossary), a nav down the side for which question they're asking, and the
 * view itself filling the rest. The view scrolls on its own, so the bar and
 * nav stay put. Below md the nav folds into a drawer, opened from a button at
 * the start of the bar, and on a phone the bar wraps, putting the product and
 * initiative on a line of their own. Clicks on in-app links anywhere inside
 * move without reloading.
 */
export default function Shell({
  state,
  product,
  products,
  scope,
  route,
  onProduct,
  onProjects,
  children,
}: {
  state: DocqetState;
  product: Product;
  products: ProductChoice[];
  scope: Scope;
  route: Route;
  onProduct: (id: string) => void;
  onProjects: (ids: string[]) => void;
  children: ReactNode;
}) {
  const wide = useMediaQuery(useTheme().breakpoints.up("md"), { noSsr: true });
  const [drawer, setDrawer] = useState(false);
  const select = (s: Selection) => {
    if ("pick" in s) navigate(pageHref(s.pick));
    else if ("rule" in s) navigate(docHref("rule", s.rule));
    else onProjects([s.project]);
  };
  const nav = <SideNav state={state} at={sectionOf(route)} onGo={() => setDrawer(false)} />;
  return (
    <Box
      onClick={followLink}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "220px minmax(0, 1fr)" },
        gridTemplateRows: "auto minmax(0, 1fr)",
        gridTemplateAreas: { xs: '"top" "main"', md: '"top top" "side main"' },
        height: "100%",
      }}
    >
      <Box
        component="header"
        sx={{
          gridArea: "top",
          display: "flex",
          flexWrap: { xs: "wrap", sm: "nowrap" },
          alignItems: "center",
          columnGap: 1.5,
          rowGap: 0.5,
          minHeight: 56,
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1, sm: 0 },
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          zIndex: 10,
        }}
      >
        {wide ? null : (
          <IconButton aria-label="Sections" aria-expanded={drawer} onClick={() => setDrawer(true)} sx={[barIconSx, { ml: -0.5 }]}>
            <MenuRoundedIcon sx={{ fontSize: 22 }} />
          </IconButton>
        )}
        <Box component="a" href={sectionHref("overview")} aria-label="Overview" sx={{ display: "inline-flex", color: "inherit", textDecoration: "none" }}>
          <Logo wordmark={{ xs: "inline", sm: "none", md: "inline" }} />
        </Box>
        <Box component="span" aria-hidden sx={{ display: { xs: "none", sm: "block" }, width: "1px", height: 22, bgcolor: "divider" }} />
        <Box sx={{ order: { xs: 1, sm: 0 }, flexBasis: { xs: "100%", sm: "auto" }, display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
          <ProductFilter showing={state.projects} product={product} products={products} onProduct={onProduct} onProjects={onProjects} />
          <ScopeFilter scope={scope} initiatives={state.initiatives} />
        </Box>
        <Box sx={{ flex: 1, display: "flex", justifyContent: { xs: "flex-end", sm: "center" }, minWidth: 0 }}>
          <Search state={state} all={product.projects} onSelect={select} />
        </Box>
        <Tooltip title="What Docqet's words mean">
          <Box
            component="a"
            href={sectionHref("glossary")}
            aria-label="Glossary"
            aria-current={route.kind === "section" && route.section === "glossary" ? "page" : undefined}
            sx={barIconSx}
          >
            <HelpOutlineRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
        </Tooltip>
        <ColorSchemeToggle />
      </Box>
      {wide ? (
        <Box sx={{ gridArea: "side", minHeight: 0, overflowY: "auto", bgcolor: "background.paper", borderRight: 1, borderColor: "divider" }}>{nav}</Box>
      ) : (
        <Drawer
          open={drawer}
          onClose={() => setDrawer(false)}
          slotProps={{ paper: { sx: { width: 260, bgcolor: "background.paper", backgroundImage: "none" } } }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minHeight: 56, px: 2, borderBottom: 1, borderColor: "divider" }}>
            <Logo />
          </Box>
          {nav}
        </Drawer>
      )}
      <Box
        component="main"
        sx={{
          gridArea: "main",
          position: "relative",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

type NavItem = { section: Section; label: string; icon: ReactNode; question: string; count?: number };

/* Which question the reader is asking: a link per section, grouped, each with how many it holds. `onGo` runs when one is chosen, to close the drawer. */
function SideNav({ state, at, onGo }: { state: DocqetState; at: Section; onGo: () => void }) {
  const groups: { label?: string; items: NavItem[] }[] = [
    {
      items: [
        { section: "overview", label: "Overview", icon: <InsightsOutlinedIcon />, question: "How is it doing?" },
        { section: "map", label: "Map", icon: <HubOutlinedIcon />, question: "How does it all fit together?" },
      ],
    },
    {
      label: "Product",
      items: [
        {
          section: "features",
          label: "Features",
          icon: <WidgetsOutlinedIcon />,
          question: "What can it do? Domains, features and capabilities",
          count: state.features.length,
        },
        {
          section: "personas",
          label: "Personas",
          icon: <PersonaIcon size={20} />,
          question: "Who it serves, and how ready it is for them",
          count: state.personas.length,
        },
        {
          section: "problems",
          label: "Problems",
          icon: <ProblemIcon size={20} />,
          question: "Why it exists: the problems it solves, and how ready what solves each is",
          count: state.problems.length,
        },
        ...(state.initiatives.length
          ? [
              {
                section: "initiatives" as const,
                label: "Initiatives",
                icon: <InitiativeIcon size={20} />,
                question: "Bodies of work, such as the MVP, and how ready each is",
                count: state.initiatives.length,
              },
            ]
          : []),
        {
          section: "language",
          label: "Language",
          icon: <ConceptIcon size={20} />,
          question: "What the words mean, and the rules that must hold",
          count: state.concepts.length + state.rules.length,
        },
      ],
    },
    {
      label: "Engineering",
      items: [
        {
          section: "built",
          label: "How it's built",
          icon: <BuildOutlinedIcon />,
          question: "Mechanisms and components",
          count: state.mechanisms.length + state.components.length,
        },
      ],
    },
    {
      label: "State",
      items: [
        {
          section: "improvements",
          label: "Improvements",
          icon: <TrendingUpRoundedIcon />,
          question: "What would make it more ready, with every gap and open decision",
          count: state.status.readiness.areas.length,
        },
        { section: "decided", label: "Decided", icon: <TaskAltRoundedIcon />, question: "Tradeoffs and non-goals", count: state.tradeoffs.length },
        {
          section: "findings",
          label: "Findings",
          icon: <WarningAmberRoundedIcon />,
          question: "Contradictions and mistakes in the docs, and advice",
          count: failingFindings(state).length,
        },
      ],
    },
  ];
  return (
    <Box component="nav" aria-label="Sections" sx={{ display: "flex", flexDirection: "column", gap: 1.75, px: 1.25, py: 1.75 }}>
      {groups.map((g, i) => (
        <Box key={i} sx={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          {g.label ? <Box sx={{ px: 1.25, pb: 0.5, typography: "overline", color: "text.disabled" }}>{g.label}</Box> : null}
          {g.items.map((item) => (
            <Tooltip key={item.section} title={item.question} placement="right">
              <Box
                component="a"
                href={sectionHref(item.section)}
                onClick={onGo}
                aria-current={at === item.section ? "page" : undefined}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  px: 1.25,
                  py: "7px",
                  fontSize: 13.5,
                  fontWeight: 550,
                  color: "text.secondary",
                  textDecoration: "none",
                  borderRadius: "7px",
                  "&:hover": { color: "text.primary", bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 4%, transparent)` },
                  "&[aria-current=page]": { color: "primary.main", bgcolor: "surface.accentSoft" },
                }}
              >
                <Box
                  component="span"
                  aria-hidden
                  sx={{ display: "inline-flex", flex: "none", "& svg": { fontSize: 19, width: 19, height: 19, color: "inherit !important" } }}
                >
                  {item.icon}
                </Box>
                <Box component="span" sx={{ flex: 1, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  {item.label}
                </Box>
                {item.count ? (
                  <Box
                    component="span"
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                      color: at === item.section ? "primary.main" : "text.disabled",
                    }}
                  >
                    {item.count}
                  </Box>
                ) : null}
              </Box>
            </Tooltip>
          ))}
        </Box>
      ))}
    </Box>
  );
}
