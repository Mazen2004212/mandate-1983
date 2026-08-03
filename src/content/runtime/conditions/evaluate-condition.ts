import {
  CANONICAL_INTERNATIONAL_ENTITY_IDS,
  FAMILY_ROLE_IDS,
  parseMoneyMinor,
  type RootGameState,
} from "../../../domain";
import type { ConditionDefinition } from "../../schemas/conditions";
import {
  readBasisPointStateField,
  readMoneyStateField,
  readNormalizedStateField,
} from "./state-accessors";
import {
  isConditionDefinition,
  type ConditionEvaluationContext,
  type ConditionEvaluationResult,
  type ConditionFailureCode,
  type ConditionValue,
} from "./condition-result";

type NumericOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "greater_than_or_equal"
  | "less_than"
  | "less_than_or_equal"
  | "within_range";

interface EvaluationParts {
  readonly passed: boolean;
  readonly actualValue: ConditionValue | null;
  readonly expectedValue: ConditionValue | null;
  readonly targetReference: string | null;
  readonly failureCode?: ConditionFailureCode;
  readonly children?: readonly ConditionEvaluationResult[];
}

interface ReferenceResolution {
  readonly actualValue: string | readonly string[] | null;
  readonly exists: boolean;
}

function freezeResult(
  condition: ConditionDefinition,
  parts: EvaluationParts,
): ConditionEvaluationResult {
  const children = Object.freeze([...(parts.children ?? [])]);
  const failureCode = parts.passed
    ? null
    : (parts.failureCode ?? "condition_failed");
  const developerExplanation = parts.passed
    ? `Condition ${condition.id} passed.`
    : `${condition.developerFailureExplanation} [${failureCode}]`;
  return Object.freeze({
    conditionId: condition.id,
    conditionType: condition.type,
    operator: condition.operator,
    passed: parts.passed,
    visibility: condition.visibility,
    targetReference: parts.targetReference,
    expectedValue: parts.expectedValue,
    actualValue: parts.actualValue,
    failureCode,
    developerExplanation,
    children,
  });
}

function missingConditionResult(
  conditionId: string,
): ConditionEvaluationResult {
  return Object.freeze({
    conditionId,
    conditionType: "missing",
    operator: "missing",
    passed: false,
    visibility: "developer_only",
    targetReference: null,
    expectedValue: null,
    actualValue: null,
    failureCode: "missing_condition",
    developerExplanation: `Condition ${conditionId} is missing from the validated registry.`,
    children: Object.freeze([]),
  });
}

function cyclicConditionResult(
  condition: ConditionDefinition,
): ConditionEvaluationResult {
  return freezeResult(condition, {
    passed: false,
    actualValue: null,
    expectedValue: null,
    targetReference: condition.id,
    failureCode: "cyclic_condition",
  });
}

function compareNumeric(
  actual: number | bigint,
  operator: NumericOperator,
  expected: number | bigint | undefined,
  range:
    | Readonly<{ minimum: number | bigint; maximum: number | bigint }>
    | undefined,
): boolean {
  if (operator === "within_range") {
    return (
      range !== undefined && actual >= range.minimum && actual <= range.maximum
    );
  }
  if (expected === undefined) return false;
  switch (operator) {
    case "equals":
      return actual === expected;
    case "not_equals":
      return actual !== expected;
    case "greater_than":
      return actual > expected;
    case "greater_than_or_equal":
      return actual >= expected;
    case "less_than":
      return actual < expected;
    case "less_than_or_equal":
      return actual <= expected;
  }
}

function numericParts(
  actual: number | bigint | undefined,
  operator: NumericOperator,
  expected: number | bigint | undefined,
  range:
    | Readonly<{ minimum: number | bigint; maximum: number | bigint }>
    | undefined,
  targetReference: string,
): EvaluationParts {
  const expectedValue =
    operator === "within_range"
      ? range === undefined
        ? null
        : Object.freeze([String(range.minimum), String(range.maximum)])
      : (expected ?? null);
  if (actual === undefined) {
    return {
      passed: false,
      actualValue: null,
      expectedValue,
      targetReference,
      failureCode: "missing_target",
    };
  }
  return {
    passed: compareNumeric(actual, operator, expected, range),
    actualValue: actual,
    expectedValue,
    targetReference,
  };
}

function allMemoryIds(state: RootGameState): readonly string[] {
  return state.memories.map((memory) => memory.id);
}

function allProjectIds(state: RootGameState): readonly string[] {
  return Object.values(state.regions).flatMap(
    (region) => region.activeProjectIds,
  );
}

