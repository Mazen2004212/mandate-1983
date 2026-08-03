import type { DeterministicIntegerExplanation } from "../../../domain";
import type { ScenarioDefinition } from "../../schemas/scenario";
import type {
  ScenarioEligibilityContext,
  ScenarioEligibilityResult,
} from "../eligibility";

export const SCENARIO_SCHEDULER_JITTER_NAMESPACE =
  "scenario_scheduler_jitter" as const;

export interface ScenarioSchedulerContext extends ScenarioEligibilityContext {
  readonly politicalPeriod: number;
  readonly attemptIndex: number;
  readonly periodsWaiting: Readonly<Record<string, number>>;
  readonly dueDirectFollowUpIds: readonly string[];
}

export interface ScenarioCandidateRanking {
  readonly scenarioId: string;
  readonly eligible: boolean;
  readonly categoryRank: number;
  readonly basePriority: number;
  readonly urgency: number;
  readonly periodsWaiting: number;
  readonly waitingContribution: number;
  readonly jitter: number;
  readonly effectivePriority: number;
  readonly eligibility: ScenarioEligibilityResult;
  readonly schedulerBlockingReasons: readonly string[];
  readonly jitterExplanation: DeterministicIntegerExplanation;
  readonly scenario: ScenarioDefinition;
}

export interface ScenarioScheduleResult {
  readonly status: "selected" | "no_eligible_scenario";
  readonly selectedScenarioId: string | null;
  readonly selectedScenario: ScenarioDefinition | null;
  readonly candidates: readonly ScenarioCandidateRanking[];
  readonly developerExplanation: string;
}

export interface PlayerScenarioCandidateExplanation {
  readonly eligible: boolean;
  readonly category:
    | "direct_follow_up"
    | "mandatory"
    | "major"
    | "optional"
    | "ambient_media"
    | "outcome";
  readonly message: string;
  readonly blockingReasons: readonly string[];
}

export interface PlayerScenarioScheduleExplanation {
  readonly status: ScenarioScheduleResult["status"];
  readonly message: string;
  readonly candidates: readonly PlayerScenarioCandidateExplanation[];
}
