import {
  annualGrowthBasisPointsSchema,
  clamp,
  clamp100,
  inflationBasisPointsSchema,
  moneyMinorSchema,
  normalizedScoreSchema,
  parseMoneyMinor,
  signedWeightSchema,
  unemploymentBasisPointsSchema,
} from "../../../domain";
import type { EffectDefinition } from "../../schemas/effects";
import { evaluateConditionById } from "../conditions";

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
import { mutationFailure, type MutationFailure } from "./mutation-errors";

export type EffectApplicationResult =
  | { readonly success: true; readonly applied: boolean }
  | { readonly success: false; readonly failure: MutationFailure };

function failureResult(failure: MutationFailure): EffectApplicationResult {
  return { success: false, failure };
}

function resolveNationalTarget(
  effect: Extract<
    EffectDefinition,
    {
      type:
        | "normalized_score_adjustment"
        | "basis_point_adjustment"
        | "money_minor_adjustment";
    }
  >,
  context: MutationWorkingContext,
): { readonly target: object; readonly field: string } | MutationFailure {
  const [domain, field] = effect.targetField.split(".");
  if (domain !== effect.targetDomain || field === undefined) {
    return mutationFailure(
      "invalid_target",
      `Effect ${effect.id} target path does not match its domain.`,
      ["effects", effect.id, "targetField"],
      context.originalSave,
    );
  }
  const target = context.state[effect.targetDomain];
  if (!Object.hasOwn(target, field)) {
    return mutationFailure(
      "invalid_target",
      `Effect ${effect.id} targets an unavailable state field.`,
      ["effects", effect.id, "targetField"],
      context.originalSave,
    );
  }
  return { target, field };
}

function setClampedNormalized(
  target: object,
  field: string,
  delta: number,
  effectId: string,
  context: MutationWorkingContext,
): MutationFailure | null {
  const current = Reflect.get(target, field);
  if (typeof current !== "number" || !Number.isSafeInteger(current)) {
    return mutationFailure(
      "unit_mismatch",
      `Effect ${effectId} did not resolve to an integer normalized score.`,
      ["effects", effectId, "field"],
      context.originalSave,
    );
  }
  Reflect.set(
    target,
    field,
    normalizedScoreSchema.parse(clamp100(current + delta)),
  );
  return null;
}

function applyNormalized(
  effect: Extract<EffectDefinition, { type: "normalized_score_adjustment" }>,
  context: MutationWorkingContext,
): MutationFailure | null {
  const resolved = resolveNationalTarget(effect, context);
  if ("status" in resolved) return resolved;
  return setClampedNormalized(
    resolved.target,
    resolved.field,
    effect.value,
    effect.id,
    context,
  );
}

function applyRelationshipScore(
  effect: Extract<EffectDefinition, { type: "relationship_score_adjustment" }>,
  context: MutationWorkingContext,
): MutationFailure | null {
  const relationship = Reflect.get(
    context.state.relationships,
    effect.characterId,
  );
  if (typeof relationship !== "object" || relationship === null) {
    return mutationFailure(
      "invalid_target",
      `Relationship for ${effect.characterId} is absent from runtime state.`,
      ["authoritativeState", "relationships", effect.characterId],
      context.originalSave,
    );
  }
  if (!Object.hasOwn(relationship, effect.field)) {
    return mutationFailure(
      "invalid_target",
      `Relationship ${effect.characterId} does not model optional field ${effect.field}.`,
      ["authoritativeState", "relationships", effect.characterId, effect.field],
      context.originalSave,
    );
  }
  return setClampedNormalized(
    relationship,
    effect.field,
    effect.value,
    effect.id,
    context,
  );
}

function applyFactionScore(
  effect: Extract<EffectDefinition, { type: "faction_score_adjustment" }>,
  context: MutationWorkingContext,
): MutationFailure | null {
  const faction = Reflect.get(context.state.factions, effect.factionId);
  if (typeof faction !== "object" || faction === null) {
    return mutationFailure(
      "invalid_target",
      `Faction ${effect.factionId} is absent from runtime state.`,
      ["authoritativeState", "factions", effect.factionId],
      context.originalSave,
    );
  }
  return setClampedNormalized(
    faction,
    effect.field,
    effect.value,
    effect.id,
    context,
  );
}

