import {
  canonicalCharacterIdSchema,
  delayedEffectInstancesCollide,
  delayedEffectRuntimeStateSchema,
  normalizedScoreSchema,
  politicalPeriodSchema,
  type AuthoritativeSave,
  type MemoryState,
  type RootGameState,
} from "../../../domain";
import type { ContentRegistryBundle } from "../../registry";

import { mutationFailure, type MutationFailure } from "./mutation-errors";
import type { MutableMutationEvidence } from "./mutation-result";

export interface MutationWorkingContext {
  readonly originalSave: AuthoritativeSave;
  readonly registry: ContentRegistryBundle;
  readonly sourceScenarioId: string;
  readonly sourceChoiceId: string;
  readonly sourceMutationIdempotencyKey: string;
  readonly evaluationPeriod: number;
  state: RootGameState;
  evidence: MutableMutationEvidence;
}

export function pushUnique(target: string[], value: string): boolean {
  if (target.includes(value)) return false;
  target.push(value);
  return true;
}

export function workingSave(
  context: MutationWorkingContext,
): AuthoritativeSave {
  const politicalPeriod = politicalPeriodSchema.parse(context.evaluationPeriod);
  return {
    ...context.originalSave,
    politicalPeriod,
    authoritativeState: {
      ...context.state,
      timeline: { politicalPeriod },
    },
  };
}

function characterMemoryIds(
  state: RootGameState,
  characterId: string,
): string[] | null {
  const parsed = canonicalCharacterIdSchema.safeParse(characterId);
  if (!parsed.success) return null;
  switch (parsed.data) {
    case "mara_edevane":
      return state.characters.mara_edevane.memoryIds;
    case "lucien_kest":
      return state.characters.lucien_kest.memoryIds;
    case "sabine_orrel":
      return state.characters.sabine_orrel.memoryIds;
    case "darek_voln":
      return state.characters.darek_voln.memoryIds;
    case "ilona_meret":
      return state.characters.ilona_meret.memoryIds;
    case "tomas_veyr":
      return state.characters.tomas_veyr.memoryIds;
    case "celia_rovan":
      return state.characters.celia_rovan.memoryIds;
    case "ansel_mire":
      return state.characters.ansel_mire.memoryIds;
  }
  return null;
}

function attachMemory(
  context: MutationWorkingContext,
  memory: MemoryState,
): void {
  const ids = characterMemoryIds(context.state, memory.subjectId);
  if (ids === null) {
    pushUnique(context.state.family.memoryIds, memory.id);
    return;
  }
  pushUnique(ids, memory.id);
  const relationship = Reflect.get(
    context.state.relationships,
    memory.subjectId,
  );
  if (typeof relationship !== "object" || relationship === null) return;
  const relationshipIds = Reflect.get(
    relationship,
    memory.permanent ? "permanentMemoryIds" : "temporaryMemoryIds",
  );
  if (Array.isArray(relationshipIds)) pushUnique(relationshipIds, memory.id);
}

