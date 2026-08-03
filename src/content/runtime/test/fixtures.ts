import {
  authoritativeSaveSchema,
  type AuthoritativeSave,
} from "../../../domain";
import { createValidSaveFixture } from "../../../domain/test/fixtures";
import {
  buildContentRegistry,
  type ContentRegistryBundle,
  type ContentRegistryInput,
} from "../../registry";
import {
  conditionSchema,
  type ConditionDefinition,
} from "../../schemas/conditions";
import {
  scenarioSchema,
  type ScenarioDefinition,
} from "../../schemas/scenario";
import type { ContentManifest } from "../../schemas/manifest";

const PUBLISHED_METADATA = {
  status: "published",
  contentVersion: "mvp-0.1.0",
  schemaVersion: "schema-1.0.0",
  title: "Runtime test fixture",
  summary: "Neutral structural fixture used only by automated tests.",
  chapter: "prologue",
  politicalPeriod: 0,
  authoringOwner: "test_suite",
  createdAt: "1983-01-01T00:00:00.000Z",
  updatedAt: "1983-01-01T00:00:00.000Z",
  tags: ["test_only"],
  canonReferences: ["canon.story_bible"],
  systemReferences: ["system.content_architecture"],
  relatedContentIds: [],
  ratingNotes: ["Neutral test fixture."],
  originalityStatus: "reviewed_original",
  changeNotes: ["Created for deterministic runtime tests."],
} as const;

export function runtimeCondition(
  input: Record<string, unknown>,
): ConditionDefinition {
  return conditionSchema.parse({
    visibility: "developer_only",
    developerFailureExplanation: "Neutral test requirement failed.",
    ...input,
  });
}

export function runtimeScenario(
  id: string,
  overrides: Record<string, unknown> = {},
): ScenarioDefinition {
  return scenarioSchema.parse({
    id,
    type: "scenario",
    ...PUBLISHED_METADATA,
    title: `Runtime fixture ${id}`,
    politicalPeriodWindow: { minimum: 0, maximum: 6 },
    category: "optional",
    priority: 1,
    urgency: 1,
    repeatability: { repeatable: false },
    location: "presidency",
    participants: ["mara_edevane"],
    requiredCharacters: ["mara_edevane"],
    knowledgeContext: ["Neutral runtime test context."],
    eligibility: [],
    exclusions: [],
    predecessors: [],
    followUps: [],
    opening: `beat_${id}`,
    beats: [
      {
        id: `beat_${id}`,
        prose: "Neutral runtime test prose.",
        knowledgeRequirementIds: [],
        conditionalVariantBeatIds: [],
        memoryVariantBeatIds: [],
        choiceTransitionIds: [],
      },
    ],
    choices: [],
    resolutionNotes: "Neutral runtime test resolution.",
    mediaHooks: [],
    continuityRequirements: [],
    developerNotes: ["Test-only content."],
    ...overrides,
  });
}

export function runtimeRegistry(input: {
  readonly scenarios?: readonly ScenarioDefinition[];
  readonly conditions?: readonly ConditionDefinition[];
  readonly manifest?: ContentManifest;
}): ContentRegistryBundle {
  const registryInput: ContentRegistryInput = {
    scenarios: [...(input.scenarios ?? [])],
    choices: [],
    conditions: [...(input.conditions ?? [])],
    effects: [],
    delayedEffects: [],
    memories: [],
    flags: [],
    characters: [],
    factions: [],
    regions: [],
    institutions: [],
    backgrounds: [],
    lawsAndMeasures: [],
    projects: [],
    intelligenceAssertions: [],
    mediaReactions: [],
    outcomes: [],
    epilogues: [],
    ...(input.manifest === undefined ? {} : { manifest: input.manifest }),
  };
  const result = buildContentRegistry(registryInput);
  if (!result.success) {
    throw new Error(result.issues.map((issue) => issue.message).join("\n"));
  }
  return result.registry;
}

export function runtimeSave(politicalPeriod = 0): AuthoritativeSave {
  const source = createValidSaveFixture();
  return authoritativeSaveSchema.parse({
    ...source,
    politicalPeriod,
    authoritativeState: {
      ...source.authoritativeState,
      timeline: { politicalPeriod },
    },
  });
}
