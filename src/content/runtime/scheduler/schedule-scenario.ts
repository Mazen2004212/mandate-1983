import { createSeedContext, deterministicIntInclusive } from "../../../domain";
import { compareAscii } from "../common";
import { evaluateScenarioEligibility } from "../eligibility";
import {
  SCENARIO_SCHEDULER_JITTER_NAMESPACE,
  type ScenarioCandidateRanking,
  type ScenarioScheduleResult,
  type ScenarioSchedulerContext,
} from "./scheduler-result";

const CATEGORY_RANK = Object.freeze({
  direct_follow_up: 5,
  mandatory: 4,
  major: 3,
  optional: 2,
  ambient_media: 1,
  outcome: 0,
});

function validateSchedulerContext(context: ScenarioSchedulerContext): void {
  if (
    context.politicalPeriod !== context.save.politicalPeriod ||
    context.politicalPeriod !==
      context.save.authoritativeState.timeline.politicalPeriod
  ) {
    throw new RangeError(
      "Scheduler political period must match indexed and authoritative save periods.",
    );
  }
  if (!Number.isSafeInteger(context.attemptIndex) || context.attemptIndex < 0) {
    throw new RangeError(
      "Scheduler attempt index must be a non-negative safe integer.",
    );
  }
  for (const [scenarioId, periodsWaiting] of Object.entries(
    context.periodsWaiting,
  )) {
    if (!Number.isSafeInteger(periodsWaiting) || periodsWaiting < 0) {
      throw new RangeError(
        `Periods waiting for ${scenarioId} must be a non-negative safe integer.`,
      );
    }
  }
}

function candidateOrder(
  left: ScenarioCandidateRanking,
  right: ScenarioCandidateRanking,
): number {
  return (
    Number(right.eligible) - Number(left.eligible) ||
    right.categoryRank - left.categoryRank ||
    right.effectivePriority - left.effectivePriority ||
    compareAscii(left.scenarioId, right.scenarioId)
  );
}

export function scheduleScenario(
  context: ScenarioSchedulerContext,
): ScenarioScheduleResult {
  validateSchedulerContext(context);
  const dueDirectFollowUps = new Set(context.dueDirectFollowUpIds);
  const candidates = Object.values(context.registry.scenarios).map(
    (scenario): ScenarioCandidateRanking => {
      const eligibility = evaluateScenarioEligibility(scenario, context);
      const periodsWaiting = context.periodsWaiting[scenario.id] ?? 0;
      const waitingContribution = Math.min(periodsWaiting, 9);
      const seedContext = createSeedContext({
        gameSeed: context.save.gameSeed,
        namespace: SCENARIO_SCHEDULER_JITTER_NAMESPACE,
        entityId: scenario.id,
        politicalPeriod: context.politicalPeriod,
        attemptIndex: context.attemptIndex,
        contentVersion: context.save.contentVersion,
      });
      const jitterResult = deterministicIntInclusive(seedContext, 0, 9);
      const schedulerBlockingReasons =
        scenario.category === "direct_follow_up" &&
        !dueDirectFollowUps.has(scenario.id)
          ? Object.freeze([
              `Direct follow-up ${scenario.id} is not due in the explicit scheduler input.`,
            ])
          : Object.freeze([]);
      return Object.freeze({
        scenarioId: scenario.id,
        eligible: eligibility.eligible && schedulerBlockingReasons.length === 0,
        categoryRank: CATEGORY_RANK[scenario.category],
        basePriority: scenario.priority,
        urgency: scenario.urgency,
        periodsWaiting,
        waitingContribution,
        jitter: jitterResult.value,
        effectivePriority:
          scenario.priority * 100 +
          scenario.urgency * 10 +
          waitingContribution +
          jitterResult.value,
        eligibility,
        schedulerBlockingReasons,
        jitterExplanation: jitterResult.explanation,
        scenario,
      });
    },
  );
  candidates.sort(candidateOrder);
  const selected = candidates.find((candidate) => candidate.eligible);
  return Object.freeze({
    status: selected === undefined ? "no_eligible_scenario" : "selected",
    selectedScenarioId: selected?.scenarioId ?? null,
    selectedScenario: selected?.scenario ?? null,
    candidates: Object.freeze(candidates),
    developerExplanation:
      selected === undefined
        ? "No scenario satisfied the complete eligibility and scheduling contract."
        : `Selected ${selected.scenarioId} after category, effective-priority, and stable authored-ID ordering.`,
  });
}
