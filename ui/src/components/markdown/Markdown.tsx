import { useLayoutEffect, useRef, useState } from "react";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ResponsiveStyleValue, SystemStyleObject } from "@mui/system";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { capabilityTarget, featureTarget, type DocketState, type Pick, type Target } from "../../state";

/*
 * Markdown, wherever the UI shows it: a doc's body (a capability's, feature's,
 * concept's, rule's, persona's, domain's, mechanism's or component's) and the
 * text values in its frontmatter.
 *
 * It's the author's own embellishment, so nothing about it is assumed. It
 * may be missing, a word, or pages; with headings or none; tables, code,
 * images, task lists, or anything else GitHub-flavored Markdown has. Nothing
 * here reads structure out of it, and nothing that uses it should either:
 * show it as written, or, where it can't be formatted, as plain text.
 *
 * A doc's body is never part of what the doc is. What it is (its name,
 * description and frontmatter fields) shows first, and its body apart from it, as
 * more about it, under MORE_ABOUT, the same way for every type: folded in a
 * side panel (MoreAboutFold), and a section of its own on a detail page.
 *
 * - Body: a doc's body, cut short when it's long.
 * - MoreAboutFold: a doc's body in a side panel, folded under MORE_ABOUT.
 * - Markdown: any Markdown, whole. What a frontmatter text value shows.
 * - InlineMarkdown: a sentence or two inside a line, such as a gap's text.
 * - Excerpt and plainText: as text alone, for a row that's a button or a
 *   tooltip, where links and blocks can't go.
 *
 * Each shows nothing when there's nothing written. Raw HTML in it isn't
 * shown, and links can't run script.
 */

/* Where links go: to a concept, to a capability or feature on the map, or, with `onPick`, as on a detail page, to its page. */
export type Go = {
  state: DocketState;
  onConcept: (id: string) => void;
  onShow?: (target: Target) => void;
  onPick?: (pick: Pick) => void;
};

/* The doc the Markdown is from, whose file its relative links are relative to. */
export type From = { file: string; project: string; body?: string };

const has = (text: string | null | undefined): text is string => !!text?.trim();

/* ——— Links ——— */

/* A path relative to a doc's file, as the repository has it: "room.md" from "a/b/booking.md" is "a/b/room.md". */
function resolve(from: string, href: string): string {
  const parts = from.split("/").slice(0, -1);
  for (const part of href.split("#")[0].split("/")) {
    if (part === "..") parts.pop();
    else if (part && part !== ".") parts.push(part);
  }
  return parts.join("/");
}

export type Link = { concept: string } | { target: Target; pick: Pick } | { href: string } | null;

/*
 * Where a link goes: another concept, a capability or rule on the canvas, a
 * web page, or nowhere this page can show. Links stay in the doc's own
 * project, whose repository its paths are relative to.
 */
export function follow(state: DocketState, from: From, href: string): Link {
  if (/^[a-z]+:/i.test(href)) return { href };
  const file = resolve(from.file, href);
  const at = (d: { file: string; project: string }) => d.file === file && d.project === from.project;
  const concept = state.concepts.find(at);
  if (concept) return { concept: concept.id };
  const capability = state.capabilities.find(at);
  if (capability) return { target: capabilityTarget(state, capability.id), pick: { kind: "capability", id: capability.id } };
  const feature = state.features.find(at);
  if (feature) return { target: featureTarget(state, feature.id), pick: { kind: "feature", id: feature.id } };
  const rule = state.rules.find(at);
  if (rule?.capabilities.length) return { target: capabilityTarget(state, rule.capabilities[0]), pick: { kind: "capability", id: rule.capabilities[0] } };
  return null;
}

/* ——— Showing it ——— */

/* A link-looking button, for links that act inside the page: in a concept's teal, underlined faintly until hovered. */
export const linkButtonSx: SystemStyleObject<Theme> = {
  p: 0,
  font: "inherit",
  color: "concept.main",
  bgcolor: "transparent",
  border: 0,
  cursor: "pointer",
  textDecoration: "underline",
  textDecorationColor: (t) => `color-mix(in srgb, ${t.vars.palette.concept.main} 40%, transparent)`,
  textUnderlineOffset: "2px",
  "&:hover": { textDecorationColor: "currentColor" },
};

/* Code inline in text: mono, on a faint wash, in a faint box. */
export const inlineCodeSx: SystemStyleObject<Theme> = {
  px: "5px",
  py: "1px",
  fontSize: "0.86em",
  bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 6%, transparent)`,
  border: 1,
  borderColor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 7%, transparent)`,
  borderRadius: "4px",
  overflowWrap: "anywhere",
};

const faintFill = (percent: number) => (t: Theme) => `color-mix(in srgb, ${t.vars.palette.text.primary} ${percent}%, transparent)`;

/*
 * Markdown as written, styled from its wrapper: headings (a few levels down,
 * so h3 is the author's h1), lists, code, tables, quotes, images, and code
 * highlighting in the theme's colors (rehype-highlight's `hljs-*` classes).
 * A long URL, path or identifier wraps rather than pushing the layout wider.
 */
