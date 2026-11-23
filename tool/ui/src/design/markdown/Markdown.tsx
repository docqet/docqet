import { useLayoutEffect, useRef, useState } from "react";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
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
 * summary and frontmatter fields) shows first, and its body apart from it, as
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
  if (rule?.capabilities.length)
    return { target: capabilityTarget(state, rule.capabilities[0]), pick: { kind: "capability", id: rule.capabilities[0] } };
  return null;
}

/* ——— Showing it ——— */

/*
 * Any Markdown, whole. Links resolve from `from`: one to another doc opens it
 * in Docket, one with a scheme opens in a new tab, and one Docket can't place
 * shows as its text. Its headings sit under the heading of whatever shows it,
 * so they keep their order but start a few levels down.
 */
export function Markdown({ text, from, go, className }: { text: string | null | undefined; from: From; go: Go; className?: string }) {
  if (!has(text)) return null;
  const heading =
    (Tag: "h3" | "h4" | "h5" | "h6", level: string): Components["h1"] =>
    ({ children, className: own }) => <Tag className={own ? `${level} ${own}` : level}>{children}</Tag>;
  const components: Components = {
    h1: heading("h3", "md-h1"),
    h2: heading("h4", "md-h2"),
    h3: heading("h5", "md-h3"),
    h4: heading("h6", "md-h4"),
    h5: heading("h6", "md-h4"),
    h6: heading("h6", "md-h4"),
    img: ({ src, alt }) => <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" />,
    table: ({ children }) => (
      <div className="markdown-table">
        <table>{children}</table>
      </div>
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
        <button type="button" className="link" onClick={() => ("concept" in to ? go.onConcept(to.concept) : go.onPick ? go.onPick(to.pick) : go.onShow?.(to.target))}>
          {children}
        </button>
      );
    },
  };
  return (
    <div className={className ? `markdown ${className}` : "markdown"}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeHighlight, { detect: false }]]} components={components}>
        {text.trim()}
      </ReactMarkdown>
    </div>
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
  return (
    <div className="doc-body">
      <div ref={ref} className="doc-body-text" data-clamped={clamped || undefined} style={clamped ? { maxHeight: limit } : undefined}>
        <Markdown text={from.body} from={from} go={go} />
      </div>
      {long ? (
        <button type="button" className="doc-body-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Show less" : "Show all"}
        </button>
      ) : null}
    </div>
  );
}

/* What a doc's body is shown under, wherever it's shown. */
export const MORE_ABOUT = "More about it";

/* In a side panel: a doc's body, folded under MORE_ABOUT until opened. Nothing when it has none. */
export function MoreAboutFold({ from, go, limit = 360 }: { from: From; go: Go; limit?: number }) {
  if (!has(from.body)) return null;
  return (
    <details className="explore-fold explore-more">
      <summary>
        {MORE_ABOUT}
        <ExpandMoreRoundedIcon className="explore-fold-chevron" sx={{ fontSize: 18 }} />
      </summary>
      <Body from={from} go={go} limit={limit} />
    </details>
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

/* Its first `lines` lines, as text alone, for a row that's a button and so can't hold links. */
export function Excerpt({ text, lines = 2, className }: { text: string | null | undefined; lines?: number; className?: string }) {
  const words = plainText(text);
  if (!words) return null;
  return (
    <span className={className ? `markdown-excerpt ${className}` : "markdown-excerpt"} style={{ WebkitLineClamp: lines }}>
      {words}
    </span>
  );
}
