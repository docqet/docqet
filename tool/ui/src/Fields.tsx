import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Markdown } from "./Concepts";
import { LeftItem, LeftList } from "./design/left/LeftMark";
import {
  conceptLinked,
  decidedBy,
  find,
  pageHref,
  subjectOf,
  type Became,
  type BecameKind,
  type Contribution,
  type Decision,
  type DocketState,
  type Pick,
  type Target,
} from "./state";

/*
 * What a doc says, as the spec splits it: its frontmatter fields, which have a
 * set meaning and so a set place, and its body, free Markdown that's shown as
 * written, whatever it holds and however long it is.
 */

/* Where links in Markdown go, as the Markdown component takes them. */
export type Go = {
  state: DocketState;
  onConcept: (id: string) => void;
  onShow?: (target: Target) => void;
  onPick?: (pick: Pick) => void;
};

const noShow = () => {};

/* A text value from frontmatter, as Markdown, with links resolved from the doc it's in. */
export function Text({ from, text, go }: { from: Contribution; text: string; go: Go }) {
  return <Markdown state={go.state} concept={from} text={text} className="markdown-field" onConcept={go.onConcept} onShow={go.onShow ?? noShow} onPick={go.onPick} />;
}

/* A list of sentences from frontmatter, each one Markdown. */
export function Sentences({ from, items, go }: { from: Contribution; items: string[]; go: Go }) {
  return (
    <ul className="field-list">
      {items.map((item, i) => (
        <li key={i}>
          <Text from={from} text={item} go={go} />
        </li>
      ))}
    </ul>
  );
}

/* Open decisions, each its question under its topic. */
export function DecisionList({ from, decisions, go }: { from: Contribution; decisions: Decision[]; go: Go }) {
  return (
    <LeftList>
      {decisions.map((d, i) => (
        <LeftItem key={i} kind="decision">
          {d.topic ? <span className="decision-topic">{d.topic}</span> : null}
          <Text from={from} text={d.question} go={go} />
        </LeftItem>
      ))}
    </LeftList>
  );
}

/* A labelled field: what it is, then what it says. `wide` takes a whole row where fields sit side by side. */
export type Facet = { label: string; node: ReactNode; wide?: boolean };

/* A persona's needs, which the side panel shows on their own. */
export function needsFacet(f: Contribution, go: Go): Facet[] {
  return f.needs?.length ? [{ label: "Needs", node: <Sentences from={f} items={f.needs} go={go} />, wide: true }] : [];
}

/*
 * The fields a contribution has, by its type, labelled, in the spec's order.
 * Open decisions aren't among them: they're shown with what's left.
 */
export function facets(kind: string, f: Contribution, go: Go): Facet[] {
  const out: Facet[] = [];
  const text = (label: string, value: string | null | undefined, wide = false) => {
    if (value?.trim()) out.push({ label, node: <Text from={f} text={value} go={go} />, wide });
  };
  if (kind === "persona") {
    out.push(...needsFacet(f, go));
  } else if (kind === "rule") {
    text("Why", f.why);
  } else if (kind === "concept") {
    if (f.lifecycle?.states.length)
      out.push({
        label: "Lifecycle",
        wide: true,
        node: (
          <div className="lifecycle">
            <ol className="lifecycle-states">
              {f.lifecycle.states.map((s, i) => (
                <li key={i}>
                  {i ? <ArrowForwardRoundedIcon sx={{ fontSize: 14, color: "text.disabled", flex: "none" }} /> : null}
                  <span className="lifecycle-state">{s}</span>
                </li>
              ))}
            </ol>
            {f.lifecycle.text ? <Text from={f} text={f.lifecycle.text} go={go} /> : null}
          </div>
        ),
      });
    if (f.confusedWith?.length)
      out.push({
        label: "Not to be confused with",
        wide: true,
        node: (
          <ul className="confused-list">
            {f.confusedWith.map((c, i) => {
              const to = c.concept ? conceptLinked(go.state, c.concept, f.domain) : undefined;
              return (
                <li key={i}>
                  {to ? (
                    <button type="button" className="link confused-name" onClick={() => go.onConcept(to.id)}>
                      {to.name}
                    </button>
                  ) : (
                    <strong className="confused-name">{c.term ?? c.concept}</strong>
                  )}
                  <Text from={f} text={c.text} go={go} />
                </li>
              );
            })}
          </ul>
        ),
      });
  } else if (kind === "system" || kind === "component") {
    text("Start reading at", f.start, true);
  }
  return out;
}

/* Fields as cards side by side, or, with `stacked`, one under another, as in the side panel. */
export function Facets({ items, stacked = false }: { items: Facet[]; stacked?: boolean }) {
  if (!items.length) return null;
  return (
    <div className={stacked ? "facets facets-stacked" : "facets"}>
      {items.map((item) => (
        <div key={item.label} className="facet" data-wide={item.wide || undefined}>
          <span className="page-label">{item.label}</span>
          {item.node}
        </div>
      ))}
    </div>
  );
}

/*
 * A doc's body, as written. It can hold anything Markdown can, so a long one
 * is shown up to `limit` pixels high, fading out, with a button to show it
 * all; a short one is shown whole, with no button.
 */
