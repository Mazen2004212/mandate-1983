import {
  authoritativeSaveSchema,
  type AuthoritativeSave,
} from "../../../../domain";
import { createValidSaveFixture } from "../../../../domain/test/fixtures";
import {
  buildContentRegistry,
  type ContentRegistryBundle,
  type ContentRegistryInput,
} from "../../../registry";

export const MUTATION_SCENARIO_ID = "scenario_mutation_test";
export const MUTATION_CHOICE_ID = "choice_mutation_test";
export const MUTATION_EFFECT_ID = "effect_mutation_approval";

const PUBLISHED_METADATA = {
  status: "published",
  contentVersion: "mvp-0.1.0",
  schemaVersion: "schema-1.0.0",
  title: "Mutation contract fixture",
  summary: "Neutral test-only mutation fixture.",
  chapter: "prologue",
  politicalPeriod: 0,
  authoringOwner: "test_suite",
  createdAt: "1983-01-01T00:00:00.000Z",
  updatedAt: "1983-01-01T00:00:00.000Z",
  tags: ["test_only"],
  canonReferences: ["canon.story_bible"],
  systemReferences: ["system.systems_design"],
  relatedContentIds: [],
  ratingNotes: ["Neutral test fixture."],
  originalityStatus: "reviewed_original",
  changeNotes: ["Created for deterministic mutation tests."],
} as const;

export function mutationScenario(
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id: MUTATION_SCENARIO_ID,
    type: "scenario",
    ...PUBLISHED_METADATA,
    politicalPeriodWindow: { minimum: 0, maximum: 6 },
    category: "optional",
    priority: 1,
    urgency: 1,
    repeatability: { repeatable: false },
    location: "presidency",
    participants: ["mara_edevane"],
    requiredCharacters: ["mara_edevane"],
    knowledgeContext: ["Neutral mutation context."],
    eligibility: [],
    exclusions: [],
    predecessors: [],
    followUps: [],
    opening: "beat_mutation_test",
    beats: [
      {
        id: "beat_mutation_test",
        prose: "Neutral mutation fixture prose.",
        knowledgeRequirementIds: [],
        conditionalVariantBeatIds: [],
        memoryVariantBeatIds: [],
        choiceTransitionIds: [MUTATION_CHOICE_ID],
      },
    ],
    choices: [MUTATION_CHOICE_ID],
    resolutionNotes: "Neutral mutation resolution.",
    mediaHooks: [],
    continuityRequirements: [],
    developerNotes: ["Test-only content."],
    ...overrides,
  };
}

export function mutationChoice(
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id: MUTATION_CHOICE_ID,
    scenarioId: MUTATION_SCENARIO_ID,
    label: "Apply the neutral test choice",
    playerIntent: "Exercise the mutation contract.",
    availability: [],
    visibility: "visible",
    confirmationRequirement: "none",
    baseEffects: [MUTATION_EFFECT_ID],
    conditionalEffects: [],
    delayedEffects: [],
    memoriesCreated: [],
    flagsAdded: [],
    flagsRemoved: [],
    mediaHooks: [],
    followUpIds: [],
    costSummary: "Test-only cost summary.",
    developerExplanation: "Neutral mutation test choice.",
    ratingNotes: ["Neutral fixture."],
    ...overrides,
  };
}

const EFFECT_BASE = {
  sourceScenarioId: MUTATION_SCENARIO_ID,
  sourceChoiceId: MUTATION_CHOICE_ID,
  visibility: "developer_only",
  justification: "Neutral mutation test adjustment.",
  magnitudeClassification: "unclassified",
  applicableConditionIds: [],
} as const;

export function normalizedEffect(
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id: MUTATION_EFFECT_ID,
    ...EFFECT_BASE,
    type: "normalized_score_adjustment",
    targetDomain: "government",
    targetField: "government.publicApproval",
    operation: "adjust",
    value: 5,
    unit: "normalized_score",
    ...overrides,
  };
}

export function relationshipScoreEffect(
  id: string,
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id,
    ...EFFECT_BASE,
    type: "relationship_score_adjustment",
    characterId: "mara_edevane",
    field: "trust",
    operation: "adjust",
    value: 5,
    unit: "normalized_score",
    ...overrides,
  };
}

export function factionScoreEffect(
  id: string,
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id,
    ...EFFECT_BASE,
    type: "faction_score_adjustment",
    factionId: "civic_renewal_league",
    field: "support",
    operation: "adjust",
    value: 5,
    unit: "normalized_score",
    ...overrides,
  };
}

export function factionRegionalInfluenceEffect(
  id: string,
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id,
    ...EFFECT_BASE,
    type: "faction_regional_influence_adjustment",
    factionId: "civic_renewal_league",
    regionId: "orsanne_metropolitan_district",
    operation: "adjust",
    value: 5,
    unit: "normalized_score",
    ...overrides,
  };
}

