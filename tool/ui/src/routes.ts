import { useEffect, useState } from "react";
import type { PageAt } from "./state";

/*
 * Where the reader is, all of it in the address so any view can be linked to
 * and back and forward work: a section of the side nav, as `?view=features`,
 * or one doc's page, as `?capability=deposits`, either with `&tab=rules` for
 * one of its tabs. The platform and projects showing ride along as
 * `?platform=<id>&project=<id>,<id>`. With no view or doc named, it's the
 * overview.
 *
 * Every link in the app is a plain `<a href="?…">`. The shell catches clicks
 * on them and moves here without reloading, so a link opens in the same tab,
 * and a middle-click or Ctrl/⌘-click still opens a new one.
 */

/* The side nav's sections, in its order, and the glossary from the top nav. */
export const SECTIONS = ["overview", "map", "features", "personas", "language", "built", "left", "decided", "problems", "glossary"] as const;
export type Section = (typeof SECTIONS)[number];

/* What can have a page of its own. */
export type DocKind = Exclude<PageAt["kind"], "gaps"> | "rule" | "gap";
export const DOC_KINDS: DocKind[] = ["domain", "feature", "capability", "concept", "persona", "mechanism", "component", "rule", "gap"];

export type Route =
  | { kind: "section"; section: Section; tab: string | null }
  | { kind: "doc"; doc: DocKind; id: string; tab: string | null };

/* Which side-nav section a doc's page is under, so it stays lit there. */
const SECTION_OF_DOC: Record<DocKind, Section> = {
  domain: "features",
  feature: "features",
  capability: "features",
  persona: "personas",
  concept: "language",
  rule: "language",
  mechanism: "built",
  component: "built",
  gap: "left",
};

export const sectionOf = (route: Route): Section => (route.kind === "section" ? route.section : SECTION_OF_DOC[route.doc]);

export function routeOf(search: string): Route {
  const params = new URLSearchParams(search);
  const tab = params.get("tab");
  for (const doc of DOC_KINDS) {
    const id = params.get(doc);
    if (id) return { kind: "doc", doc, id, tab };
  }
  const view = params.get("view");
  /* Older addresses: the gaps page, and the map opening on something. */
  if (view === "gaps") return { kind: "section", section: "left", tab };
  if (!view && params.get("show")) return { kind: "section", section: "map", tab };
  const section = (SECTIONS as readonly string[]).includes(view ?? "") ? (view as Section) : "overview";
  return { kind: "section", section, tab };
}

/* The platform and projects showing now, to carry over to wherever a link goes. */
export function showingParams(search = window.location.search): URLSearchParams {
  const now = new URLSearchParams(search);
  const params = new URLSearchParams();
  for (const key of ["platform", "project"]) {
    const value = now.get(key);
    if (value) params.set(key, value);
  }
  return params;
}

const withParams = (params: URLSearchParams, hash?: string) =>
  `${params.size ? `?${params}` : window.location.pathname}${hash ? `#${hash}` : ""}`;

/* A section, such as `?view=left`, with any extra params it takes, such as a filter. The overview needs no view. */
export function sectionHref(section: Section, extra: Record<string, string | null | undefined> = {}): string {
  const params = showingParams();
  if (section !== "overview") params.set("view", section);
  for (const [key, value] of Object.entries(extra)) if (value) params.set(key, value);
  return withParams(params);
}

/* A doc's page, such as `?rule=no-double-booking@guest-stays`, at one of its tabs if named. */
export function docHref(doc: DocKind, id: string, tab?: string | null, hash?: string): string {
  const params = showingParams();
  params.set(doc, id);
  if (tab) params.set("tab", tab);
  return withParams(params, hash);
}

/* The same address with one param changed, or removed with null, such as a page's tab. */
export function withParam(key: string, value: string | null): string {
  const params = new URLSearchParams(window.location.search);
  if (value === null) params.delete(key);
  else params.set(key, value);
  return withParams(params);
}

const NAVIGATED = "docket:navigate";

/* Go somewhere in the app without reloading. `replace` swaps the current history entry, for changes back shouldn't step through. */
export function navigate(href: string, replace = false) {
  if (replace) window.history.replaceState(null, "", href);
  else window.history.pushState(null, "", href);
  window.dispatchEvent(new Event(NAVIGATED));
}

/* The address's query, kept current as the reader moves around. */
export function useSearch(): string {
  const [search, setSearch] = useState(window.location.search);
  useEffect(() => {
    const update = () => setSearch(window.location.search);
    window.addEventListener("popstate", update);
    window.addEventListener(NAVIGATED, update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener(NAVIGATED, update);
    };
  }, []);
  return search;
}

/*
 * A click on an in-app link, `<a href="?…">`, moves without reloading.
 * Anything else, such as a link to another site, one meant for a new tab or
 * a modified click, is left to the browser.
 */
export function followLink(e: React.MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as HTMLElement).closest?.("a");
  if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
  const href = a.getAttribute("href");
  if (!href || href.startsWith("#")) return;
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
  e.preventDefault();
  navigate(url.search + url.hash || window.location.pathname);
}
