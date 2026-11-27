import { useEffect, type ReactNode } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { Term } from "../term/Term";
import { NoPopovers } from "../popovers/DetailsPopover";
import type { TermId } from "../term/terms";
import { withParam, type Route } from "../../routes";

/*
 * The parts every view is built from, so each one reads the same way:
 *
 * - View: the scrolling area, its content in a column of readable width.
 * - PageHeader: what this is, in a breadcrumb, a kind, a name and a sentence,
 *   then how it's doing, as a strip of Stats.
 * - Tabs: which part of it to read, kept in the address as `&tab=<id>`.
 * - Section: a titled part of a page, with how many it holds.
 * - Empty: what shows when there's nothing to list.
 *
 * Summary first, details on demand: a page leads with its header, and a count
 * links to where those things are listed rather than listing them inline.
 *
 * Where a label is one of Docqet's words, such as Rules or Readiness, `term`
 * makes it a Term, opening what the word means on hover. It's hover only, so
 * a tap or click still does what the tab or tile does.
 */

/* A label, as a Term when it's one of Docqet's words. */
const labelled = (label: ReactNode, term?: TermId) =>
  term ? (
    <Term id={term} hoverOnly>
      {label}
    </Term>
  ) : (
    label
  );

/* A view's scrolling area. `wide` lets a table use the whole width. Sets the tab's title. `data-view` marks it for a doc page to scroll back to its top. */
export function View({ title, wide = false, children }: { title: string; wide?: boolean; children: ReactNode }) {
  useEffect(() => {
    document.title = `${title} · Docqet`;
  }, [title]);
  return (
    <Box data-view sx={{ height: "100%", overflowY: "auto" }}>
      <Box sx={{ maxWidth: wide ? "none" : 1120, mx: "auto", px: { xs: 2, sm: 4 }, pt: { xs: 2.5, sm: 3.5 }, pb: 8 }}>{children}</Box>
    </Box>
  );
}

/*
 * The top of a page. `kind` is the small label over the name, such as a
 * capability's icon and "Capability"; `trail` the breadcrumb above it, such
 * as its area and feature, as links; `lede` its one sentence; `marks` what
 * sits beside the name, such as its stability level; `stats` a row of Stat
 * tiles under it; `actions` anything at the far right. The name is the
 * page's one h1.
 */
export function PageHeader({
  kind,
  trail,
  title,
  lede,
  marks,
  stats,
  actions,
}: {
  kind?: ReactNode;
  trail?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  marks?: ReactNode;
  stats?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Box component="header" sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 3 }}>
      {trail ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "4px 8px",
            fontSize: 12.5,
            color: "text.secondary",
            "& a": { color: "inherit", textDecoration: "none", "&:hover": { color: "primary.main" } },
          }}
        >
          {trail}
        </Box>
      ) : null}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {kind ? (
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, mb: 0.5, fontSize: 12, fontWeight: 600, color: "text.secondary" }}>{kind}</Box>
          ) : null}
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 14px" }}>
            <Box component="h1" sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: "bold", lineHeight: 1.2, letterSpacing: "-0.025em", overflowWrap: "anywhere" }}>
              {title}
            </Box>
            {marks ? <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>{marks}</Box> : null}
          </Box>
          {lede ? (
            <Box component="p" sx={{ maxWidth: 760, mt: 1, fontSize: { xs: 15, sm: 16 }, lineHeight: 1.5, color: "text.secondary" }}>
              {lede}
            </Box>
          ) : null}
        </Box>
        {actions ? <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{actions}</Box> : null}
      </Box>
      {stats ? <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 1.5, mt: 1.25 }}>{stats}</Box> : null}
    </Box>
  );
}

/* A figure in a header's strip: what it is, the figure, and a line saying more. With `href`, the whole tile links there. */
export function Stat({
  label,
  term,
  value,
  note,
  href,
  tone,
  wide = false,
}: {
  label: ReactNode;
  term?: TermId;
  value: ReactNode;
  note?: ReactNode;
  href?: string;
  tone?: "warn" | "ok";
  /* Takes two columns, for a figure with more under it. */
  wide?: boolean;
}) {
  const body = (
    <>
      <Box component="span" sx={{ typography: "overline", color: "text.disabled" }}>
        {labelled(label, term)}
      </Box>
      <Box
        component="span"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          minHeight: 30,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: tone === "warn" ? "warning.main" : tone === "ok" ? "success.main" : undefined,
          /*
           * Maturity, exposure and readiness as the figure, all laid out
           * alike: the ring or pie with its percentage beside it, then the
           * band's name, in its color, at one calm size rather than the
           * tile's big number.
           */
          "& > :is(.explore-level, .stat-maturity, .exposure-named, .readiness)": {
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            fontSize: 15,
            fontWeight: 650,
            letterSpacing: 0,
            "& strong": { fontWeight: 650 },
          },
        }}
      >
        {value}
      </Box>
      {note ? (
        <Box component="span" sx={{ fontSize: 12.5, color: "text.secondary" }}>
          {note}
        </Box>
      ) : null}
    </>
  );
  const sx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
    minWidth: 0,
    gridColumn: wide ? { sm: "span 2" } : undefined,
    px: 2,
    py: 1.75,
    color: "inherit",
    textDecoration: "none",
    bgcolor: "background.paper",
    border: 1,
    borderColor: "divider",
    borderRadius: "10px",
  };
  return href ? (
    <Box component="a" href={href} sx={[sx, { "&:hover": { borderColor: "surface.borderStrong", boxShadow: 1 } }]}>
      {body}
    </Box>
  ) : (
    <Box sx={sx}>{body}</Box>
  );
}

