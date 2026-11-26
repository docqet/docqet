import { useEffect, type ReactNode } from "react";
import { Term } from "../design/term/Term";
import { NoPopovers } from "../design/DetailsPopover";
import type { TermId } from "../design/term/terms";
import { withParam, type Route } from "../routes";

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
 * Where a label is one of Docket's words, such as Rules or Readiness, `term`
 * makes it a Term, opening what the word means on hover. It's hover only, so
 * a tap or click still does what the tab or tile does.
 */

/* A label, as a Term when it's one of Docket's words. */
const labelled = (label: ReactNode, term?: TermId) =>
  term ? (
    <Term id={term} hoverOnly>
      {label}
    </Term>
  ) : (
    label
  );

/* A view's scrolling area. `wide` lets a table use the whole width. Sets the tab's title. */
export function View({ title, wide = false, children }: { title: string; wide?: boolean; children: ReactNode }) {
  useEffect(() => {
    document.title = `${title} · Docket`;
  }, [title]);
  return (
    <div className="view">
      <div className={`view-wrap${wide ? " view-wide" : ""}`}>{children}</div>
    </div>
  );
}

/*
 * The top of a page. `kind` is the small label over the name, such as a
 * capability's icon and "Capability"; `trail` the breadcrumb above it, such
 * as its domain and feature, as links; `lede` its one sentence; `marks` what
 * sits beside the name, such as its stability level; `stats` a row of Stat
 * tiles under it; `actions` anything at the far right.
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
    <header className="view-head">
      {trail ? <div className="view-trail">{trail}</div> : null}
      <div className="view-head-row">
        <div className="view-head-text">
          {kind ? <div className="view-kind">{kind}</div> : null}
          <div className="view-title-row">
            <h1 className="view-title">{title}</h1>
            {marks ? <div className="view-marks">{marks}</div> : null}
          </div>
          {lede ? <p className="view-lede">{lede}</p> : null}
        </div>
        {actions ? <div className="view-actions">{actions}</div> : null}
      </div>
      {stats ? <div className="view-stats">{stats}</div> : null}
    </header>
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
      <span className="stat-tile-label">{labelled(label, term)}</span>
      <span className="stat-tile-value">{value}</span>
      {note ? <span className="stat-tile-note">{note}</span> : null}
    </>
  );
  return href ? (
    <a className={`stat-tile stat-tile-link${wide ? " stat-tile-wide" : ""}`} href={href} data-tone={tone}>
      {body}
    </a>
  ) : (
    <div className={`stat-tile${wide ? " stat-tile-wide" : ""}`} data-tone={tone}>
      {body}
    </div>
  );
}

/* A tab. `term` is kept for callers, but tabs open no popovers: they choose what's shown. */
export type TabDef = { id: string; label: ReactNode; term?: TermId; count?: number };

/* Which tab is showing: the one the address names, if it's one of these, or else the first. */
export function currentTab(route: Route, tabs: TabDef[]): string {
  return tabs.some((t) => t.id === route.tab) ? route.tab! : tabs[0].id;
}

/* A page's tabs, each a link that changes `&tab=` in the address, so a tab can be linked to and back returns. */
export function Tabs({ tabs, current }: { tabs: TabDef[]; current: string }) {
  return (
    <nav className="view-tabs" aria-label="Tabs">
      {tabs.map((t, i) => (
        <a key={t.id} className="view-tab" href={withParam("tab", i === 0 ? null : t.id)} aria-current={t.id === current ? "page" : undefined}>
          {/* Tabs choose what's shown, so nothing in them opens a popover. */}
          <NoPopovers>{t.label}</NoPopovers>
          {t.count !== undefined ? <span className="view-tab-count">{t.count}</span> : null}
        </a>
      ))}
    </nav>
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
    <section className="view-section" id={id}>
      <header className="view-section-head">
        <h2>{labelled(title, term)}</h2>
        {count !== undefined ? <span className="view-section-count">{count}</span> : null}
        {aside ? <span className="view-section-aside">{aside}</span> : null}
      </header>
      {note ? <p className="view-section-note">{note}</p> : null}
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="view-empty">{children}</p>;
}

/* What a view that isn't built yet shows. */
export function NotBuilt({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <View title={title}>
      <PageHeader title={title} lede={children ?? "Not built yet."} />
    </View>
  );
}