export function regionScoreEffect(
  id: string,
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id,
    ...EFFECT_BASE,
    type: "region_score_adjustment",
    regionId: "orsanne_metropolitan_district",
    field: "approval",
    operation: "adjust",
    value: 5,
    unit: "normalized_score",
    ...overrides,
  };
}

export function regionBasisPointEffect(
  id: string,
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id,
    ...EFFECT_BASE,
    type: "region_basis_point_adjustment",
    regionId: "orsanne_metropolitan_district",
    field: "unemploymentBps",
    operation: "adjust",
    value: 25,
    unit: "basis_points",
    ...overrides,
  };
}

export function memoryWeightEffect(
  id: string,
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id,
    ...EFFECT_BASE,
    type: "memory_weight_adjustment",
    memoryId: "memory_mutation_test",
    field: "emotionalWeight",
    operation: "adjust",
    value: 5,
    unit: "signed_weight",
    ...overrides,
  };
}

export function regionProjectMembershipEffect(
  id: string,
  operation: "add" | "remove",
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id,
    ...EFFECT_BASE,
    type: "region_project_membership",
    regionId: "orsanne_metropolitan_district",
    projectId: "project_mutation_test",
    operation,
    unit: "reference",
    ...overrides,
  };
}

export function lawOrMeasureMembershipEffect(
  id: string,
  operation: "add" | "remove",
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id,
    ...EFFECT_BASE,
    type: "law_or_measure_membership",
    lawOrMeasureId: "law_mutation_test",
    operation,
    unit: "reference",
    ...overrides,
  };
}

export function basisPointEffect(
  id: string,
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id,
    ...EFFECT_BASE,
    type: "basis_point_adjustment",
    targetDomain: "economy",
    targetField: "economy.inflationBps",
    operation: "adjust",
    value: 25,
    unit: "basis_points",
    ...overrides,
  };
}

export function moneyEffect(
  id: string,
  value: string,
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id,
    ...EFFECT_BASE,
    type: "money_minor_adjustment",
    targetDomain: "economy",
    targetField: "economy.treasuryMinor",
    operation: "adjust",
    value,
    unit: "money_minor",
    ...overrides,
  };
}

export function characterAvailabilityEffect(id: string) {
  return {
    id,
    ...EFFECT_BASE,
    type: "update_character_availability",
    targetDomain: "character",
    targetReference: "mara_edevane",
    operation: "set",
    value: "unavailable",
    unit: "availability",
  };
}

export function schedulingEffect(
  id: string,
  type: string,
  targetDomain: string,
  targetReference: string,
) {
  return {
    id,
    ...EFFECT_BASE,
    type,
    targetDomain,
    targetReference,
    operation: "schedule",
    value: "referenced_definition",
    unit: "reference",
  };
}

export function normalizedCondition(
  id: string,
  expectedValue: number,
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id,
    type: "normalized_score",
    field: "government.publicApproval",
    operator: "greater_than_or_equal",
    unit: "normalized_score",
    expectedValue,
    visibility: "developer_only",
    developerFailureExplanation: "Neutral condition did not pass.",
    ...overrides,
  };
}

export function mutationMemory(
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id: "memory_mutation_test",
    subjectId: "mara_edevane",
    targetId: "president",
    sourceScenarioId: MUTATION_SCENARIO_ID,
    sourceChoiceId: MUTATION_CHOICE_ID,
    emotionalWeight: 5,
    politicalWeight: 5,
    visibility: "hidden",
    creationPeriod: 0,
    decayRatePerPeriod: 0,
    permanent: true,
    dialogueInfluenceTags: ["mutation_test"],
    eventInfluenceTags: [],
    outcomeInfluenceTags: [],
    stackingRule: "reject_duplicate",
    developerDescription: "Neutral memory fixture.",
    ...overrides,
  };
}

export function mutationFlag(
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id: "flag_mutation_test",
    description: "Neutral flag fixture.",
    visibility: "hidden",
    creationSources: [
      { scenarioId: MUTATION_SCENARIO_ID, choiceId: MUTATION_CHOICE_ID },
    ],
    removalSources: [
      { scenarioId: MUTATION_SCENARIO_ID, choiceId: MUTATION_CHOICE_ID },
    ],
    permanence: false,
    compatibilityNotes: [],
    ...overrides,
  };
}

export function delayedDefinition(
  id: string,
  effectIds: readonly string[],
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id,
    sourceScenarioId: MUTATION_SCENARIO_ID,
    sourceChoiceId: MUTATION_CHOICE_ID,
    creationPeriod: 0,
    triggerPeriod: 1,
    priority: 10,
    payload: [...effectIds],
    prerequisites: [],
    cancellationConditions: [],
    expiryConditions: [],
    idempotencyScope: "choice",
    status: "pending",
    failureBehavior: "block_advancement",
    followUpContentIds: [],
    developerExplanation: "Neutral delayed fixture.",
    ...overrides,
  };
}

