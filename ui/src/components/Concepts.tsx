import { type ReactNode } from "react";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import Box from "@mui/material/Box";
import { DetailsPopover } from "./popovers/DetailsPopover";
import { follow } from "./markdown/Markdown";
import { conceptLinked, fieldsText, find, pageHref, type Concept, type DocketState, type Pick } from "../state";
import Tooltip from "@mui/material/Tooltip";
import { ConceptSummary } from "./popovers/ConceptSummary";

/*
 * A way from a side panel to a doc's detail page, in a tab of its own, so the
 * map stays where it was in this one: an outlined button-like link, lit in a
 * concept's teal on hover.
 */
export function PageLink({ pick, children = "Details" }: { pick: Pick; children?: ReactNode }) {
  return (
    <Tooltip title="Open everything about it in a new tab">
      <Box
        component="a"
        href={pageHref(pick)}
        target="_blank"
        rel="noopener"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          px: 1.25,
          py: 0.5,
          font: "inherit",
          fontSize: 12.5,
          fontWeight: 600,
          color: "text.secondary",
          textDecoration: "none",
          bgcolor: "transparent",
          border: 1,
          borderColor: "surface.borderStrong",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "color 120ms, border-color 120ms, background-color 120ms",
          "&:hover": { color: "concept.main", borderColor: "concept.main", bgcolor: "concept.soft" },
        }}
      >
        <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
        {children}
      </Box>
    </Tooltip>
  );
}

export function ConceptIcon({ size = 16 }: { size?: number }) {
  return <MenuBookOutlinedIcon sx={{ fontSize: size, flex: "none", color: "concept.main" }} />;
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
    <Box component="span" sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {concepts.map((c) => {
        const chip = (
          <Box
            component="button"
            key={c.id}
            type="button"
            data-concept={c.id}
            data-no-pan
            onClick={(e) => {
              e.stopPropagation();
              onOpen(c.id);
            }}
            sx={{
              px: 1,
              py: "1px",
              font: "inherit",
              fontSize: 12,
              fontWeight: 550,
              lineHeight: "18px",
              color: "concept.main",
              bgcolor: "concept.soft",
              border: 1,
              borderColor: "transparent",
              borderRadius: 999,
              cursor: "pointer",
              "&:hover": { borderColor: "concept.main" },
              "&:focus-visible": { outline: 2, outlineColor: "concept.main", outlineOffset: 1 },
            }}
          >
            {c.name}
            {scopeOf && repeated.has(c.name) ? (
              <Box component="span" sx={{ ml: "5px", fontWeight: 450, opacity: 0.75 }}>
                {scopeOf(c)}
              </Box>
            ) : null}
          </Box>
        );
        return popovers ? (
          <DetailsPopover key={c.id} hoverOnly title={<ConceptSummary concept={c} />}>
            {chip}
          </DetailsPopover>
        ) : (
          chip
        );
      })}
    </Box>
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