/* How many a tab or section holds, in a small pill. */
export function Count({ n }: { n: number }) {
  return (
    <Box
      component="span"
      sx={{
        minWidth: 18,
        px: 0.75,
        py: "1px",
        fontSize: 11,
        fontWeight: 600,
        textAlign: "center",
        color: "text.secondary",
        bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 7%, transparent)`,
        borderRadius: 999,
      }}
    >
      {n}
    </Box>
  );
}

/* A tab. `term` is kept for callers, but tabs open no popovers: they choose what's shown. */
export type TabDef = { id: string; label: ReactNode; term?: TermId; count?: number };

/* Which tab is showing: the one the address names, if it's one of these, or else the first. */
export function currentTab(route: Route, tabs: TabDef[]): string {
  return tabs.some((t) => t.id === route.tab) ? route.tab! : tabs[0].id;
}

/*
 * A page's tabs, each a link that changes `&tab=` in the address, so a tab
 * can be linked to and back returns. They wrap onto a second line on a
 * narrow screen rather than scrolling, so no scrollbar ever shows.
 */
export function Tabs({ tabs, current }: { tabs: TabDef[]; current: string }) {
  return (
    <Box component="nav" aria-label="Tabs" sx={{ display: "flex", flexWrap: "wrap", gap: "2px", mb: 3, borderBottom: 1, borderColor: "divider" }}>
      {tabs.map((t, i) => (
        <Box
          component="a"
          key={t.id}
          href={withParam("tab", i === 0 ? null : t.id)}
          aria-current={t.id === current ? "page" : undefined}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            pt: "9px",
            pb: 1.25,
            px: 1.5,
            mb: "-1px",
            fontSize: 13.5,
            fontWeight: 600,
            color: "text.secondary",
            whiteSpace: "nowrap",
            textDecoration: "none",
            borderBottom: 2,
            borderColor: "transparent",
            "&:hover": { color: "text.primary" },
            "&[aria-current=page]": { color: "primary.main", borderColor: "primary.main" },
          }}
        >
          {/* Tabs choose what's shown, so nothing in them opens a popover. */}
          <NoPopovers>{t.label}</NoPopovers>
          {t.count !== undefined ? <Count n={t.count} /> : null}
        </Box>
      ))}
    </Box>
  );
}

/* A titled part of a page, with how many it holds, a note under the title, and anything at its right, such as a "See all" link. */
export function Section({
  title,
  term,
  count,
  note,
  aside,
  id,
  children,
}: {
  title: ReactNode;
  term?: TermId;
  count?: number;
  note?: ReactNode;
  aside?: ReactNode;
  id?: string;
  children: ReactNode;
}) {
  return (
    <Box component="section" id={id} sx={{ mb: 4 }}>
      <Box component="header" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Box
          component="h2"
          sx={{
            flex: "none",
            fontSize: 16,
            fontWeight: "bold",
            letterSpacing: "-0.01em",
            "& a": { color: "inherit", textDecoration: "none", "&:hover": { color: "primary.main" } },
          }}
        >
          {labelled(title, term)}
        </Box>
        {count !== undefined ? <Count n={count} /> : null}
        {aside ? (
          <Box
            component="span"
            sx={{
              ml: "auto",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 13,
              "& a": { color: "primary.main", textDecoration: "none" },
            }}
          >
            {aside}
          </Box>
        ) : null}
      </Box>
      {note ? (
        <Box component="p" sx={{ mt: -0.75, mb: 1.5, fontSize: 13, color: "text.secondary" }}>
          {note}
        </Box>
      ) : null}
      {children}
    </Box>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <Box component="p" sx={{ py: 3, color: "text.disabled" }}>
      {children}
    </Box>
  );
}

/* What a view that isn't built yet shows. */
export function NotBuilt({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <View title={title}>
      <PageHeader title={title} lede={children ?? "Not built yet."} />
    </View>
  );
}
