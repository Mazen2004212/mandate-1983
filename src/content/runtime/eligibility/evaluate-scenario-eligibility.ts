import type { ScenarioDefinition } from "../../schemas/scenario";
import { compareAscii, compareVersionStrings } from "../common";
import {
  evaluateConditionById,
  projectConditionExplanationForPlayer,
  type ConditionEvaluationContext,
  type ConditionEvaluationResult,
  type PlayerConditionExplanation,
} from "../conditions";
import {
  evaluateCharacterAvailability,
  type ScenarioParticipantId,
} from "./character-availability";
import type {
  EligibilityReason,
  ScenarioEligibilityContext,
  ScenarioEligibilityResult,
} from "./eligibility-result";

function reason(
  code: EligibilityReason["code"],
  path: readonly (string | number)[],
  developerMessage: string,
  playerMessage: string | null,
): EligibilityReason {
  return Object.freeze({
    code,
    path: Object.freeze([...path]),
    developerMessage,
    playerMessage,
  });
}

function occurrenceCount(
  scenarioId: string,
  history: ScenarioEligibilityContext["history"],
): number {
  return history.filter(
    (entry) =>
      entry.type === "choice_resolution" && entry.scenarioId === scenarioId,
  ).length;
}

function activeManifestCheck(
  scenario: ScenarioDefinition,
  context: ScenarioEligibilityContext,
  blockingReasons: EligibilityReason[],
  passedReasons: EligibilityReason[],
): void {
  const manifest = context.registry.manifest;
  if (manifest === undefined) return;
  if (manifest.releaseStatus !== "published") {
    blockingReasons.push(
      reason(
        "manifest_inactive",
        ["manifest", "releaseStatus"],
        `Manifest ${manifest.id} is ${manifest.releaseStatus}, not published.`,
        "This content set is not currently available.",
      ),
    );
  } else {
    passedReasons.push(
      reason(
        "manifest_inactive",
        ["manifest", "releaseStatus"],
        `Manifest ${manifest.id} is published.`,
        null,
      ),
    );
  }
  if (
    !manifest.includedObjectIds.some(
      (objectId) => String(objectId) === String(scenario.id),
    )
  ) {
    blockingReasons.push(
      reason(
        "manifest_excluded",
        ["manifest", "includedObjectIds"],
        `Scenario ${scenario.id} is not included by manifest ${manifest.id}.`,
        "This scenario is not included in the active content set.",
      ),
    );
  }
  if (
    manifest.withdrawnObjectIds.some(
      (objectId) => String(objectId) === String(scenario.id),
    )
  ) {
    blockingReasons.push(
      reason(
        "manifest_withdrawn",
        ["manifest", "withdrawnObjectIds"],
        `Scenario ${scenario.id} is withdrawn by manifest ${manifest.id}.`,
        "This scenario is unavailable.",
      ),
    );
  }
  if (
    compareVersionStrings(
      context.save.saveVersion,
      manifest.minimumCompatibleSaveVersion,
    ) < 0 ||
    (manifest.maximumCompatibleSaveVersion !== undefined &&
      compareVersionStrings(
        context.save.saveVersion,
        manifest.maximumCompatibleSaveVersion,
      ) > 0)
  ) {
    blockingReasons.push(
      reason(
        "save_version_mismatch",
        ["manifest", "minimumCompatibleSaveVersion"],
        `Save version ${context.save.saveVersion} is outside manifest compatibility.`,
        "This save is incompatible with the active content set.",
      ),
    );
  }
}