export function createRegisteredMemory(
  memoryId: string,
  context: MutationWorkingContext,
): MutationFailure | null {
  const definition = context.registry.memories[memoryId];
  if (definition === undefined) {
    return mutationFailure(
      "missing_memory",
      `Memory ${memoryId} is absent from the registry.`,
      ["memories", memoryId],
      context.originalSave,
    );
  }
  if (
    definition.sourceScenarioId !== context.sourceScenarioId ||
    definition.sourceChoiceId !== context.sourceChoiceId
  ) {
    return mutationFailure(
      "invalid_target",
      `Memory ${memoryId} does not belong to the resolving scenario and choice.`,
      ["memories", memoryId, "sourceChoiceId"],
      context.originalSave,
    );
  }
  if (definition.creationPeriod !== context.evaluationPeriod) {
    return mutationFailure(
      "invalid_target",
      `Memory ${memoryId} creation period does not match the mutation period.`,
      ["memories", memoryId, "creationPeriod"],
      context.originalSave,
    );
  }
  const memory: MemoryState = {
    id: definition.id,
    subjectId: definition.subjectId,
    targetId: definition.targetId,
    sourceScenarioId: definition.sourceScenarioId,
    sourceChoiceId: definition.sourceChoiceId,
    emotionalWeight: definition.emotionalWeight,
    politicalWeight: definition.politicalWeight,
    visibility: definition.visibility,
    creationPeriod: definition.creationPeriod,
    decayRatePerPeriod: normalizedScoreSchema.parse(
      definition.decayRatePerPeriod,
    ),
    permanent: definition.permanent,
    dialogueInfluenceTags: [...definition.dialogueInfluenceTags],
    eventInfluenceTags: [...definition.eventInfluenceTags],
    outcomeInfluenceTags: [...definition.outcomeInfluenceTags],
  };
  const existingIndex = context.state.memories.findIndex(
    (entry) => entry.id === definition.id,
  );
  if (existingIndex >= 0 && definition.stackingRule !== "replace") {
    return mutationFailure(
      "invalid_target",
      `Memory ${memoryId} already exists and cannot be duplicated without a generated instance ID.`,
      ["authoritativeState", "memories", existingIndex],
      context.originalSave,
    );
  }
  if (existingIndex >= 0) context.state.memories[existingIndex] = memory;
  else context.state.memories.push(memory);
  attachMemory(context, memory);
  pushUnique(context.evidence.createdMemoryIds, memoryId);
  return null;
}

function sourceMatches(
  sources: readonly {
    readonly scenarioId: string;
    readonly choiceId?: string | undefined;
  }[],
  context: MutationWorkingContext,
): boolean {
  return sources.some(
    (source) =>
      source.scenarioId === context.sourceScenarioId &&
      (source.choiceId === undefined ||
        source.choiceId === context.sourceChoiceId),
  );
}

export function addRegisteredFlag(
  flagId: string,
  context: MutationWorkingContext,
): MutationFailure | null {
  const definition = context.registry.flags[flagId];
  if (definition === undefined) {
    return mutationFailure(
      "missing_flag",
      `Flag ${flagId} is absent from the registry.`,
      ["flags", flagId],
      context.originalSave,
    );
  }
  if (!sourceMatches(definition.creationSources, context)) {
    return mutationFailure(
      "invalid_target",
      `Flag ${flagId} does not permit this creation source.`,
      ["flags", flagId, "creationSources"],
      context.originalSave,
    );
  }
  if (pushUnique(context.state.flags, flagId)) {
    pushUnique(context.evidence.addedFlagIds, flagId);
  }
  return null;
}

export function removeRegisteredFlag(
  flagId: string,
  context: MutationWorkingContext,
): MutationFailure | null {
  const definition = context.registry.flags[flagId];
  if (definition === undefined) {
    return mutationFailure(
      "missing_flag",
      `Flag ${flagId} is absent from the registry.`,
      ["flags", flagId],
      context.originalSave,
    );
  }
  if (definition.permanence) {
    return mutationFailure(
      "permanent_flag_removal",
      `Permanent flag ${flagId} cannot be removed.`,
      ["flags", flagId, "permanence"],
      context.originalSave,
    );
  }
  if (!sourceMatches(definition.removalSources, context)) {
    return mutationFailure(
      "invalid_target",
      `Flag ${flagId} does not permit this removal source.`,
      ["flags", flagId, "removalSources"],
      context.originalSave,
    );
  }
  const index = context.state.flags.findIndex((entry) => entry === flagId);
  if (index >= 0) {
    context.state.flags.splice(index, 1);
    pushUnique(context.evidence.removedFlagIds, flagId);
  }
  return null;
}