function resolveReference(
  condition: Extract<ConditionDefinition, { type: "reference" }>,
  state: RootGameState,
): ReferenceResolution {
  const referenceId = String(condition.referenceId);
  switch (condition.referenceKind) {
    case "flag": {
      const actualValue = state.flags.map(String);
      return { actualValue, exists: actualValue.includes(referenceId) };
    }
    case "memory": {
      const actualValue = allMemoryIds(state);
      return { actualValue, exists: actualValue.includes(referenceId) };
    }
    case "relationship":
      return {
        actualValue: referenceId in state.relationships ? referenceId : null,
        exists: referenceId in state.relationships,
      };
    case "faction":
      return {
        actualValue: referenceId in state.factions ? referenceId : null,
        exists: referenceId in state.factions,
      };
    case "region":
      return {
        actualValue: referenceId in state.regions ? referenceId : null,
        exists: referenceId in state.regions,
      };
    case "law_or_measure": {
      const actualValue = state.lawsAndMeasures.map(String);
      return { actualValue, exists: actualValue.includes(referenceId) };
    }
    case "project": {
      const actualValue = allProjectIds(state);
      return { actualValue, exists: actualValue.includes(referenceId) };
    }
    case "previous_outcome": {
      const actualValue = state.outcomeState.selectedOutcomeId ?? null;
      return { actualValue, exists: actualValue === referenceId };
    }
    case "character_availability": {
      const character = Object.entries(state.characters).find(
        ([characterId]) => characterId === referenceId,
      )?.[1];
      return {
        actualValue: character?.availability ?? null,
        exists: character !== undefined,
      };
    }
    case "international": {
      const exists = CANONICAL_INTERNATIONAL_ENTITY_IDS.some(
        (entityId) => entityId === referenceId,
      );
      return { actualValue: exists ? referenceId : null, exists };
    }
    case "family": {
      const exists = FAMILY_ROLE_IDS.some((roleId) => roleId === referenceId);
      return { actualValue: exists ? referenceId : null, exists };
    }
  }
}

function evaluateReference(
  condition: Extract<ConditionDefinition, { type: "reference" }>,
  state: RootGameState,
): EvaluationParts {
  const resolution = resolveReference(condition, state);
  const expected = condition.expectedValue;
  let passed: boolean;
  switch (condition.operator) {
    case "exists":
      passed = resolution.exists;
      break;
    case "does_not_exist":
      passed = !resolution.exists;
      break;
    case "equals":
      passed =
        resolution.exists &&
        (Array.isArray(resolution.actualValue)
          ? false
          : resolution.actualValue === expected);
      break;
    case "not_equals":
      passed =
        !resolution.exists ||
        (Array.isArray(resolution.actualValue)
          ? true
          : resolution.actualValue !== expected);
      break;
    case "contains":
      passed =
        expected !== undefined &&
        Array.isArray(resolution.actualValue) &&
        resolution.actualValue.includes(String(expected));
      break;
    case "does_not_contain":
      passed =
        expected !== undefined &&
        Array.isArray(resolution.actualValue) &&
        !resolution.actualValue.includes(String(expected));
      break;
  }
  return {
    passed,
    actualValue: resolution.actualValue,
    expectedValue: expected ?? null,
    targetReference: `${condition.referenceKind}:${condition.referenceId}`,
    ...(!resolution.exists && condition.operator !== "does_not_exist"
      ? { failureCode: "missing_target" as const }
      : {}),
  };
}

function evaluateCompound(
  condition: Extract<ConditionDefinition, { type: "compound" }>,
  context: ConditionEvaluationContext,
  activeIds: ReadonlySet<string>,
): EvaluationParts {
  const nextActiveIds = new Set(activeIds);
  nextActiveIds.add(condition.id);
  const children = condition.conditionIds.map((conditionId) =>
    evaluateConditionIdInternal(conditionId, context, nextActiveIds),
  );
  const passed =
    condition.operator === "all"
      ? children.every((child) => child.passed)
      : condition.operator === "any"
        ? children.some((child) => child.passed)
        : children.every((child) => !child.passed);
  return {
    passed,
    actualValue: null,
    expectedValue: null,
    targetReference: null,
    children,
  };
}

