// docqet:implements capability:how-its-built
import Box from "@mui/material/Box";
import { facets } from "../../components/Fields";
import { MORE_ABOUT } from "../../components/markdown/Markdown";
import { STABILITY } from "../../components/stability/stability";
import { plural } from "../../components/names";
import { initiativesOf } from "../../components/Initiatives";
import { expectedOutcome, gapsById, inRiskOrder, openDecisions, find, type DocqetState, type TechnicalDoc } from "../../state";
import { sectionHref, type Route } from "../../routes";
import { Empty, Section, Stat, Tabs, currentTab, type TabDef } from "../../components/shell/layout";
import { type DocPageProps } from "../../components/doc/DocPage";
import { tabHref } from "../../components/doc/DocPage";
import { DocView } from "../../components/doc/DocPage";
import { DocHeader } from "../../components/doc/DocPage";
import { Sources } from "../../components/doc/About";
import { hasBody } from "../../components/doc/About";
import { Bodies } from "../../components/doc/About";
import { openTotal, OpenStat, OpenTab, type OpenHere } from "../../components/doc/Open";
import { DecidedTab } from "../../components/doc/DecidedTab";
import { CapabilityTable } from "../../components/doc/CapabilityTable";
import { EvidencePair } from "../../components/doc/EvidencePair";
import { Missing } from "../../components/doc/Missing";
import { docGo, cardSx, tagSx } from "../../components/doc/DocPage";
import { ConstraintRows } from "../../components/Constraints";

/* A mechanism's or component's page, or what shows when it isn't in the projects showing. */
export default function TechnicalView({ state, kind, id, route }: { state: DocqetState; kind: "mechanism" | "component"; id: string; route: Route }) {
  const doc = find(kind === "mechanism" ? state.mechanisms : state.components, id);
  if (!doc) return <Missing kind={kind} id={id} />;
  return <TechnicalPage doc={doc} route={route} {...docGo(state)} />;
}

/*
 * A mechanism or component: how it's built, in the code's words, and the
 * constraints a mechanism respects, if any, then what's
 * left (its open decisions and technical gaps), what's been decided (its
 * tradeoffs), where it is in the code, from the
 * annotations that implement or verify it, and the capabilities that rely on
 * it.
 */
export function TechnicalPage({ doc, route, ...go }: DocPageProps & { doc: TechnicalDoc }) {
  const { state } = go;
  const capabilities = doc.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const outcomes = doc.meets.flatMap((id) => expectedOutcome(state.rubric, id) ?? []);
  const respects = doc.respects.flatMap((id) => find(state.constraints, id) ?? []);
  const places = doc.evidence.implements.length + doc.evidence.verifies.length;
  const open = openOnTechnical(state, doc);
  const decided = doc.tradeoffs.length;
  const reliedLabel = doc.kind === "component" ? "Relied on by" : "Applies to";
  const tabs: TabDef[] = [
    { id: "built", label: "How it's built" },
    { id: "open", label: "Gaps and decisions", term: "gap" as const, count: openTotal(open) || undefined },
    ...(decided ? [{ id: "decided", label: "Decided", count: decided }] : []),
    ...(places ? [{ id: "code", label: "In the code", term: "evidence" as const, count: places }] : []),
    ...(capabilities.length ? [{ id: "relied", label: reliedLabel, count: capabilities.length }] : []),
  ];
  const tab = currentTab(route, tabs);
  const fielded = doc.from.some((f) => facets(doc.kind, f, go).length) || doc.from.length > 1;
  return (
    <DocView title={doc.name} route={route}>
      <DocHeader
        state={state}
        kind={doc.kind}
        doc={doc}
        initiatives={initiativesOf(state, capabilities)}
        trail={<a href={sectionHref("built")}>How it's built</a>}
        stats={
          <>
            <OpenStat open={open} of={doc.name} tab="open" />
            <Stat
              label="Tradeoffs"
              term="tradeoff"
              value={doc.tradeoffs.length || "None"}
              note="Chosen on purpose"
              href={decided ? tabHref("decided") : undefined}
            />
            <Stat
              label="In the code"
              term="evidence"
              value={places ? plural(places, "place", "places") : "None"}
              note={places ? "From its annotations" : "Nothing points at it yet"}
              href={places ? tabHref("code") : undefined}
            />
            <Stat
              label={reliedLabel}
              value={plural(capabilities.length, "capability", "capabilities")}
              note={doc.kind === "mechanism" ? (doc.applies === "product" ? "Across its product" : "Across its project") : undefined}
              href={capabilities.length ? tabHref("relied") : undefined}
            />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "built" ? (
        <>
          <Sources {...go} kind={doc.kind} doc={doc} title="What it is" />
          {respects.length ? (
            <Section title="Respects" term="constraint" count={respects.length} note="What it keeps to that nobody here chose.">
              <ConstraintRows constraints={respects} />
            </Section>
          ) : null}
          {hasBody(doc) ? (
            <Section title={MORE_ABOUT}>
              <Bodies {...go} doc={doc} />
            </Section>
          ) : null}
          {outcomes.length ? (
            <Section
              title="Outcomes it meets"
              count={outcomes.length}
              note="For each capability it serves, these count as met on its rubric, with the places in the code as evidence, unless a gap names one."
            >
              <Box sx={cardSx}>
                <Box component="ul" sx={{ pl: 2.5, listStyle: "disc", fontSize: 13.5, "& > li": { py: "2px" }, "& > li::marker": { color: "text.disabled" } }}>
                  {outcomes.map(({ outcome, quality }) => (
                    <li key={outcome.id}>
                      {outcome.text}
                      {/* Its quality and level, as a tag under it. */}
                      <Box
                        component="span"
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: "4px 10px",
                          mt: "3px",
                          mb: "2px",
                          fontSize: 12,
                          color: "text.disabled",
                        }}
                      >
                        <Box component="span" sx={tagSx}>
                          {quality.name} · {STABILITY[outcome.level].name}
                        </Box>
                      </Box>
                    </li>
                  ))}
                </Box>
              </Box>
            </Section>
          ) : null}
          {!fielded && !hasBody(doc) && !outcomes.length && !respects.length ? <Empty>Nothing more is written about it than what's above.</Empty> : null}
        </>
      ) : tab === "open" ? (
        <OpenTab {...go} open={open} here={doc} nothing="Nothing open: no open decisions or technical gaps are written down." />
      ) : tab === "decided" ? (
        <DecidedTab
          {...go}
          doc={doc}
          tradeoffs={doc.tradeoffs}
          tradeoffNote="Technical choices made on purpose, each with the benefit and drawback that came with it."
        />
      ) : tab === "code" ? (
        <Section title="In the code" term="evidence" count={places} note="Where the code says it implements or verifies it, from its annotations.">
          <EvidencePair state={state} doc={doc} />
        </Section>
      ) : (
        <Section
          title={doc.kind === "component" ? "Capabilities that rely on it" : doc.applies === "product" ? "Applies across the product" : "Applies to"}
          count={capabilities.length}
        >
          <CapabilityTable state={state} capabilities={capabilities} />
        </Section>
      )}
    </DocView>
  );
}

/* What's open about a mechanism or component: its own open decisions and technical gaps. */
export function openOnTechnical(state: DocqetState, doc: TechnicalDoc): OpenHere {
  const decisions = openDecisions(doc).length;
  return {
    holders: decisions ? [{ kind: doc.kind, doc }] : [],
    decisions,
    gaps: inRiskOrder(gapsById(state, doc.gaps), (g) => g).map((gap) => ({ gap })),
    risk: doc.risk,
  };
}