const markdownSx: SystemStyleObject<Theme> = {
  mt: 1.25,
  minWidth: 0,
  fontSize: 13.5,
  lineHeight: 1.55,
  color: "text.primary",
  overflowWrap: "anywhere",
  "& :is(h3, h4, h5, h6)": { m: "18px 0 6px", fontWeight: 650, lineHeight: 1.35, color: "text.primary" },
  "& h3": { fontSize: "1.2em" },
  "& h4": { fontSize: "1.08em" },
  "& h5": { fontSize: "1em" },
  "& h6": { fontSize: "0.95em", color: "text.secondary" },
  "& :is(p, ul, ol, pre)": { m: "0 0 8px" },
  /* The first child (as :first-child, which emotion warns about), doubled to outweigh the headings' margin. */
  "&& > :not(* + *)": { mt: 0 },
  "& > :last-child": { mb: 0 },
  "& img": { display: "block", maxWidth: "100%", height: "auto", m: "4px 0 12px", borderRadius: "6px" },
  "& ul": { listStyle: "disc", pl: 2.5 },
  "& ol": { listStyle: "decimal", pl: 2.75 },
  "& li + li": { mt: "3px" },
  "& li::marker": { color: "text.disabled" },
  "& li > :is(ul, ol, p)": { m: "3px 0 0" },
  "& ul.contains-task-list": { listStyle: "none", pl: 0.5 },
  "& .task-list-item input": { m: "0 6px 0 0", verticalAlign: "-1px", accentColor: (t) => t.vars.palette.primary.main },
  "& strong": { fontWeight: 650 },
  "& :not(pre) > code": inlineCodeSx,
  "& pre": {
    m: "4px 0 12px",
    px: 1.75,
    py: 1.5,
    overflowX: "auto",
    fontSize: 12.5,
    lineHeight: 1.55,
    bgcolor: faintFill(4),
    border: 1,
    borderColor: "divider",
    borderRadius: "8px",
  },
  "& pre code": { fontSize: "inherit" },
  "& blockquote": { m: "0 0 8px", py: "2px", pr: 0, pl: 1.75, color: "text.secondary", borderLeft: 3, borderColor: "surface.borderStrong" },
  "& hr": { my: 2, mx: 0, border: 0, borderTop: 1, borderColor: "divider" },
  "& table": { width: "100%", borderCollapse: "collapse", fontSize: "0.93em" },
  "& :is(th, td)": { px: 1.5, py: "7px", textAlign: "left", verticalAlign: "top", borderBottom: 1, borderColor: "divider" },
  "& th": { fontWeight: 650, bgcolor: faintFill(3) },
  "& tr:last-child td": { borderBottom: 0 },
  "& a": { color: "concept.main" },
  "& button": linkButtonSx,
  "& :is(.hljs-comment, .hljs-quote)": { color: "text.disabled", fontStyle: "italic" },
  "& :is(.hljs-keyword, .hljs-selector-tag, .hljs-built_in, .hljs-type)": { color: "primary.main" },
  "& :is(.hljs-string, .hljs-regexp, .hljs-symbol)": { color: "concept.main" },
  "& :is(.hljs-number, .hljs-literal)": { color: "warning.main" },
  "& :is(.hljs-title, .hljs-attr, .hljs-property)": { color: "persona.main" },
  "& .hljs-meta": { color: "text.secondary" },
};

/*
 * Any Markdown, whole. Links resolve from `from`: one to another doc opens it
 * in Docket, one with a scheme opens in a new tab, and one Docket can't place
 * shows as its text. Its headings sit under the heading of whatever shows it,
 * so they keep their order but start a few levels down.
 */
export function Markdown({ text, from, go, sx }: { text: string | null | undefined; from: From; go: Go; sx?: SxProps<Theme> }) {
  if (!has(text)) return null;
  const heading =
    (Tag: "h3" | "h4" | "h5" | "h6"): Components["h1"] =>
    ({ children, className: own }) => <Tag className={own}>{children}</Tag>;
  const components: Components = {
    h1: heading("h3"),
    h2: heading("h4"),
    h3: heading("h5"),
    h4: heading("h6"),
    h5: heading("h6"),
    h6: heading("h6"),
    img: ({ src, alt }) => <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" />,
    /* A wide table scrolls inside its own box rather than the page. */
    table: ({ children }) => (
      <Box sx={{ m: "4px 0 12px", overflowX: "auto", border: 1, borderColor: "divider", borderRadius: "8px" }}>
        <table>{children}</table>
      </Box>
    ),
    a: ({ href, children }) => {
      const to = href ? follow(go.state, from, href) : null;
      if (!to) return <>{children}</>;
      if ("href" in to)
        return (
          <a href={to.href} target="_blank" rel="noreferrer">
            {children}
          </a>
        );
      return (
        <button type="button" onClick={() => ("concept" in to ? go.onConcept(to.concept) : go.onPick ? go.onPick(to.pick) : go.onShow?.(to.target))}>
          {children}
        </button>
      );
    },
  };
  return (
    /* markdown: a hook for a detail page's body panel, which sets it larger, at a readable width. */
    <Box className="markdown" sx={[markdownSx, ...(Array.isArray(sx) ? sx : [sx])]}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeHighlight, { detect: false }]]} components={components}>
        {text.trim()}
      </ReactMarkdown>
    </Box>
  );
}