export function mediaReaction(
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id: "media_mutation_test",
    type: "media_reaction",
    ...PUBLISHED_METADATA,
    sourceEventId: MUTATION_SCENARIO_ID,
    outletId: "orsanne_ledger",
    knownFacts: [MUTATION_SCENARIO_ID],
    editorialFrame: "Neutral test frame.",
    headline: "Neutral test headline",
    sentiment: 0,
    reach: 50,
    credibility: 50,
    publicationPeriod: 0,
    publicKnowledgeRequirements: [],
    leakRequirements: [],
    factionImplications: [],
    regionalImplications: [],
    relatedScenarioId: MUTATION_SCENARIO_ID,
    relatedChoiceId: MUTATION_CHOICE_ID,
    ...overrides,
  };
}

const POLICY_FIELDS = {
  title: "Neutral policy fixture",
  publicSummary: "Neutral test-only policy summary.",
  legalAuthority: "Test-only authority.",
  sponsor: "presidency",
  requiredApprovals: [],
  politicalCost: 0,
  fiscalCostMinor: "0",
  recurringCostMinor: null,
  implementationPeriod: 0,
  affectedDomains: [],
  immediateEffects: [],
  delayedEffects: [],
  factionReactions: [],
  regionalEffects: [],
  constitutionalConsiderations: "No test consideration.",
  cancellationBehavior: "Remove membership idempotently.",
  completionBehavior: "Retain membership until removal.",
  compatibilityNotes: [],
} as const;

export function mutationProject(
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    id: "project_mutation_test",
    type: "project",
    ...PUBLISHED_METADATA,
    policyType: "government_project",
    ...POLICY_FIELDS,
    ...overrides,
  };
}

export function mutationLaw(overrides: Readonly<Record<string, unknown>> = {}) {
  return {
    id: "law_mutation_test",
    type: "law_or_measure",
    ...PUBLISHED_METADATA,
    policyType: "law",
    ...POLICY_FIELDS,
    ...overrides,
  };
}

export interface MutationRegistryOptions {
  readonly scenarioOverrides?: Readonly<Record<string, unknown>>;
  readonly choiceOverrides?: Readonly<Record<string, unknown>>;
  readonly effects?: readonly unknown[];
  readonly conditions?: readonly unknown[];
  readonly delayedEffects?: readonly unknown[];
  readonly memories?: readonly unknown[];
  readonly flags?: readonly unknown[];
  readonly mediaReactions?: readonly unknown[];
  readonly additionalScenarios?: readonly unknown[];
  readonly lawsAndMeasures?: readonly unknown[];
  readonly projects?: readonly unknown[];
}

export function mutationRegistry(
  options: MutationRegistryOptions = {},
): ContentRegistryBundle {
  const input: ContentRegistryInput = {
    scenarios: [
      mutationScenario(options.scenarioOverrides),
      ...(options.additionalScenarios ?? []),
    ],
    choices: [mutationChoice(options.choiceOverrides)],
    conditions: [...(options.conditions ?? [])],
    effects: [...(options.effects ?? [normalizedEffect()])],
    delayedEffects: [...(options.delayedEffects ?? [])],
    memories: [...(options.memories ?? [])],
    flags: [...(options.flags ?? [])],
    characters: [],
    factions: [],
    regions: [],
    institutions: [],
    backgrounds: [],
    lawsAndMeasures: [...(options.lawsAndMeasures ?? [])],
    projects: [...(options.projects ?? [])],
    intelligenceAssertions: [],
    mediaReactions: [...(options.mediaReactions ?? [])],
    outcomes: [],
    epilogues: [],
  };
  const result = buildContentRegistry(input);
  if (!result.success) {
    throw new Error(
      result.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n"),
    );
  }
  return result.registry;
}

export function mutationSave(): AuthoritativeSave {
  return authoritativeSaveSchema.parse(createValidSaveFixture());
}

export function resolveInput(
  save: AuthoritativeSave = mutationSave(),
  registry: ContentRegistryBundle = mutationRegistry(),
) {
  return {
    save,
    registry,
    scenarioId: MUTATION_SCENARIO_ID,
    choiceId: MUTATION_CHOICE_ID,
    expectedRevision: save.revision,
    idempotencyKey: "mutation_request_001",
    resolvedAt: "1983-01-02T00:00:00.000Z",
  };
}

export function advanceInput(
  save: AuthoritativeSave,
  registry: ContentRegistryBundle,
) {
  return {
    save,
    registry,
    expectedRevision: save.revision,
    idempotencyKey: `period_request_${save.politicalPeriod + 1}`,
    targetPeriod: save.politicalPeriod + 1,
    advancedAt: `1983-0${save.politicalPeriod + 2}-01T00:00:00.000Z`,
  };
}
