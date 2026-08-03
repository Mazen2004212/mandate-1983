import type {
  ConditionEvaluationResult,
  ConditionScalar,
  PlayerConditionExplanation,
} from "./condition-result";

type PlayerScalar = Exclude<ConditionScalar, bigint>;

function playerScalar(value: unknown): PlayerScalar | undefined {
  if (value === null) return null;
  if (typeof value === "bigint") return value.toString(10);
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  return undefined;
}

export function projectConditionExplanationForPlayer(
  result: ConditionEvaluationResult,
): PlayerConditionExplanation | null {
  if (
    result.visibility === "hidden" ||
    result.visibility === "report_dependent" ||
    result.visibility === "developer_only" ||
    result.visibility === "administrative"
  ) {
    return null;
  }

  const children = Object.freeze(
    result.children
      .map(projectConditionExplanationForPlayer)
      .filter((child): child is PlayerConditionExplanation => child !== null),
  );
  const base = {
    conditionId: result.conditionId,
    passed: result.passed,
    visibility: result.visibility,
    message: result.passed ? "Requirement met." : "Requirement not met.",
    children,
  } as const;

  if (
    result.visibility !== "public" &&
    result.visibility !== "player_visible_exact"
  ) {
    return Object.freeze(base);
  }

  const actualValue = playerScalar(result.actualValue);
  const expectedValue = playerScalar(result.expectedValue);
  return Object.freeze({
    ...base,
    ...(actualValue === undefined ? {} : { actualValue }),
    ...(expectedValue === undefined ? {} : { expectedValue }),
  });
}
