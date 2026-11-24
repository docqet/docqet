import { type ReactNode } from "react";
import { Markdown, type Go } from "./design/markdown/Markdown";
import { LeftItem, LeftList } from "./design/left/LeftMark";
import { conceptLinked, type Contribution, type Decision } from "./state";

/*
 * What a doc says, as the spec splits it: its frontmatter fields, which have a
 * set meaning and so a set place, here; and its body, free Markdown that's
 * shown apart from them, as more about it (see design/markdown).
 */

export type { Go } from "./design/markdown/Markdown";

/* A text value from frontmatter, as Markdown, with links resolved from the doc it's in. */
export function Text({ from, text, go }: { from: Contribution; text: string; go: Go }) {
  return <Markdown text={text} from={from} go={go} className="markdown-field" />;
}

/* Open decisions, each its question under its topic. A decision has no risk: a question doesn't happen to anyone. */
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

/*
 * The fields a contribution has, by its type, labelled, in the spec's order:
 * part of what it is, so they show with its name and description, never with its
 * body. Open decisions aren't among them: they're shown with what's left.
 */
export function facets(kind: string, f: Contribution, go: Go): Facet[] {
  const out: Facet[] = [];
  const text = (label: string, value: string | null | undefined, wide = false) => {
    if (value?.trim()) out.push({ label, node: <Text from={f} text={value} go={go} />, wide });
  };
  if (kind === "rule") {
    text("Why", f.why);
  } else if (kind === "concept") {
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
                  <Text from={f} text={c.summary} go={go} />
                </li>
              );
            })}
          </ul>
        ),
      });
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