function applyFactionRegionalInfluence(
  effect: Extract<
    EffectDefinition,
    { type: "faction_regional_influence_adjustment" }
  >,
  context: MutationWorkingContext,
): MutationFailure | null {
  const faction = Reflect.get(context.state.factions, effect.factionId);
  if (typeof faction !== "object" || faction === null) {
    return mutationFailure(
      "invalid_target",
      `Faction ${effect.factionId} is absent from runtime state.`,
      ["authoritativeState", "factions", effect.factionId],
      context.originalSave,
    );
  }
  const influences = Reflect.get(faction, "regionalInfluence");
  if (typeof influences !== "object" || influences === null) {
    return mutationFailure(
      "invalid_target",
      `Faction ${effect.factionId} has no regional influence state.`,
      ["authoritativeState", "factions", effect.factionId, "regionalInfluence"],
      context.originalSave,
    );
  }
  return setClampedNormalized(
    influences,
    effect.regionId,
    effect.value,
    effect.id,
    context,
  );
}

function runtimeRegion(
  regionId: string,
  effectId: string,
  context: MutationWorkingContext,
): object | MutationFailure {
  const region = Reflect.get(context.state.regions, regionId);
  if (typeof region === "object" && region !== null) return region;
  return mutationFailure(
    "invalid_target",
    `Region ${regionId} is absent from runtime state.`,
    ["authoritativeState", "regions", regionId],
    context.originalSave,
  );
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((entry): entry is string => typeof entry === "string")
  );
}

function applyRegionScore(
  effect: Extract<EffectDefinition, { type: "region_score_adjustment" }>,
  context: MutationWorkingContext,
): MutationFailure | null {
  const region = runtimeRegion(effect.regionId, effect.id, context);
  if ("status" in region) return region;
  return setClampedNormalized(
    region,
    effect.field,
    effect.value,
    effect.id,
    context,
  );
}

function applyBasisPoints(
  effect: Extract<EffectDefinition, { type: "basis_point_adjustment" }>,
  context: MutationWorkingContext,
): MutationFailure | null {
  const resolved = resolveNationalTarget(effect, context);
  if ("status" in resolved) return resolved;
  const current = Reflect.get(resolved.target, resolved.field);
  if (typeof current !== "number" || !Number.isSafeInteger(current)) {
    return mutationFailure(
      "unit_mismatch",
      `Effect ${effect.id} did not resolve to integer basis points.`,
      ["effects", effect.id, "targetField"],
      context.originalSave,
    );
  }
  const adjusted = current + effect.value;
  const value =
    effect.targetField === "economy.inflationBps"
      ? inflationBasisPointsSchema.parse(clamp(adjusted, 0, 5_000))
      : effect.targetField === "economy.unemploymentBps"
        ? unemploymentBasisPointsSchema.parse(clamp(adjusted, 0, 4_000))
        : annualGrowthBasisPointsSchema.parse(clamp(adjusted, -1_000, 1_000));
  Reflect.set(resolved.target, resolved.field, value);
  return null;
}

function applyRegionBasisPoints(
  effect: Extract<EffectDefinition, { type: "region_basis_point_adjustment" }>,
  context: MutationWorkingContext,
): MutationFailure | null {
  const region = runtimeRegion(effect.regionId, effect.id, context);
  if ("status" in region) return region;
  const current = Reflect.get(region, effect.field);
  if (typeof current !== "number" || !Number.isSafeInteger(current)) {
    return mutationFailure(
      "unit_mismatch",
      `Effect ${effect.id} did not resolve to regional unemployment basis points.`,
      ["effects", effect.id, "field"],
      context.originalSave,
    );
  }
  const parsed = unemploymentBasisPointsSchema.safeParse(
    current + effect.value,
  );
  if (!parsed.success) {
    return mutationFailure(
      "invalid_target",
      `Effect ${effect.id} would move regional unemployment outside 0..4000 basis points.`,
      ["effects", effect.id, "value"],
      context.originalSave,
    );
  }
  Reflect.set(region, effect.field, parsed.data);
  return null;
}