function evaluateDefinition(
  condition: ConditionDefinition,
  context: ConditionEvaluationContext,
  activeIds: ReadonlySet<string>,
): ConditionEvaluationResult {
  const state = context.save.authoritativeState;
  switch (condition.type) {
    case "normalized_score": {
      const actual = readNormalizedStateField(state, condition.field);
      return freezeResult(
        condition,
        numericParts(
          actual,
          condition.operator,
          condition.expectedValue,
          condition.range,
          condition.field,
        ),
      );
    }
    case "basis_points": {
      const actual = readBasisPointStateField(state, condition.field);
      return freezeResult(
        condition,
        numericParts(
          actual,
          condition.operator,
          condition.expectedValue,
          condition.range,
          condition.field,
        ),
      );
    }
    case "money_minor": {
      const actual = readMoneyStateField(state, condition.field);
      const expected =
        condition.expectedValue === undefined
          ? undefined
          : parseMoneyMinor(condition.expectedValue);
      const range =
        condition.range === undefined
          ? undefined
          : {
              minimum: parseMoneyMinor(condition.range.minimum),
              maximum: parseMoneyMinor(condition.range.maximum),
            };
      return freezeResult(
        condition,
        numericParts(
          actual,
          condition.operator,
          expected,
          range,
          condition.field,
        ),
      );
    }
    case "political_period":
      return freezeResult(
        condition,
        numericParts(
          context.save.politicalPeriod,
          condition.operator,
          condition.expectedValue,
          condition.range,
          "timeline.politicalPeriod",
        ),
      );
    case "relationship_score": {
      const relationship = Object.entries(state.relationships).find(
        ([characterId]) => characterId === condition.characterId,
      )?.[1];
      if (relationship === undefined) {
        return freezeResult(
          condition,
          numericParts(
            undefined,
            condition.operator,
            condition.expectedValue,
            condition.range,
            `relationships.${condition.characterId}.${condition.field}`,
          ),
        );
      }
      const actual = relationship[condition.field];
      return freezeResult(
        condition,
        numericParts(
          actual,
          condition.operator,
          condition.expectedValue,
          condition.range,
          `relationships.${condition.characterId}.${condition.field}`,
        ),
      );
    }
    case "faction_score": {
      const faction = Object.entries(state.factions).find(
        ([factionId]) => factionId === condition.factionId,
      )?.[1];
      const actual = faction?.[condition.field];
      return freezeResult(
        condition,
        numericParts(
          actual,
          condition.operator,
          condition.expectedValue,
          condition.range,
          `factions.${condition.factionId}.${condition.field}`,
        ),
      );
    }
    case "faction_regional_influence": {
      const faction = Object.entries(state.factions).find(
        ([factionId]) => factionId === condition.factionId,
      )?.[1];
      const actual = Object.entries(faction?.regionalInfluence ?? {}).find(
        ([regionId]) => regionId === condition.regionId,
      )?.[1];
      return freezeResult(
        condition,
        numericParts(
          actual,
          condition.operator,
          condition.expectedValue,
          condition.range,
          `factions.${condition.factionId}.regionalInfluence.${condition.regionId}`,
        ),
      );
    }
    case "region_score": {
      const region = Object.entries(state.regions).find(
        ([regionId]) => regionId === condition.regionId,
      )?.[1];
      const actual = region?.[condition.field];
      return freezeResult(
        condition,
        numericParts(
          actual,
          condition.operator,
          condition.expectedValue,
          condition.range,
          `regions.${condition.regionId}.${condition.field}`,
        ),
      );
    }
    case "region_basis_points": {
      const region = Object.entries(state.regions).find(
        ([regionId]) => regionId === condition.regionId,
      )?.[1];
      const actual = region?.unemploymentBps;
      return freezeResult(
        condition,
        numericParts(
          actual,
          condition.operator,
          condition.expectedValue,
          condition.range,
          `regions.${condition.regionId}.unemploymentBps`,
        ),
      );
    }
    case "background": {
      const actual = state.identity.selectedBackground;
      const passed =
        condition.operator === "equals"
          ? actual === condition.expectedValue
          : actual !== condition.expectedValue;
      return freezeResult(condition, {
        passed,
        actualValue: actual,
        expectedValue: condition.expectedValue,
        targetReference: "identity.selectedBackground",
      });
    }
    case "chapter": {
      const passed =
        condition.operator === "equals"
          ? context.chapter === condition.expectedValue
          : context.chapter !== condition.expectedValue;
      return freezeResult(condition, {
        passed,
        actualValue: context.chapter,
        expectedValue: condition.expectedValue,
        targetReference: "chapter",
      });
    }
    case "content_version":
    case "save_version": {
      const actual =
        condition.type === "content_version"
          ? context.save.contentVersion
          : context.save.saveVersion;
      const passed =
        condition.operator === "equals"
          ? actual === condition.expectedValue
          : actual !== condition.expectedValue;
      return freezeResult(condition, {
        passed,
        actualValue: actual,
        expectedValue: condition.expectedValue,
        targetReference: condition.type,
      });
    }
    case "reference":
      return freezeResult(condition, evaluateReference(condition, state));
    case "compound":
      return freezeResult(
        condition,
        evaluateCompound(condition, context, activeIds),
      );
  }
}

function evaluateConditionIdInternal(
  conditionId: string,
  context: ConditionEvaluationContext,
  activeIds: ReadonlySet<string>,
): ConditionEvaluationResult {
  const condition = context.registry.conditions[conditionId];
  if (!isConditionDefinition(condition))
    return missingConditionResult(conditionId);
  if (activeIds.has(conditionId)) return cyclicConditionResult(condition);
  return evaluateDefinition(condition, context, activeIds);
}

export function evaluateCondition(
  condition: ConditionDefinition,
  context: ConditionEvaluationContext,
): ConditionEvaluationResult {
  return evaluateDefinition(condition, context, new Set());
}

export function evaluateConditionById(
  conditionId: string,
  context: ConditionEvaluationContext,
): ConditionEvaluationResult {
  return evaluateConditionIdInternal(conditionId, context, new Set());
}
