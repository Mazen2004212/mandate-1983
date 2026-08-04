import {
  authoritativeSaveSchema,
  choiceResolutionHistoryEntrySchema,
  type AuthoritativeSave,
  type ChoiceResolutionHistoryEntry,
} from "../../../domain";
import { CONTENT_SCHEMA_VERSION, CONTENT_VERSION } from "../../constants";
import type { ChoiceDefinition } from "../../schemas/scenario";
import { evaluateConditionById } from "../conditions";
import { evaluateScenarioEligibility } from "../eligibility";

import { applyEffectById } from "./apply-effect";
import {
  findHistoryByIdempotencyKey,
  matchesChoiceRequestIdentity,
} from "./history";
import { resolveChoiceInputSchema } from "./input-schemas";
import {
  addRegisteredFlag,
  createRegisteredMemory,
  pushUnique,
  removeRegisteredFlag,
  scheduleRegisteredDelayedEffect,
  scheduleRegisteredFollowUp,
  scheduleRegisteredMedia,
  workingSave,
  type MutationWorkingContext,
} from "./mutation-context";
import {
  mutationFailure,
  mutationIssuePath,
  type MutationFailure,
} from "./mutation-errors";
import {
  emptyMutationEvidence,
  evidenceFromReceipt,
  freezeMutationEvidence,
  type ChoiceResolutionResult,
} from "./mutation-result";

const SUPPORTED_SAVE_VERSION = "save-1.0.0";

function alreadyApplied(
  save: AuthoritativeSave,
  receipt: ChoiceResolutionHistoryEntry,
): ChoiceResolutionResult {
  return Object.freeze({
    status: "already_applied",
    save,
    scenarioId: receipt.scenarioId,
    choiceId: receipt.choiceId,
    previousRevision: receipt.expectedRevision,
    resultingRevision: receipt.resultingRevision,
    idempotencyKey: receipt.idempotencyKey,
    receipt,
    evidence: evidenceFromReceipt(receipt),
  });
}

function duplicateValues(values: readonly string[]): boolean {
  return new Set(values).size !== values.length;
}

function validateChoiceReferences(
  choice: ChoiceDefinition,
  context: MutationWorkingContext,
): MutationFailure | null {
  const referencedEffects = [
    ...choice.baseEffects,
    ...choice.conditionalEffects.map((conditional) => conditional.effectId),
  ];
  for (const effectId of referencedEffects) {
    if (context.registry.effects[effectId] === undefined) {
      return mutationFailure(
        "unknown_effect",
        `Choice references missing effect ${effectId}.`,
        ["choices", choice.id, "baseEffects"],
        context.originalSave,
      );
    }
  }
  for (const [collection, values] of [
    ["baseEffects", choice.baseEffects],
    ["delayedEffects", choice.delayedEffects],
    ["memoriesCreated", choice.memoriesCreated],
    ["flagsAdded", choice.flagsAdded],
    ["flagsRemoved", choice.flagsRemoved],
    ["mediaHooks", choice.mediaHooks],
    ["followUpIds", choice.followUpIds],
  ] as const) {
    if (duplicateValues(values)) {
      return mutationFailure(
        "invalid_input",
        `Choice ${choice.id} contains duplicate IDs in ${collection}.`,
        ["choices", choice.id, collection],
        context.originalSave,
      );
    }
  }
  for (const memoryId of choice.memoriesCreated) {
    if (context.registry.memories[memoryId] === undefined) {
      return mutationFailure(
        "missing_memory",
        `Choice references missing memory ${memoryId}.`,
        ["choices", choice.id, "memoriesCreated"],
        context.originalSave,
      );
    }
  }
  for (const flagId of [...choice.flagsAdded, ...choice.flagsRemoved]) {
    if (context.registry.flags[flagId] === undefined) {
      return mutationFailure(
        "missing_flag",
        `Choice references missing flag ${flagId}.`,
        ["choices", choice.id, "flagsAdded"],
        context.originalSave,
      );
    }
  }
  for (const delayedId of choice.delayedEffects) {
    if (context.registry.delayedEffects[delayedId] === undefined) {
      return mutationFailure(
        "invalid_target",
        `Choice references missing delayed effect ${delayedId}.`,
        ["choices", choice.id, "delayedEffects"],
        context.originalSave,
      );
    }
  }
  for (const mediaId of choice.mediaHooks) {
    if (context.registry.mediaReactions[mediaId] === undefined) {
      return mutationFailure(
        "invalid_target",
        `Choice references missing media reaction ${mediaId}.`,
        ["choices", choice.id, "mediaHooks"],
        context.originalSave,
      );
    }
  }
  for (const followUpId of choice.followUpIds) {
    if (context.registry.scenarios[followUpId] === undefined) {
      return mutationFailure(
        "invalid_target",
        `Choice references missing follow-up ${followUpId}.`,
        ["choices", choice.id, "followUpIds"],
        context.originalSave,
      );
    }
  }
  return null;
}