/*
 * A doc's body, as written. A long one is shown up to `limit` pixels high,
 * fading out, with a button to show it all; a short one is shown whole, with
 * no button. Nothing shows when it has no body.
 */
export function Body({ from, go, limit = 520 }: { from: From; go: Go; limit?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [long, setLong] = useState(false);
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    /* A little over the limit isn't worth a button: show it all. */
    const measure = () => setLong(el.scrollHeight > limit + 120);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el.firstElementChild ?? el);
    return () => observer.disconnect();
  }, [limit, from.body]);
  if (!has(from.body)) return null;
  const clamped = long && !open;
  /* The fade: opaque down to 72px from the bottom, then clear. Any opaque color masks the same. */
  const fade = "linear-gradient(to bottom, currentColor calc(100% - 72px), transparent)";
  return (
    /* doc-body: a hook for a detail page, which sets the body in a panel of its own. */
    <Box className="doc-body" sx={{ minWidth: 0 }}>
      <Box
        ref={ref}
        sx={[{ minWidth: 0 }, clamped && { overflow: "hidden", WebkitMaskImage: fade, maskImage: fade }]}
        style={clamped ? { maxHeight: limit } : undefined}
      >
        <Markdown text={from.body} from={from} go={go} />
      </Box>
      {long ? (
        <Box
          component="button"
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          sx={{
            mt: 0.75,
            px: 0,
            py: 0.5,
            font: "inherit",
            fontSize: 13,
            fontWeight: 600,
            color: "primary.main",
            cursor: "pointer",
            bgcolor: "transparent",
            border: 0,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {open ? "Show less" : "Show all"}
        </Box>
      ) : null}
    </Box>
  );
}

/* What a doc's body is shown under, wherever it's shown. */
export const MORE_ABOUT = "More about it";

/* In a side panel: a doc's body, folded under MORE_ABOUT until opened, its heading in the accent with a chevron that turns as it opens. Nothing when it has none. */
export function MoreAboutFold({ from, go, limit = 360 }: { from: From; go: Go; limit?: number }) {
  if (!has(from.body)) return null;
  return (
    <Box component="details" sx={{ mt: 1.25, "&[open] > summary > svg": { transform: "rotate(180deg)" } }}>
      <Box
        component="summary"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          width: "fit-content",
          fontSize: 12.5,
          fontWeight: 600,
          color: "primary.main",
          listStyle: "none",
          cursor: "pointer",
          userSelect: "none",
          "&::-webkit-details-marker": { display: "none" },
          "&:hover": { textDecoration: "underline" },
          "&:focus-visible": { outline: 2, outlineColor: "primary.main", outlineOffset: 2, borderRadius: "4px" },
        }}
      >
        {MORE_ABOUT}
        <ExpandMoreRoundedIcon sx={{ fontSize: 18, transition: "transform 120ms ease" }} />
      </Box>
      <Body from={from} go={go} limit={limit} />
    </Box>
  );
}

/* A sentence or two, inline: code, bold and italics, with no paragraph around it. Links show as their text. */
export function InlineMarkdown({ text }: { text: string | null | undefined }) {
  if (!has(text)) return null;
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({ children }) => <>{children}</>, a: ({ children }) => <>{children}</> }}>
      {text.trim()}
    </ReactMarkdown>
  );
}

/* ——— As text alone ——— */

type MdNode = { type: string; value?: string; children?: MdNode[] };

const parser = unified().use(remarkParse).use(remarkGfm);
/* Where words from one block end and the next begin. */
const BREAKS = new Set(["paragraph", "heading", "tableCell", "break", "listItem", "blockquote"]);

/*
 * Its words, with no Markdown: for a tooltip or anywhere else only text can
 * go. Code blocks, images and raw HTML are left out.
 */
export function plainText(markdown: string | null | undefined): string {
  if (!has(markdown)) return "";
  const out: string[] = [];
  const walk = (node: MdNode) => {
    if (node.type === "code" || node.type === "html" || node.type === "image") return;
    if (node.type === "text" || node.type === "inlineCode") out.push(node.value ?? "");
    node.children?.forEach(walk);
    if (BREAKS.has(node.type)) out.push(" ");
  };
  walk(parser.parse(markdown) as MdNode);
  return out.join("").replace(/\s+/g, " ").trim();
}

/* Its first `lines` lines, as text alone, for a row that's a button and so can't hold links. `lines` can differ by breakpoint, `{ xs: 3, sm: 1 }`. */
export function Excerpt({ text, lines = 2, className }: { text: string | null | undefined; lines?: ResponsiveStyleValue<number>; className?: string }) {
  const words = plainText(text);
  if (!words) return null;
  return (
    <Box
      component="span"
      className={className}
      sx={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: lines, overflow: "hidden", overflowWrap: "anywhere" }}
    >
      {words}
    </Box>
  );
}