function applyMoney(
  effect: Extract<EffectDefinition, { type: "money_minor_adjustment" }>,
  context: MutationWorkingContext,
): MutationFailure | null {
  const resolved = resolveNationalTarget(effect, context);
  if ("status" in resolved) return resolved;
  const current = Reflect.get(resolved.target, resolved.field);
  if (typeof current !== "bigint") {
    return mutationFailure(
      "unit_mismatch",
      `Effect ${effect.id} did not resolve to MoneyMinor.`,
      ["effects", effect.id, "targetField"],
      context.originalSave,
    );
  }
  const parsed = moneyMinorSchema.safeParse(
    current + parseMoneyMinor(effect.value),
  );
  if (!parsed.success) {
    return mutationFailure(
      "invalid_target",
      `Effect ${effect.id} would move MoneyMinor outside its authoritative range.`,
      ["effects", effect.id, "value"],
      context.originalSave,
    );
  }
  Reflect.set(resolved.target, resolved.field, parsed.data);
  return null;
}

function applyMemoryWeight(
  effect: Extract<EffectDefinition, { type: "memory_weight_adjustment" }>,
  context: MutationWorkingContext,
): MutationFailure | null {
  if (context.registry.memories[effect.memoryId] === undefined) {
    return mutationFailure(
      "missing_memory",
      `Memory ${effect.memoryId} is absent from the registry.`,
      ["effects", effect.id, "memoryId"],
      context.originalSave,
    );
  }
  const memory = context.state.memories.find(
    (entry) => entry.id === effect.memoryId,
  );
  if (memory === undefined) {
    return mutationFailure(
      "invalid_target",
      `Memory ${effect.memoryId} is registered but absent from runtime state.`,
      ["authoritativeState", "memories", effect.memoryId],
      context.originalSave,
    );
  }
  const current = memory[effect.field];
  memory[effect.field] = signedWeightSchema.parse(
    clamp(current + effect.value, -100, 100),
  );
  return null;
}

function applyCharacterAvailability(
  effect: Extract<EffectDefinition, { type: "update_character_availability" }>,
  context: MutationWorkingContext,
): MutationFailure | null {
  const character = Reflect.get(
    context.state.characters,
    effect.targetReference,
  );
  if (typeof character !== "object" || character === null) {
    return mutationFailure(
      "invalid_target",
      `Character ${effect.targetReference} is absent from runtime state.`,
      ["authoritativeState", "characters", effect.targetReference],
      context.originalSave,
    );
  }
  Reflect.set(character, "availability", effect.value);
  return null;
}

function applyReferenceEffect(
  effect: Extract<
    EffectDefinition,
    { type: "set_flag" | "remove_flag" | "create_memory" }
  >,
  context: MutationWorkingContext,
): MutationFailure | null {
  switch (effect.type) {
    case "set_flag":
      return addRegisteredFlag(effect.targetReference, context);
    case "remove_flag":
      return removeRegisteredFlag(effect.targetReference, context);
    case "create_memory":
      return createRegisteredMemory(effect.targetReference, context);
  }
}

function applyLawOrMeasureMembership(
  effect: Extract<EffectDefinition, { type: "law_or_measure_membership" }>,
  context: MutationWorkingContext,
): MutationFailure | null {
  if (context.registry.lawsAndMeasures[effect.lawOrMeasureId] === undefined) {
    return mutationFailure(
      "invalid_target",
      `Law or measure ${effect.lawOrMeasureId} is absent from the registry.`,
      ["effects", effect.id, "lawOrMeasureId"],
      context.originalSave,
    );
  }
  if (effect.operation === "add") {
    pushUnique(context.state.lawsAndMeasures, effect.lawOrMeasureId);
    return null;
  }
  const index = context.state.lawsAndMeasures.indexOf(effect.lawOrMeasureId);
  if (index >= 0) context.state.lawsAndMeasures.splice(index, 1);
  return null;
}

function applyRegionProjectMembership(
  effect: Extract<EffectDefinition, { type: "region_project_membership" }>,
  context: MutationWorkingContext,
): MutationFailure | null {
  if (context.registry.projects[effect.projectId] === undefined) {
    return mutationFailure(
      "invalid_target",
      `Project ${effect.projectId} is absent from the registry.`,
      ["effects", effect.id, "projectId"],
      context.originalSave,
    );
  }
  const region = runtimeRegion(effect.regionId, effect.id, context);
  if ("status" in region) return region;
  const projectIds = Reflect.get(region, "activeProjectIds");
  if (!isStringArray(projectIds)) {
    return mutationFailure(
      "invalid_target",
      `Region ${effect.regionId} has no active project collection.`,
      ["authoritativeState", "regions", effect.regionId, "activeProjectIds"],
      context.originalSave,
    );
  }
  if (effect.operation === "add") {
    pushUnique(projectIds, effect.projectId);
    return null;
  }
  const index = projectIds.indexOf(effect.projectId);
  if (index >= 0) projectIds.splice(index, 1);
  return null;
}

