import { getOne, productPath, type Showing } from "./client";

export type RubricExampleResource = { text: string; kinds: string[] };
export type ExpectedOutcomeResource = {
  id: string;
  level: string;
  text: string;
  until: string | null;
  implementation: RubricExampleResource[];
  overengineering: RubricExampleResource[];
};
export type RubricLevelResource = {
  level: string;
  summary: string | null;
  outcomes: ExpectedOutcomeResource[];
  implementation: RubricExampleResource[];
  overengineering: RubricExampleResource[];
};
export type RubricQualityResource = { id: string; name: string; question: string; why: string; levels: RubricLevelResource[] };
export type RubricResource = { kinds: { id: string; name: string }[]; qualities: RubricQualityResource[] };

/* The stability rubric the product showing is held to. */
export const getRubric = (showing: Showing, signal?: AbortSignal) => getOne<RubricResource>(productPath(showing, "/rubric"), signal);