function conditionalApplies(
  choice: ChoiceDefinition,
  timing: ChoiceDefinition["conditionalEffects"][number]["evaluationTiming"],
  context: MutationWorkingContext,
): readonly ChoiceDefinition["conditionalEffects"][number][] {
  const save = workingSave(context);
  return choice.conditionalEffects.filter((conditional) => {
    if (conditional.evaluationTiming !== timing) return false;
    const required = conditional.requiredConditionIds.map((conditionId) =>
      evaluateConditionById(conditionId, {
        save,
        chapter:
          context.registry.scenarios[context.sourceScenarioId]?.chapter ??
          "prologue",
        registry: context.registry,
      }),
    );
    const excluded = conditional.excludedConditionIds.map((conditionId) =>
      evaluateConditionById(conditionId, {
        save,
        chapter:
          context.registry.scenarios[context.sourceScenarioId]?.chapter ??
          "prologue",
        registry: context.registry,
      }),
    );
    [...required, ...excluded].forEach((result) =>
      context.evidence.conditionExplanations.push(result.developerExplanation),
    );
    const applies =
      required.every((result) => result.passed) &&
      excluded.every((result) => !result.passed);
    if (!applies) {
      pushUnique(context.evidence.skippedEffectIds, conditional.effectId);
    }
    return applies;
  });
}

function applyConditionalTiming(
  choice: ChoiceDefinition,
  timing: ChoiceDefinition["conditionalEffects"][number]["evaluationTiming"],
  context: MutationWorkingContext,
): MutationFailure | null {
  for (const conditional of conditionalApplies(choice, timing, context)) {
    const result = applyEffectById(conditional.effectId, context);
    if (!result.success) return result.failure;
  }
  return null;
}

function applyEffectList(
  effectIds: readonly string[],
  context: MutationWorkingContext,
): MutationFailure | null {
  for (const effectId of effectIds) {
    const result = applyEffectById(effectId, context);
    if (!result.success) return result.failure;
  }
  return null;
}

