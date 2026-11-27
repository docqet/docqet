import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import { type ReactNode } from "react";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import ExtensionOutlinedIcon from "@mui/icons-material/ExtensionOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import SentimentDissatisfiedOutlinedIcon from "@mui/icons-material/SentimentDissatisfiedOutlined";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import { PersonaIcon } from "./Personas";
import { type TechnicalKind, type RuleStanding } from "../state";

/* What the panel can show: the product's parts, each as a list or one of them. */
export type ExploreKind = "domain" | "feature" | "capability" | "persona";

export const NAMES: Record<ExploreKind, { one: string; many: string; icon: ReactNode }> = {
  domain: { one: "Domain", many: "Domains", icon: <DomainIcon size={18} /> },
  feature: { one: "Feature", many: "Features", icon: <WidgetsOutlinedIcon sx={{ fontSize: 18, color: "secondary.main" }} /> },
  capability: { one: "Capability", many: "Capabilities", icon: <BoltOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} /> },
  persona: { one: "Persona", many: "Personas", icon: <PersonaIcon size={18} /> },
};

/* Mechanisms' and components' names and icons, wherever one is named. */
export const TECHNICAL_NAMES: Record<TechnicalKind, { one: string; many: string; icon: ReactNode }> = {
  mechanism: { one: "Mechanism", many: "Mechanisms", icon: <HubOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} /> },
  component: { one: "Component", many: "Components", icon: <ExtensionOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} /> },
};

/* How a rule a capability follows stands, in words, wherever its mark shows. */
export const RULE_STANDING_LABELS: Record<RuleStanding, string> = {
  evidence: "Held, with evidence",
  trust: "Held, on trust",
  gap: "Not held yet: a gap says so",
};

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/* A problem's mark, wherever one is named. */
export function ProblemIcon({ size = 16 }: { size?: number }) {
  return <SentimentDissatisfiedOutlinedIcon sx={{ fontSize: size, flex: "none", color: "problem.main" }} />;
}

/* A domain's mark, wherever one is named. */
export function DomainIcon({ size = 14 }: { size?: number }) {
  return <SpaceDashboardOutlinedIcon sx={{ fontSize: size, flex: "none", color: "text.secondary" }} />;
}
