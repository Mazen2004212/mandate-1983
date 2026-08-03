import type { AuthoritativeSave, StateVisibility } from "../../../domain";
import type { ContentRegistryBundle } from "../../registry";
import type { ChapterId } from "../../schemas/common";
import type { ConditionDefinition } from "../../schemas/conditions";

export type ConditionScalar = string | number | bigint | boolean | null;
export type ConditionValue = ConditionScalar | readonly string[];

export type ConditionFailureCode =
  | "condition_failed"
  | "cyclic_condition"
  | "missing_condition"
  | "missing_target"
  | "unsupported_operation";

export interface ConditionEvaluationContext {
  readonly save: AuthoritativeSave;
  readonly chapter: ChapterId;
  readonly registry: Pick<ContentRegistryBundle, "conditions">;
}

export interface ConditionEvaluationResult {
  readonly conditionId: string;
  readonly conditionType: ConditionDefinition["type"] | "missing";
  readonly operator: string;
  readonly passed: boolean;
  readonly visibility: StateVisibility;
  readonly targetReference: string | null;
  readonly expectedValue: ConditionValue | null;
  readonly actualValue: ConditionValue | null;
  readonly failureCode: ConditionFailureCode | null;
  readonly developerExplanation: string;
  readonly children: readonly ConditionEvaluationResult[];
}

export interface PlayerConditionExplanation {
  readonly conditionId: string;
  readonly passed: boolean;
  readonly visibility:
    "public" | "player_visible_exact" | "player_visible_qualitative";
  readonly message: string;
  readonly actualValue?: string | number | boolean | null;
  readonly expectedValue?: string | number | boolean | null;
  readonly children: readonly PlayerConditionExplanation[];
}

export function isConditionDefinition(
  value: ConditionDefinition | undefined,
): value is ConditionDefinition {
  return value !== undefined;
}
