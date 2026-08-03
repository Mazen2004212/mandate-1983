import type {
  PlayerScenarioScheduleExplanation,
  ScenarioScheduleResult,
} from "./scheduler-result";

export function projectScheduleExplanationForPlayer(
  result: ScenarioScheduleResult,
): PlayerScenarioScheduleExplanation {
  const candidates = result.candidates.map((candidate) => {
    const blockingReasons = Object.freeze([
      ...candidate.eligibility.playerBlockingReasons,
      ...(candidate.schedulerBlockingReasons.length === 0
        ? []
        : ["A required follow-up is not currently due."]),
    ]);
    return Object.freeze({
      eligible: candidate.eligible,
      category: candidate.scenario.category,
      message: candidate.eligible
        ? "This event is currently available."
        : "This event is not currently available.",
      blockingReasons,
    });
  });
  return Object.freeze({
    status: result.status,
    message:
      result.status === "selected"
        ? "An available event was selected."
        : "No event is currently available.",
    candidates: Object.freeze(candidates),
  });
}
