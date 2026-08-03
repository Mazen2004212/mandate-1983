import type { AuthoritativeSave, MutationHistoryEntry } from "../../../domain";
import type { ContentRegistryBundle } from "../../registry";
import type { ChapterId } from "../../schemas/common";
import type { ScenarioDefinition } from "../../schemas/scenario";
import type {
  ConditionEvaluationResult,
  PlayerConditionExplanation,
} from "../conditions";
import type { CharacterAvailabilityResult } from "./character-availability";

export type EligibilityReasonCode =
  | "condition_failed"
  | "content_version_mismatch"
  | "exclusion_satisfied"
  | "expired"
  | "inactive_lifecycle"
  | "manifest_excluded"
  | "manifest_inactive"
  | "manifest_withdrawn"
  | "missing_predecessor"
  | "missing_registry_reference"
  | "not_yet_available"
  | "participant_unavailable"
  | "repeat_limit_reached"
  | "resolved_non_repeatable"
  | "save_version_mismatch";

export interface EligibilityReason {
  readonly code: EligibilityReasonCode;
  readonly path: readonly (string | number)[];
  readonly developerMessage: string;
  readonly playerMessage: string | null;
}

export interface ScenarioEligibilityContext {
  readonly registry: ContentRegistryBundle;
  readonly save: AuthoritativeSave;
  readonly chapter: ChapterId;
  readonly history: readonly MutationHistoryEntry[];
}

export interface ScenarioEligibilityResult {
  readonly scenarioId: string;
  readonly eligible: boolean;
  readonly periodStatus:
    "not_yet_available" | "currently_available" | "expired";
  readonly blockingReasons: readonly EligibilityReason[];
  readonly passedReasons: readonly EligibilityReason[];
  readonly conditionResults: readonly ConditionEvaluationResult[];
  readonly playerConditionExplanations: readonly PlayerConditionExplanation[];
  readonly characterAvailability: readonly CharacterAvailabilityResult[];
  readonly playerBlockingReasons: readonly string[];
  readonly occurrenceCount: number;
  readonly scenario: ScenarioDefinition;
}
