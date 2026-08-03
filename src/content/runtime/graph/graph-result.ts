import type { ContentManifest } from "../../schemas/manifest";
import type { ScenarioDefinition } from "../../schemas/scenario";

export type ContentGraphFindingCode =
  | "conditional_reachability_indeterminate"
  | "contradictory_conditions"
  | "cycle"
  | "mandatory_cycle"
  | "manifest_excluded"
  | "missing_follow_up"
  | "missing_predecessor"
  | "self_reference"
  | "unreachable_mandatory";

export interface ContentGraphFinding {
  readonly severity: "error" | "warning" | "information";
  readonly code: ContentGraphFindingCode;
  readonly scenarioIds: readonly string[];
  readonly path: readonly (string | number)[];
  readonly message: string;
}

export interface ContentGraphInput {
  readonly scenarios: Readonly<Record<string, ScenarioDefinition>>;
  readonly manifest?: ContentManifest;
}

export interface ContentGraphAnalysis {
  readonly valid: boolean;
  readonly activeScenarioIds: readonly string[];
  readonly entryScenarioIds: readonly string[];
  readonly terminalScenarioIds: readonly string[];
  readonly reachableScenarioIds: readonly string[];
  readonly findings: readonly ContentGraphFinding[];
}