export function scheduleRegisteredMedia(
  mediaId: string,
  context: MutationWorkingContext,
): MutationFailure | null {
  if (context.registry.mediaReactions[mediaId] === undefined) {
    return mutationFailure(
      "invalid_target",
      `Media reaction ${mediaId} is absent from the registry.`,
      ["mediaReactions", mediaId],
      context.originalSave,
    );
  }
  if (pushUnique(context.state.media, mediaId)) {
    pushUnique(context.evidence.scheduledMediaIds, mediaId);
  }
  return null;
}

export function scheduleRegisteredFollowUp(
  scenarioId: string,
  context: MutationWorkingContext,
): MutationFailure | null {
  if (context.registry.scenarios[scenarioId] === undefined) {
    return mutationFailure(
      "invalid_target",
      `Follow-up scenario ${scenarioId} is absent from the registry.`,
      ["scenarios", scenarioId],
      context.originalSave,
    );
  }
  pushUnique(context.state.pendingEvents, scenarioId);
  return null;
}

export function scheduleRegisteredDelayedEffect(
  delayedEffectId: string,
  context: MutationWorkingContext,
): MutationFailure | null {
  const definition = context.registry.delayedEffects[delayedEffectId];
  if (definition === undefined) {
    return mutationFailure(
      "invalid_target",
      `Delayed effect ${delayedEffectId} is absent from the registry.`,
      ["delayedEffects", delayedEffectId],
      context.originalSave,
    );
  }
  if (
    definition.sourceScenarioId !== context.sourceScenarioId ||
    definition.sourceChoiceId !== context.sourceChoiceId ||
    definition.creationPeriod !== context.evaluationPeriod
  ) {
    return mutationFailure(
      "invalid_target",
      `Delayed effect ${delayedEffectId} source or creation period does not match the mutation.`,
      ["delayedEffects", delayedEffectId, "sourceScenarioId"],
      context.originalSave,
    );
  }
  if (definition.status !== "pending") {
    return mutationFailure(
      "invalid_target",
      `Delayed effect ${delayedEffectId} must be authored as pending when scheduled.`,
      ["delayedEffects", delayedEffectId, "status"],
      context.originalSave,
    );
  }
  const triggerPeriod =
    definition.triggerPeriod ??
    definition.creationPeriod + (definition.relativeDelay ?? 0);
  const parsed = delayedEffectRuntimeStateSchema.safeParse({
    id: definition.id,
    definitionContentVersion: context.originalSave.contentVersion,
    sourceScenarioId: definition.sourceScenarioId,
    sourceChoiceId: definition.sourceChoiceId,
    sourceMutationIdempotencyKey: context.sourceMutationIdempotencyKey,
    creationPeriod: definition.creationPeriod,
    triggerPeriod,
    priority: definition.priority,
    effectIds: definition.payload,
    prerequisiteConditionIds: definition.prerequisites,
    cancellationConditionIds: definition.cancellationConditions,
    expiryConditionIds: definition.expiryConditions,
    idempotencyScope: definition.idempotencyScope,
    failureBehavior: definition.failureBehavior,
    followUpContentIds: definition.followUpContentIds,
    status: definition.status,
  });
  if (!parsed.success) {
    return mutationFailure(
      "invalid_target",
      parsed.error.issues.map((issue) => issue.message).join("; "),
      ["delayedEffects", delayedEffectId],
      context.originalSave,
    );
  }
  const collision = context.state.delayedEffects.findIndex((existing) =>
    delayedEffectInstancesCollide(existing, parsed.data),
  );
  if (collision >= 0) {
    return mutationFailure(
      "idempotency_conflict",
      `Delayed effect ${delayedEffectId} collides with queued instance ${collision}.`,
      ["authoritativeState", "delayedEffects", collision],
      context.originalSave,
    );
  }
  context.state.delayedEffects.push(structuredClone(parsed.data));
  pushUnique(context.evidence.scheduledDelayedEffectIds, delayedEffectId);
  return null;
}
