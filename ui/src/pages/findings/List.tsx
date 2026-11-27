// docqet:implements capability:seeing-findings
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { InlineMarkdown } from "../../components/markdown/Markdown";
import { DOC_KINDS, type DocKind, type Route } from "../../routes";
import { Empty, PageHeader, Section, View } from "../../components/shell/layout";
import { tagSx } from "../../components/doc/DocPage";
import { find, type Doc, type DocqetState, type Finding } from "../../state";
import { DocLink } from "../../components/indexParts";

/*
 * What's wrong in the docs, as the indexer and combining found it, grouped by
 * kind: contradictions first, since two projects disagreeing is the one to
 * settle before anything else reads true, then the other kinds, the most
 * common first. Advisory findings come last, each kind tagged as advisory,
 * since they're worth a look but never fail a check. Each says what's wrong
 * and links to what it's about.
 */
export default function FindingsPage({ state }: { state: DocqetState; route: Route }) {
  const failing = state.findings.filter((p) => !p.advisory);
  const advisory = state.findings.filter((p) => p.advisory);
  return (
    <View title="Findings" wide>
      <PageHeader
        title="Findings"
        lede="What's wrong in the docs? Contradictions between projects first, then mistakes such as links to things that don't exist, then advice that never fails the check."
      />
      {!state.findings.length ? (
        <Empty>No findings: the docs hold together.</Empty>
      ) : (
        <>
          {failing.length ? <FindingSections state={state} findings={failing} /> : <Empty>Nothing fails the check. What&rsquo;s below is advice.</Empty>}
          <FindingSections state={state} findings={advisory} advisory />
        </>
      )}
    </View>
  );
}

/* Findings in a section per kind, in order; advisory ones tagged as such. */
function FindingSections({ state, findings: all, advisory = false }: { state: DocqetState; findings: Finding[]; advisory?: boolean }) {
  const count = (type: string) => all.filter((p) => p.type === type).length;
  const types = [...new Set(all.map((p) => p.type))].sort((a, b) => rank(a) - rank(b) || count(b) - count(a) || a.localeCompare(b));
  return types.map((type) => {
    const findings = all.filter((p) => p.type === type).sort((a, b) => a.subject.localeCompare(b.subject));
    return (
      <Section
        key={type}
        title={
          advisory ? (
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
              {TYPES[type]?.name ?? type}
              <Box component="span" sx={tagSx}>
                Advisory
              </Box>
            </Box>
          ) : (
            (TYPES[type]?.name ?? type)
          )
        }
        count={findings.length}
        note={advisory ? `${TYPES[type]?.note ?? ""} Advisory: it never fails the check.`.trim() : TYPES[type]?.note}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "34%" }}>About</TableCell>
                <TableCell>{advisory ? "Advice" : "What's wrong"}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {findings.map((p, i) => (
                <TableRow key={`${p.subject}:${i}`}>
                  <TableCell sx={{ width: "34%" }}>
                    <Subject state={state} finding={p} />
                  </TableCell>
                  <TableCell>{p.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>
    );
  });
}

/* Each kind of finding, as the spec lists them, named and said in a line. */
const TYPES: Record<string, { name: string; note: string }> = {
  contradiction: { name: "Contradictions", note: "Projects that should agree about a doc say different things." },
  "in-two-features": { name: "In two features", note: "More than one feature lists the same capability." },
  "duplicate-id": { name: "Duplicate IDs", note: "Two docs, gaps or tradeoffs that should each have their own ID share one." },
  "unknown-id": { name: "Links to nothing", note: "A link, annotation or a gap's rule names a doc, gap or tradeoff that doesn't exist." },
  "invalid-frontmatter": { name: "Invalid fields", note: "A required field is missing, or a value isn't allowed, such as a link of the wrong type." },
  "broken-link": { name: "Broken links", note: "A relative link in a doc's body or a text value doesn't resolve." },
  "unlinked-rule": { name: "Rules nothing follows", note: "No capability follows the rule." },
  "solves-no-problem": { name: "Solves no problem", note: "A capability that names no problem it solves, so nothing says who it's for." },
  "unknown-outcome": {
    name: "Unknown outcomes",
    note: "An outcome that a gap, tradeoff or decision affects, or that a mechanism or component says it meets, isn't in the rubric.",
  },
};

/* Contradictions, and the findings that are contradictions too, before the rest. */
const FIRST = ["contradiction", "in-two-features", "duplicate-id"];
const rank = (type: string) => (FIRST.includes(type) ? FIRST.indexOf(type) : FIRST.length);

/* What a finding is about, linking to its page when it's showing; else as written. */
function Subject({ state, finding }: { state: DocqetState; finding: Finding }) {
  const colon = finding.subject.indexOf(":");
  const type = finding.subject.slice(0, colon);
  const id = finding.subject.slice(colon + 1);
  /* A gap: `capability:x#key`, which is its project's in state. */
  if (id.includes("#")) {
    const gap = state.gaps.find((g) => g.id.startsWith(`${finding.subject}@`));
    if (gap) return <DocLink kind="gap" id={gap.id} name={<InlineMarkdown text={gap.name} />} />;
  } else if ((DOC_KINDS as string[]).includes(type)) {
    const doc = find(docsOf(state, type as DocKind), id);
    if (doc) return <DocLink kind={type as DocKind} id={doc.id} name={doc.name} />;
  }
  return (
    <Box component="code" sx={{ fontFamily: "fontFamilyMono", fontSize: 12, color: "text.secondary", overflowWrap: "anywhere" }}>
      {finding.subject}
    </Box>
  );
}

function docsOf(state: DocqetState, kind: DocKind): Doc[] {
  switch (kind) {
    case "domain":
      return state.domains;
    case "feature":
      return state.features;
    case "capability":
      return state.capabilities;
    case "concept":
      return state.concepts;
    case "persona":
      return state.personas;
    case "problem":
      return state.problems;
    case "initiative":
      return state.initiatives;
    case "mechanism":
      return state.mechanisms;
    case "component":
      return state.components;
    case "rule":
      return state.rules;
    case "gap":
      return [];
  }
}
