import { type ReactNode } from "react";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import Box from "@mui/material/Box";
import { DetailsCard, DetailsEyebrow, DetailsPopover } from "./design/DetailsPopover";
import { follow } from "./design/markdown/Markdown";
import { conceptLinked, fieldsText, find, pageHref, type Concept, type DocketState, type Pick } from "./state";
import { Tip } from "./design/Tip";

/*
 * A way from a side panel to a doc's detail page, in a tab of its own, so the
 * map stays where it was in this one.
 */
export function PageLink({ pick, children = "Details" }: { pick: Pick; children?: ReactNode }) {
  return (
    <Tip title="Open everything about it in a new tab">
      <a className="filter-toggle page-link" href={pageHref(pick)} target="_blank" rel="noopener">
        <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
        {children}
      </a>
    </Tip>
  );
}

export function ConceptIcon({ size = 16 }: { size?: number }) {
  return <MenuBookOutlinedIcon sx={{ fontSize: size, flex: "none", color: "var(--concept)" }} />;
}

/*
 * Concepts as a row of small chips, each opening the concept in the panel.
 * With `popovers`, hovering one shows what it means first; inside a popover
 * of its own, it doesn't.
 */
export function ConceptChips({
  concepts,
  onOpen,
  popovers = true,
  scopeOf,
}: {
  concepts: Concept[];
  onOpen: (id: string) => void;
  popovers?: boolean;
  /* Where a concept is from, such as its domain, said beside those whose names repeat here. */
  scopeOf?: (concept: Concept) => string;
}) {
  const repeated = new Set(concepts.map((c) => c.name).filter((name, i, all) => all.indexOf(name) !== i));
  return (
    <span className="concept-chips">
      {concepts.map((c) => {
        const chip = (
          <button
            key={c.id}
            type="button"
            className="concept-chip"
            data-concept={c.id}
            data-no-pan
            onClick={(e) => {
              e.stopPropagation();
              onOpen(c.id);
            }}
          >
            {c.name}
            {scopeOf && repeated.has(c.name) ? <span className="concept-chip-scope">{scopeOf(c)}</span> : null}
          </button>
        );
        return popovers ? (
          <DetailsPopover key={c.id} hoverOnly title={<ConceptSummary concept={c} />}>
            {chip}
          </DetailsPopover>
        ) : (
          chip
        );
      })}
    </span>
  );
}

function ConceptSummary({ concept }: { concept: Concept }) {
  return (
    <DetailsCard card>
      <DetailsEyebrow>Concept</DetailsEyebrow>
      <Box sx={{ mt: 0.5, fontSize: "1.12em", fontWeight: 700, lineHeight: 1.3 }}>{concept.name}</Box>
      {concept.description ? <Box sx={{ mt: 0.75 }}>{concept.description}</Box> : null}
      <Box sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>Click to see everything it's related to.</Box>
    </DetailsCard>
  );
}

/*
 * Concepts it's not to be confused with, then those its Markdown links to,
 * then those that share a rule with it, since a rule that refers to two
 * concepts says how they bear on each other.
 */
export function related(state: DocketState, concept: Concept): Concept[] {
  const ids = new Set<string>();
  for (const f of concept.from)
    for (const c of f.confusedWith ?? []) {
      const to = c.concept ? conceptLinked(state, c.concept, f.domain) : undefined;
      if (to) ids.add(to.id);
    }
  for (const f of concept.from)
    for (const [, href] of `${f.body} ${fieldsText(f)}`.matchAll(/\]\(([^)\s]+)\)/g)) {
      const to = follow(state, f, href);
      if (to && "concept" in to) ids.add(to.concept);
    }
  for (const ruleId of concept.rules) for (const id of find(state.rules, ruleId)?.concepts ?? []) ids.add(id);
  ids.delete(concept.id);
  return [...ids].flatMap((id) => find(state.concepts, id) ?? []);
}
