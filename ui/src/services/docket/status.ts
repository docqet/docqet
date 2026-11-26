import { getOne, productPath, type Showing } from "./client";
import type { ExposureResource, MaturityResource, ReadinessResource, RiskSummaryResource } from "./shared";

export type StatusResource = {
  maturity: MaturityResource;
  readiness: ReadinessResource;
  exposure: ExposureResource;
  risk: RiskSummaryResource;
  counts: Record<string, unknown>;
};

/*
 * The figures of what's showing, or, with `forRef`, of the capabilities it
 * names: several references, comma-separated, for those they share.
 */
export const getStatus = (showing: Showing, forRef?: string) => getOne<StatusResource>(productPath(showing, "/status", forRef ? { for: forRef } : {}));