export function resolveChoice(input: unknown): ChoiceResolutionResult {
  const envelope = resolveChoiceInputSchema.safeParse(input);
  if (!envelope.success) {
    return mutationFailure(
      "invalid_input",
      envelope.error.issues.map((issue) => issue.message).join("; "),
      mutationIssuePath(envelope.error.issues[0]?.path, []),
      null,
    );
  }
  const parsedSave = authoritativeSaveSchema.safeParse(envelope.data.save);
  if (!parsedSave.success) {
    return mutationFailure(
      "invalid_save",
      parsedSave.error.issues.map((issue) => issue.message).join("; "),
      mutationIssuePath(parsedSave.error.issues[0]?.path, ["save"]),
      null,
    );
  }
  const save = parsedSave.data;
  const existing = findHistoryByIdempotencyKey(
    save,
    envelope.data.idempotencyKey,
  );
  if (existing !== undefined) {
    if (matchesChoiceRequestIdentity(existing, envelope.data)) {
      return alreadyApplied(save, existing);
    }
    return mutationFailure(
      "idempotency_conflict",
      `Idempotency key ${envelope.data.idempotencyKey} belongs to a different persisted request identity.`,
      ["idempotencyKey"],
      save,
    );
  }
  if (envelope.data.expectedRevision !== save.revision) {
    return mutationFailure(
      "revision_conflict",
      `Expected revision ${envelope.data.expectedRevision} does not match current revision ${save.revision}.`,
      ["expectedRevision"],
      save,
    );
  }
  if (
    save.saveVersion !== SUPPORTED_SAVE_VERSION ||
    save.schemaVersion !== CONTENT_SCHEMA_VERSION ||
    save.contentVersion !== CONTENT_VERSION
  ) {
    return mutationFailure(
      "unsupported_version",
      `Save versions ${save.saveVersion}/${save.schemaVersion}/${save.contentVersion} are unsupported by this mutation engine.`,
      ["save", "saveVersion"],
      save,
    );
  }
  const scenario = envelope.data.registry.scenarios[envelope.data.scenarioId];
  if (scenario === undefined) {
    return mutationFailure(
      "missing_scenario",
      `Scenario ${envelope.data.scenarioId} is absent from the registry.`,
      ["scenarioId"],
      save,
    );
  }
  const choice = envelope.data.registry.choices[envelope.data.choiceId];
  if (choice === undefined) {
    return mutationFailure(
      "missing_choice",
      `Choice ${envelope.data.choiceId} is absent from the registry.`,
      ["choiceId"],
      save,
    );
  }
  if (
    choice.scenarioId !== scenario.id ||
    !scenario.choices.includes(choice.id)
  ) {
    return mutationFailure(
      "choice_scenario_mismatch",
      `Choice ${choice.id} does not belong to scenario ${scenario.id}.`,
      ["choiceId"],
      save,
    );
  }
  const eligibility = evaluateScenarioEligibility(scenario, {
    registry: envelope.data.registry,
    save,
    chapter: scenario.chapter ?? "prologue",
    history: save.authoritativeState.eventHistory,
  });
  if (!eligibility.eligible) {
    const duplicate = eligibility.blockingReasons.some(
      (reason) => reason.code === "resolved_non_repeatable",
    );
    return mutationFailure(
      duplicate ? "duplicate_non_repeatable_resolution" : "scenario_ineligible",
      eligibility.blockingReasons
        .map((reason) => reason.developerMessage)
        .join("; "),
      ["scenarioId"],
      save,
    );
  }
  const availability = choice.availability.map((conditionId) =>
    evaluateConditionById(conditionId, {
      save,
      chapter: scenario.chapter ?? "prologue",
      registry: envelope.data.registry,
    }),
  );
  if (
    choice.visibility === "visible_but_disabled" ||
    availability.some((result) => !result.passed)
  ) {
    return mutationFailure(
      "choice_unavailable",
      availability.map((result) => result.developerExplanation).join("; ") ||
        `Choice ${choice.id} is visibly disabled.`,
      ["choiceId"],
      save,
    );
  }

  const context: MutationWorkingContext = {
    originalSave: save,
    registry: envelope.data.registry,
    sourceScenarioId: scenario.id,
    sourceChoiceId: choice.id,
    sourceMutationIdempotencyKey: envelope.data.idempotencyKey,
    evaluationPeriod: save.politicalPeriod,
    state: structuredClone(save.authoritativeState),
    evidence: emptyMutationEvidence(),
  };
  const referenceFailure = validateChoiceReferences(choice, context);
  if (referenceFailure !== null) return referenceFailure;

  context.evidence.steps.push("Validated choice mutation preconditions.");
  for (const timing of [
    "before_base_effects",
    "after_base_effects",
    "after_relationship_updates",
  ] as const) {
    if (timing === "after_base_effects") {
      const baseFailure = applyEffectList(choice.baseEffects, context);
      if (baseFailure !== null) return baseFailure;
    }
    const failure = applyConditionalTiming(choice, timing, context);
    if (failure !== null) return failure;
  }
  for (const memoryId of choice.memoriesCreated) {
    const failure = createRegisteredMemory(memoryId, context);
    if (failure !== null) return failure;
  }
  const afterMemoryFailure = applyConditionalTiming(
    choice,
    "after_memory_creation",
    context,
  );
  if (afterMemoryFailure !== null) return afterMemoryFailure;
  for (const flagId of choice.flagsAdded) {
    const failure = addRegisteredFlag(flagId, context);
    if (failure !== null) return failure;
  }
  for (const flagId of choice.flagsRemoved) {
    const failure = removeRegisteredFlag(flagId, context);
    if (failure !== null) return failure;
  }
  for (const delayedId of choice.delayedEffects) {
    const failure = scheduleRegisteredDelayedEffect(delayedId, context);
    if (failure !== null) return failure;
  }
  for (const mediaId of choice.mediaHooks) {
    const failure = scheduleRegisteredMedia(mediaId, context);
    if (failure !== null) return failure;
  }
  for (const followUpId of choice.followUpIds) {
    const failure = scheduleRegisteredFollowUp(followUpId, context);
    if (failure !== null) return failure;
  }
  const resultingRevision = save.revision + 1;
  const receipt = choiceResolutionHistoryEntrySchema.safeParse({
    type: "choice_resolution",
    idempotencyKey: envelope.data.idempotencyKey,
    scenarioId: scenario.id,
    choiceId: choice.id,
    expectedRevision: save.revision,
    resultingRevision,
    politicalPeriod: save.politicalPeriod,
    resolvedAt: envelope.data.resolvedAt,
    appliedEffectIds: context.evidence.appliedEffectIds,
    createdMemoryIds: context.evidence.createdMemoryIds,
    addedFlagIds: context.evidence.addedFlagIds,
    removedFlagIds: context.evidence.removedFlagIds,
    scheduledDelayedEffectIds: context.evidence.scheduledDelayedEffectIds,
    scheduledMediaIds: context.evidence.scheduledMediaIds,
  });
  if (!receipt.success) {
    return mutationFailure(
      "final_validation_failure",
      receipt.error.issues.map((issue) => issue.message).join("; "),
      mutationIssuePath(receipt.error.issues[0]?.path, ["eventHistory"]),
      save,
    );
  }
  context.state.eventHistory.push(receipt.data);
  context.evidence.steps.push(
    "Appended one choice-resolution receipt and incremented revision once.",
  );
  const finalSave = authoritativeSaveSchema.safeParse({
    ...save,
    revision: resultingRevision,
    updatedAt: envelope.data.resolvedAt,
    authoritativeState: context.state,
  });
  if (!finalSave.success) {
    return mutationFailure(
      "final_validation_failure",
      finalSave.error.issues.map((issue) => issue.message).join("; "),
      mutationIssuePath(finalSave.error.issues[0]?.path, ["save"]),
      save,
    );
  }
  return Object.freeze({
    status: "applied",
    save: finalSave.data,
    scenarioId: scenario.id,
    choiceId: choice.id,
    previousRevision: save.revision,
    resultingRevision,
    idempotencyKey: envelope.data.idempotencyKey,
    receipt: receipt.data,
    evidence: freezeMutationEvidence(context.evidence),
  });
}
