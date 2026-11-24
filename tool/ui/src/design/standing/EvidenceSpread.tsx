import Box from "@mui/material/Box";
import { DetailsCard, DetailsEyebrow, DetailsPopover } from "../DetailsPopover";
import { StandingMark } from "./StandingMark";

/*
 * Evidence spread: how the rules some capabilities follow hold, as a bar
 * split by how many are in each standing, not held first, then on trust,
 * then with evidence, in each standing's color, unlabeled. Each rule counts
 * once on each capability that follows it, since it can hold on one and not
 * another. Its popover counts each. Like the risk and stability spreads, it
 * goes on capabilities, features and domains.
 */

export type EvidenceStanding = "gap" | "trust" | "evidence";

const ORDER: { standing: EvidenceStanding; name: string; means: string }[] = [
  { standing: "gap", name: "Not held yet", means: "A gap says the capability doesn't hold to it yet." },
  { standing: "trust", name: "On trust", means: "Nothing says either way, so it's taken on trust." },
  { standing: "evidence", name: "With evidence", means: "Something verifies or implements it." },
];

const spreadOf = (standings: EvidenceStanding[]) => ORDER.map((o) => ({ ...o, n: standings.filter((s) => s === o.standing).length })).filter((o) => o.n);

/* "2 not held yet · 5 on trust · 3 with evidence". */
export const evidenceCounts = (standings: EvidenceStanding[]) =>
  spreadOf(standings)
    .map((o) => `${o.n} ${o.name.toLowerCase()}`)
    .join(" · ");

function Bar({ standings, wide = false }: { standings: EvidenceStanding[]; wide?: boolean }) {
  return (
    <span className={`evidence-spread-bar${wide ? " wide" : ""}`} aria-hidden>
      {spreadOf(standings).map((o) => (
        <span key={o.standing} data-evidence={o.standing} style={{ flexGrow: o.n }} />
      ))}
    </span>
  );
}

/* The bar, opening its counts. `of` names what the rules are on, for the popover. Inside something clickable, `inButton` opens it on hover only. */
export function EvidenceSpread({ standings, of, inButton = false }: { standings: EvidenceStanding[]; of: string; inButton?: boolean }) {
  if (!standings.length) return null;
  return (
    <DetailsPopover
      hoverOnly={inButton}
      title={
        <DetailsCard card width={300}>
          <DetailsEyebrow>Evidence spread in {of}</DetailsEyebrow>
          <Box sx={{ mt: 1.25 }}>
            <Bar standings={standings} wide />
          </Box>
          <ul className="evidence-spread-counts">
            {spreadOf(standings).map((o) => (
              <li key={o.standing}>
                <span className="evidence-spread-name" data-evidence={o.standing}>
                  <StandingMark standing={o.standing} label={o.means} />
                  {o.name}
                </span>
                <span className="evidence-spread-n">{o.n}</span>
              </li>
            ))}
          </ul>
          <Box sx={{ mt: 1, color: "text.secondary", fontSize: "0.92em" }}>
            How the rules these capabilities follow hold, each counted once on each capability that follows it. Not held where a gap says so, with
            evidence where something verifies or implements it, and otherwise on trust.
          </Box>
        </DetailsCard>
      }
    >
      <span className="evidence-spread-mark" role="img" aria-label={`Evidence spread: ${evidenceCounts(standings)}`} tabIndex={inButton ? undefined : 0}>
        <Bar standings={standings} />
      </span>
    </DetailsPopover>
  );
}