export function evaluateScenarioEligibility(
  scenario: ScenarioDefinition,
  context: ScenarioEligibilityContext,
): ScenarioEligibilityResult {
  const blockingReasons: EligibilityReason[] = [];
  const passedReasons: EligibilityReason[] = [];
  const conditionResults: ConditionEvaluationResult[] = [];
  const playerConditionExplanations: PlayerConditionExplanation[] = [];
  const currentPeriod = context.save.politicalPeriod;
  const periodStatus =
    currentPeriod < scenario.politicalPeriodWindow.minimum
      ? "not_yet_available"
      : currentPeriod > scenario.politicalPeriodWindow.maximum
        ? "expired"
        : "currently_available";

  if (scenario.status !== "published") {
    blockingReasons.push(
      reason(
        "inactive_lifecycle",
        ["scenarios", scenario.id, "status"],
        `Scenario lifecycle ${scenario.status} is not eligible for runtime selection.`,
        "This scenario is not currently available.",
      ),
    );
  }
  if (scenario.contentVersion !== context.save.contentVersion) {
    blockingReasons.push(
      reason(
        "content_version_mismatch",
        ["scenarios", scenario.id, "contentVersion"],
        `Scenario content version ${scenario.contentVersion} does not match save ${context.save.contentVersion}.`,
        "This scenario is incompatible with the current save.",
      ),
    );
  }
  activeManifestCheck(scenario, context, blockingReasons, passedReasons);

  if (periodStatus === "not_yet_available") {
    blockingReasons.push(
      reason(
        "not_yet_available",
        ["scenarios", scenario.id, "politicalPeriodWindow", "minimum"],
        `Current period ${currentPeriod} precedes minimum ${scenario.politicalPeriodWindow.minimum}.`,
        "This scenario is not yet available.",
      ),
    );
  } else if (periodStatus === "expired") {
    blockingReasons.push(
      reason(
        "expired",
        ["scenarios", scenario.id, "politicalPeriodWindow", "maximum"],
        `Current period ${currentPeriod} exceeds maximum ${scenario.politicalPeriodWindow.maximum}.`,
        "This scenario has expired.",
      ),
    );
  } else {
    passedReasons.push(
      reason(
        "not_yet_available",
        ["scenarios", scenario.id, "politicalPeriodWindow"],
        `Current period ${currentPeriod} is inside the authored window.`,
        null,
      ),
    );
  }

  const completedIds = new Set(
    context.history
      .filter((entry) => entry.type === "choice_resolution")
      .map((entry) => entry.scenarioId),
  );
  scenario.predecessors.forEach((predecessorId, index) => {
    if (context.registry.scenarios[predecessorId] === undefined) {
      blockingReasons.push(
        reason(
          "missing_registry_reference",
          ["scenarios", scenario.id, "predecessors", index],
          `Predecessor ${predecessorId} is missing from the registry.`,
          "Required prior content is unavailable.",
        ),
      );
    } else if (!completedIds.has(predecessorId)) {
      blockingReasons.push(
        reason(
          "missing_predecessor",
          ["scenarios", scenario.id, "predecessors", index],
          `Required predecessor ${predecessorId} is not completed.`,
          "A required prior event has not occurred.",
        ),
      );
    } else {
      passedReasons.push(
        reason(
          "missing_predecessor",
          ["scenarios", scenario.id, "predecessors", index],
          `Required predecessor ${predecessorId} is completed.`,
          null,
        ),
      );
    }
  });

  const occurrences = occurrenceCount(scenario.id, context.history);
  if (!scenario.repeatability.repeatable && occurrences > 0) {
    blockingReasons.push(
      reason(
        "resolved_non_repeatable",
        ["scenarios", scenario.id, "repeatability"],
        `Non-repeatable scenario already occurred ${occurrences} time(s).`,
        "This scenario has already been completed.",
      ),
    );
  }
  if (
    scenario.repeatability.repeatable &&
    scenario.repeatability.maximumOccurrences !== undefined &&
    occurrences >= scenario.repeatability.maximumOccurrences
  ) {
    blockingReasons.push(
      reason(
        "repeat_limit_reached",
        ["scenarios", scenario.id, "repeatability", "maximumOccurrences"],
        `Scenario occurrence limit ${scenario.repeatability.maximumOccurrences} has been reached.`,
        "This scenario cannot recur again.",
      ),
    );
  }

  const participantIds = [
    ...new Set<ScenarioParticipantId>([
      ...scenario.requiredCharacters,
      ...scenario.participants,
    ]),
  ].sort((left, right) => compareAscii(left, right));
  const characterAvailability = participantIds.map((participantId) =>
    evaluateCharacterAvailability(
      participantId,
      context.save.authoritativeState,
    ),
  );
  characterAvailability.forEach((result, index) => {
    if (!result.available) {
      blockingReasons.push(
        reason(
          "participant_unavailable",
          ["scenarios", scenario.id, "participants", index],
          result.developerExplanation,
          result.playerExplanation,
        ),
      );
    }
  });

  const conditionContext: ConditionEvaluationContext = {
    save: context.save,
    chapter: context.chapter,
    registry: context.registry,
  };
  scenario.eligibility.forEach((conditionId, index) => {
    const result = evaluateConditionById(conditionId, conditionContext);
    conditionResults.push(result);
    const player = projectConditionExplanationForPlayer(result);
    if (player !== null) playerConditionExplanations.push(player);
    if (!result.passed) {
      blockingReasons.push(
        reason(
          "condition_failed",
          ["scenarios", scenario.id, "eligibility", index],
          result.developerExplanation,
          player?.message ?? null,
        ),
      );
    }
  });
  scenario.exclusions.forEach((conditionId, index) => {
    const result = evaluateConditionById(conditionId, conditionContext);
    conditionResults.push(result);
    const player = projectConditionExplanationForPlayer(result);
    if (player !== null) playerConditionExplanations.push(player);
    if (result.passed) {
      blockingReasons.push(
        reason(
          "exclusion_satisfied",
          ["scenarios", scenario.id, "exclusions", index],
          `Exclusion ${conditionId} is satisfied.`,
          player === null ? null : "An exclusion currently applies.",
        ),
      );
    }
  });

  const playerBlockingReasons = Object.freeze(
    blockingReasons
      .map((entry) => entry.playerMessage)
      .filter((message): message is string => message !== null),
  );
  return Object.freeze({
    scenarioId: scenario.id,
    eligible: blockingReasons.length === 0,
    periodStatus,
    blockingReasons: Object.freeze(blockingReasons),
    passedReasons: Object.freeze(passedReasons),
    conditionResults: Object.freeze(conditionResults),
    playerConditionExplanations: Object.freeze(playerConditionExplanations),
    characterAvailability: Object.freeze(characterAvailability),
    playerBlockingReasons,
    occurrenceCount: occurrences,
    scenario,
  });
}