function applySchedulingEffect(
  effect: Extract<
    EffectDefinition,
    {
      type:
        | "schedule_delayed_effect"
        | "schedule_media_reaction"
        | "trigger_follow_up_eligibility";
    }
  >,
  context: MutationWorkingContext,
): MutationFailure | null {
  switch (effect.type) {
    case "schedule_delayed_effect":
      return scheduleRegisteredDelayedEffect(effect.targetReference, context);
    case "schedule_media_reaction":
      return scheduleRegisteredMedia(effect.targetReference, context);
    case "trigger_follow_up_eligibility":
      return scheduleRegisteredFollowUp(effect.targetReference, context);
  }
}

function applyDefinition(
  effect: EffectDefinition,
  context: MutationWorkingContext,
): MutationFailure | null {
  switch (effect.type) {
    case "normalized_score_adjustment":
      return applyNormalized(effect, context);
    case "relationship_score_adjustment":
      return applyRelationshipScore(effect, context);
    case "faction_score_adjustment":
      return applyFactionScore(effect, context);
    case "faction_regional_influence_adjustment":
      return applyFactionRegionalInfluence(effect, context);
    case "region_score_adjustment":
      return applyRegionScore(effect, context);
    case "memory_weight_adjustment":
      return applyMemoryWeight(effect, context);
    case "basis_point_adjustment":
      return applyBasisPoints(effect, context);
    case "region_basis_point_adjustment":
      return applyRegionBasisPoints(effect, context);
    case "money_minor_adjustment":
      return applyMoney(effect, context);
    case "update_character_availability":
      return applyCharacterAvailability(effect, context);
    case "set_flag":
    case "remove_flag":
    case "create_memory":
      return applyReferenceEffect(effect, context);
    case "law_or_measure_membership":
      return applyLawOrMeasureMembership(effect, context);
    case "region_project_membership":
      return applyRegionProjectMembership(effect, context);
    case "schedule_delayed_effect":
    case "schedule_media_reaction":
    case "trigger_follow_up_eligibility":
      return applySchedulingEffect(effect, context);
  }
}

export function applyEffectById(
  effectId: string,
  context: MutationWorkingContext,
): EffectApplicationResult {
  const effect = context.registry.effects[effectId];
  if (effect === undefined) {
    return failureResult(
      mutationFailure(
        "unknown_effect",
        `Effect ${effectId} is absent from the registry.`,
        ["effects", effectId],
        context.originalSave,
      ),
    );
  }
  if (
    effect.sourceScenarioId !== context.sourceScenarioId ||
    effect.sourceChoiceId !== context.sourceChoiceId
  ) {
    return failureResult(
      mutationFailure(
        "invalid_target",
        `Effect ${effectId} does not belong to the active scenario and choice.`,
        ["effects", effectId, "sourceChoiceId"],
        context.originalSave,
      ),
    );
  }
  if (context.evidence.appliedEffectIds.includes(effectId)) {
    return failureResult(
      mutationFailure(
        "invalid_target",
        `Effect ${effectId} would be applied twice in one mutation receipt.`,
        ["effects", effectId],
        context.originalSave,
      ),
    );
  }
  const save = workingSave(context);
  const conditionResults = effect.applicableConditionIds.map((conditionId) =>
    evaluateConditionById(conditionId, {
      save,
      chapter:
        context.registry.scenarios[context.sourceScenarioId]?.chapter ??
        "prologue",
      registry: context.registry,
    }),
  );
  conditionResults.forEach((result) =>
    context.evidence.conditionExplanations.push(result.developerExplanation),
  );
  if (conditionResults.some((result) => !result.passed)) {
    pushUnique(context.evidence.skippedEffectIds, effectId);
    return { success: true, applied: false };
  }
  const failure = applyDefinition(effect, context);
  if (failure !== null) return failureResult(failure);
  pushUnique(context.evidence.appliedEffectIds, effectId);
  return { success: true, applied: true };
}