export function Body({ from, go, limit = 520 }: { from: Contribution; go: Go; limit?: number }) {
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
  if (!from.body.trim()) return null;
  const clamped = long && !open;
  return (
    <div className="doc-body">
      <div ref={ref} className="doc-body-text" data-clamped={clamped || undefined} style={clamped ? { maxHeight: limit } : undefined}>
        <Markdown state={go.state} concept={from} text={from.body} onConcept={go.onConcept} onShow={go.onShow ?? noShow} onPick={go.onPick} />
      </div>
      {long ? (
        <button type="button" className="doc-body-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Show less" : "Show all"}
        </button>
      ) : null}
    </div>
  );
}

/* Whether a contribution says anything beyond its name and summary, by its type. */
export const saysMore = (kind: string, f: Contribution, go: Go) => facets(kind, f, go).length > 0 || f.body.trim() !== "";

/* ——— Decisions that are closed, and what they became ——— */

const KIND_WORDS: Record<BecameKind, string> = {
  domain: "Domain",
  feature: "Feature",
  capability: "Capability",
  rule: "Rule",
  concept: "Concept",
  persona: "Persona",
  system: "System",
  component: "Component",
  gap: "Gap",
  tradeoff: "Tradeoff",
};

/*
 * Where something a decision became is shown, and what to call it: its own
 * page, or for a rule its domain's, which lists it, and for a gap or tradeoff
 * the page of what it's on.
 */
function placeOf(state: DocketState, b: Became): { href: string | null; name: string } {
  if (!b.id) return { href: null, name: b.ref };
  if (b.kind === "gap" || b.kind === "tradeoff") {
    const item = (b.kind === "gap" ? state.gaps : state.tradeoffs).find((i) => i.id === b.id);
    const on = subjectOf({ id: b.id });
    const kind = on.type as "capability" | "feature" | "system" | "component";
    return { href: pageHref({ kind, id: on.id }), name: item?.text ?? b.ref };
  }
  if (b.kind === "rule") {
    const rule = find(state.rules, b.id);
    return { href: rule ? pageHref({ kind: "domain", id: rule.domain }) : null, name: rule?.name ?? b.ref };
  }
  const lists: Record<string, { id: string; name: string }[]> = {
    domain: state.domains,
    feature: state.features,
    capability: state.capabilities,
    concept: state.concepts,
    persona: state.personas,
    system: state.systems,
    component: state.components,
  };
  const doc = find(lists[b.kind] ?? [], b.id);
  return { href: pageHref({ kind: b.kind, id: b.id }), name: doc?.name ?? b.ref };
}

/* What a decision became, each as a link with its kind; one nothing showing has is shown as named, with a warning. */
export function BecameLinks({ state, decision }: { state: DocketState; decision: Decision }) {
  const became = decision.resolved ?? decision.became.map((ref) => ({ ref, kind: "gap" as const, id: null }));
  if (!became.length) return null;
  return (
    <ul className="became-list">
      {became.map((b, i) => {
        const { href, name } = placeOf(state, b);
        return (
          <li key={i}>
            <span className="explore-tag">{b.id ? KIND_WORDS[b.kind] : "Not found"}</span>
            {href ? <a href={href}>{name}</a> : <code>{name}</code>}
          </li>
        );
      })}
    </ul>
  );
}

/* Closed decisions: each question under its topic, what was decided, and what it became. */
export function DecidedList({ from, decisions, go }: { from: Contribution; decisions: Decision[]; go: Go }) {
  return (
    <ul className="decision-list decided-list">
      {decisions.map((d, i) => (
        <li key={i}>
          {d.topic ? <span className="decision-topic">{d.topic}</span> : null}
          <div className="decided-question">
            <Text from={from} text={d.question} go={go} />
          </div>
          {d.answer ? <Text from={from} text={d.answer} go={go} /> : null}
          <BecameLinks state={go.state} decision={d} />
        </li>
      ))}
    </ul>
  );
}

/* A doc's closed decisions, from each of its sources. */
export function Decided({ doc, go }: { doc: { from: Contribution[] }; go: Go }) {
  return (
    <>
      {doc.from.map((f, i) => {
        const closed = (f.decisions ?? []).filter((d) => d.status === "closed");
        return closed.length ? <DecidedList key={i} from={f} decisions={closed} go={go} /> : null;
      })}
    </>
  );
}

/*
 * The decisions this came from: where each was made, its question, and what
 * was decided. `inline`, under a gap, tradeoff or rule, is a line apiece.
 */
export function CameFrom({ kind, id, go, inline = false }: { kind: BecameKind; id: string; go: Go; inline?: boolean }) {
  const from = decidedBy(go.state, kind, id);
  if (!from.length) return null;
  if (inline)
    return (
      <>
        {from.map(({ on, decision }, i) => (
          <span key={i} className="came-from-line">
            <span className="explore-tag">Decided</span>
            <span>
              {decision.topic ?? decision.question} on <a href={pageHref({ kind: on.kind, id: on.doc.id })}>{on.doc.name}</a>
            </span>
          </span>
        ))}
      </>
    );
  return (
    <ul className="decision-list">
      {from.map(({ on, from: f, decision }, i) => (
        <li key={i}>
          <span className="came-from-on">
            {KIND_WORDS[on.kind]} <a href={pageHref({ kind: on.kind, id: on.doc.id })}>{on.doc.name}</a>
          </span>
          {decision.topic ? <span className="decision-topic">{decision.topic}</span> : null}
          <div className="decided-question">
            <Text from={f} text={decision.question} go={go} />
          </div>
          {decision.answer ? <Text from={f} text={decision.answer} go={go} /> : null}
        </li>
      ))}
    </ul>
  );
}
