import { z } from "zod";

import type { ContentManifest } from "./schemas/manifest";
import { contentManifestSchema } from "./schemas/manifest";
import {
  conditionSchema,
  type ConditionDefinition,
} from "./schemas/conditions";
import { effectSchema, type EffectDefinition } from "./schemas/effects";
import {
  characterContentSchema,
  epilogueContentSchema,
  factionContentSchema,
  institutionContentSchema,
  intelligenceAssertionContentSchema,
  lawOrMeasureContentSchema,
  mediaReactionContentSchema,
  outcomeContentSchema,
  politicalBackgroundContentSchema,
  projectContentSchema,
  regionContentSchema,
  type CharacterContent,
  type EpilogueContent,
  type FactionContent,
  type InstitutionContent,
  type IntelligenceAssertionContent,
  type LawOrMeasureContent,
  type MediaReactionContent,
  type OutcomeContent,
  type PoliticalBackgroundContent,
  type ProjectContent,
  type RegionContent,
} from "./schemas/entities";
import {
  delayedEffectDefinitionSchema,
  flagDefinitionSchema,
  memoryDefinitionSchema,
  type DelayedEffectDefinition,
  type FlagDefinition,
  type MemoryDefinition,
} from "./schemas/runtime-content";
import {
  choiceSchema,
  scenarioSchema,
  type ChoiceDefinition,
  type ScenarioDefinition,
} from "./schemas/scenario";

const inputSchema = z
  .object({
    scenarios: z.array(z.unknown()),
    choices: z.array(z.unknown()),
    conditions: z.array(z.unknown()),
    effects: z.array(z.unknown()),
    delayedEffects: z.array(z.unknown()),
    memories: z.array(z.unknown()),
    flags: z.array(z.unknown()),
    characters: z.array(z.unknown()),
    factions: z.array(z.unknown()),
    regions: z.array(z.unknown()),
    institutions: z.array(z.unknown()),
    backgrounds: z.array(z.unknown()),
    lawsAndMeasures: z.array(z.unknown()),
    projects: z.array(z.unknown()),
    intelligenceAssertions: z.array(z.unknown()),
    mediaReactions: z.array(z.unknown()),
    outcomes: z.array(z.unknown()),
    epilogues: z.array(z.unknown()),
    manifest: z.unknown().optional(),
  })
  .strict();

export type ContentRegistryInput = z.input<typeof inputSchema>;

export interface ContentValidationIssue {
  readonly severity: "blocking" | "error" | "warning" | "information";
  readonly code:
    | "schema_invalid"
    | "duplicate_id"
    | "global_id_collision"
    | "missing_reference"
    | "lifecycle_incompatible";
  readonly objectId: string | null;
  readonly path: readonly (string | number)[];
  readonly message: string;
}

export interface ContentRegistryBundle {
  readonly scenarios: Readonly<Record<string, ScenarioDefinition>>;
  readonly choices: Readonly<Record<string, ChoiceDefinition>>;
  readonly conditions: Readonly<Record<string, ConditionDefinition>>;
  readonly effects: Readonly<Record<string, EffectDefinition>>;
  readonly delayedEffects: Readonly<Record<string, DelayedEffectDefinition>>;
  readonly memories: Readonly<Record<string, MemoryDefinition>>;
  readonly flags: Readonly<Record<string, FlagDefinition>>;
  readonly characters: Readonly<Record<string, CharacterContent>>;
  readonly factions: Readonly<Record<string, FactionContent>>;
  readonly regions: Readonly<Record<string, RegionContent>>;
  readonly institutions: Readonly<Record<string, InstitutionContent>>;
  readonly backgrounds: Readonly<Record<string, PoliticalBackgroundContent>>;
  readonly lawsAndMeasures: Readonly<Record<string, LawOrMeasureContent>>;
  readonly projects: Readonly<Record<string, ProjectContent>>;
  readonly intelligenceAssertions: Readonly<
    Record<string, IntelligenceAssertionContent>
  >;
  readonly mediaReactions: Readonly<Record<string, MediaReactionContent>>;
  readonly outcomes: Readonly<Record<string, OutcomeContent>>;
  readonly epilogues: Readonly<Record<string, EpilogueContent>>;
  readonly manifest?: ContentManifest;
}

export type ContentRegistryResult =
  | { readonly success: true; readonly registry: ContentRegistryBundle }
  | {
      readonly success: false;
      readonly issues: readonly ContentValidationIssue[];
    };

type RegistryKey = Exclude<keyof ContentRegistryBundle, "manifest">;
type Identified = { readonly id: string };
const REGISTRY_KEYS = [
  "backgrounds",
  "characters",
  "choices",
  "conditions",
  "delayedEffects",
  "effects",
  "epilogues",
  "factions",
  "flags",
  "institutions",
  "intelligenceAssertions",
  "lawsAndMeasures",
  "mediaReactions",
  "memories",
  "outcomes",
  "projects",
  "regions",
  "scenarios",
] as const satisfies readonly RegistryKey[];

function normalizedPath(
  path: readonly PropertyKey[],
): readonly (string | number)[] {
  return path.map((part) => (typeof part === "symbol" ? String(part) : part));
}

const schemas: Readonly<Record<RegistryKey, z.ZodType<Identified>>> = {
  scenarios: scenarioSchema,
  choices: choiceSchema,
  conditions: conditionSchema,
  effects: effectSchema,
  delayedEffects: delayedEffectDefinitionSchema,
  memories: memoryDefinitionSchema,
  flags: flagDefinitionSchema,
  characters: characterContentSchema,
  factions: factionContentSchema,
  regions: regionContentSchema,
  institutions: institutionContentSchema,
  backgrounds: politicalBackgroundContentSchema,
  lawsAndMeasures: lawOrMeasureContentSchema,
  projects: projectContentSchema,
  intelligenceAssertions: intelligenceAssertionContentSchema,
  mediaReactions: mediaReactionContentSchema,
  outcomes: outcomeContentSchema,
  epilogues: epilogueContentSchema,
};

function candidateId(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("id" in value))
    return null;
  return typeof value.id === "string" ? value.id : null;
}

function freezeDeep(value: unknown): void {
  if (typeof value !== "object" || value === null || Object.isFrozen(value))
    return;
  Object.values(value).forEach(freezeDeep);
  Object.freeze(value);
}

function toReadonlyRecord<T extends Identified>(
  values: readonly T[],
): Readonly<Record<string, T>> {
  const record: Record<string, T> = {};
  [...values]
    .sort((left, right) => left.id.localeCompare(right.id))
    .forEach((item) => {
      freezeDeep(item);
      record[item.id] = item;
    });
  return Object.freeze(record);
}

function addReferenceIssue(
  issues: ContentValidationIssue[],
  sets: ReadonlyMap<RegistryKey, ReadonlySet<string>>,
  group: RegistryKey,
  reference: string,
  objectId: string,
  path: readonly (string | number)[],
) {
  if (!sets.get(group)?.has(reference)) {
    issues.push({
      severity: "blocking",
      code: "missing_reference",
      objectId,
      path,
      message: `Missing ${group} reference ${reference}.`,
    });
  }
}

export function buildContentRegistry(input: unknown): ContentRegistryResult {
  const parsedInput = inputSchema.safeParse(input);
  if (!parsedInput.success) {
    return {
      success: false,
      issues: parsedInput.error.issues.map((issue) => ({
        severity: "blocking",
        code: "schema_invalid",
        objectId: null,
        path: normalizedPath(issue.path),
        message: issue.message,
      })),
    };
  }
  const issues: ContentValidationIssue[] = [];
  const parsedGroups = new Map<RegistryKey, Identified[]>();
  const globalOwners = new Map<string, RegistryKey>();

  for (const group of REGISTRY_KEYS) {
    const values = parsedInput.data[group];
    const parsed: Identified[] = [];
    const localIds = new Set<string>();
    values.forEach((value, index) => {
      const result = schemas[group].safeParse(value);
      if (!result.success) {
        const objectId = candidateId(value);
        result.error.issues.forEach((issue) =>
          issues.push({
            severity: "blocking",
            code: "schema_invalid",
            objectId,
            path: [group, index, ...normalizedPath(issue.path)],
            message: issue.message,
          }),
        );
        return;
      }
      if (localIds.has(result.data.id)) {
        issues.push({
          severity: "blocking",
          code: "duplicate_id",
          objectId: result.data.id,
          path: [group, index, "id"],
          message: `Duplicate ID ${result.data.id} in ${group}.`,
        });
      } else {
        localIds.add(result.data.id);
        const owner = globalOwners.get(result.data.id);
        if (owner !== undefined) {
          issues.push({
            severity: "blocking",
            code: "global_id_collision",
            objectId: result.data.id,
            path: [group, index, "id"],
            message: `ID ${result.data.id} is already owned by ${owner}.`,
          });
        } else {
          globalOwners.set(result.data.id, group);
        }
        parsed.push(result.data);
      }
    });
    parsedGroups.set(group, parsed);
  }

  const sets = new Map<RegistryKey, ReadonlySet<string>>();
  REGISTRY_KEYS.forEach((key) => {
    sets.set(
      key,
      new Set((parsedGroups.get(key) ?? []).map((item) => item.id)),
    );
  });
  const scenarios = z
    .array(scenarioSchema)
    .parse(parsedGroups.get("scenarios") ?? []);
  const choices = z
    .array(choiceSchema)
    .parse(parsedGroups.get("choices") ?? []);
  const conditions = z
    .array(conditionSchema)
    .parse(parsedGroups.get("conditions") ?? []);
  const effects = z
    .array(effectSchema)
    .parse(parsedGroups.get("effects") ?? []);
  const delayedEffects = z
    .array(delayedEffectDefinitionSchema)
    .parse(parsedGroups.get("delayedEffects") ?? []);
  const memories = z
    .array(memoryDefinitionSchema)
    .parse(parsedGroups.get("memories") ?? []);
  const flags = z
    .array(flagDefinitionSchema)
    .parse(parsedGroups.get("flags") ?? []);
  const characters = z
    .array(characterContentSchema)
    .parse(parsedGroups.get("characters") ?? []);
  const factions = z
    .array(factionContentSchema)
    .parse(parsedGroups.get("factions") ?? []);
  const regions = z
    .array(regionContentSchema)
    .parse(parsedGroups.get("regions") ?? []);
  const institutions = z
    .array(institutionContentSchema)
    .parse(parsedGroups.get("institutions") ?? []);
  const backgrounds = z
    .array(politicalBackgroundContentSchema)
    .parse(parsedGroups.get("backgrounds") ?? []);
  const lawsAndMeasures = z
    .array(lawOrMeasureContentSchema)
    .parse(parsedGroups.get("lawsAndMeasures") ?? []);
  const projects = z
    .array(projectContentSchema)
    .parse(parsedGroups.get("projects") ?? []);
  const intelligenceAssertions = z
    .array(intelligenceAssertionContentSchema)
    .parse(parsedGroups.get("intelligenceAssertions") ?? []);
  const mediaReactions = z
    .array(mediaReactionContentSchema)
    .parse(parsedGroups.get("mediaReactions") ?? []);
  const outcomes = z
    .array(outcomeContentSchema)
    .parse(parsedGroups.get("outcomes") ?? []);
  const epilogues = z
    .array(epilogueContentSchema)
    .parse(parsedGroups.get("epilogues") ?? []);

  scenarios.forEach((scenario) => {
    scenario.choices.forEach((id, index) =>
      addReferenceIssue(issues, sets, "choices", id, scenario.id, [
        "scenarios",
        scenario.id,
        "choices",
        index,
      ]),
    );
    scenario.predecessors.forEach((id, index) =>
      addReferenceIssue(issues, sets, "scenarios", id, scenario.id, [
        "scenarios",
        scenario.id,
        "predecessors",
        index,
      ]),
    );
    scenario.followUps.forEach((id, index) =>
      addReferenceIssue(issues, sets, "scenarios", id, scenario.id, [
        "scenarios",
        scenario.id,
        "followUps",
        index,
      ]),
    );
    [...scenario.eligibility, ...scenario.exclusions].forEach((id, index) =>
      addReferenceIssue(issues, sets, "conditions", id, scenario.id, [
        "scenarios",
        scenario.id,
        "conditions",
        index,
      ]),
    );
    scenario.mediaHooks.forEach((id, index) =>
      addReferenceIssue(issues, sets, "mediaReactions", id, scenario.id, [
        "scenarios",
        scenario.id,
        "mediaHooks",
        index,
      ]),
    );
    scenario.beats.forEach((beat, beatIndex) =>
      beat.knowledgeRequirementIds.forEach((id, index) =>
        addReferenceIssue(issues, sets, "conditions", id, scenario.id, [
          "scenarios",
          scenario.id,
          "beats",
          beatIndex,
          "knowledgeRequirementIds",
          index,
        ]),
      ),
    );
  });
  choices.forEach((choice) => {
    addReferenceIssue(issues, sets, "scenarios", choice.scenarioId, choice.id, [
      "choices",
      choice.id,
      "scenarioId",
    ]);
    choice.availability.forEach((id, index) =>
      addReferenceIssue(issues, sets, "conditions", id, choice.id, [
        "choices",
        choice.id,
        "availability",
        index,
      ]),
    );
    choice.baseEffects.forEach((id, index) =>
      addReferenceIssue(issues, sets, "effects", id, choice.id, [
        "choices",
        choice.id,
        "baseEffects",
        index,
      ]),
    );
    choice.conditionalEffects.forEach((entry, index) => {
      addReferenceIssue(issues, sets, "effects", entry.effectId, choice.id, [
        "choices",
        choice.id,
        "conditionalEffects",
        index,
        "effectId",
      ]);
      [...entry.requiredConditionIds, ...entry.excludedConditionIds].forEach(
        (id) =>
          addReferenceIssue(issues, sets, "conditions", id, choice.id, [
            "choices",
            choice.id,
            "conditionalEffects",
            index,
          ]),
      );
    });
    choice.delayedEffects.forEach((id, index) =>
      addReferenceIssue(issues, sets, "delayedEffects", id, choice.id, [
        "choices",
        choice.id,
        "delayedEffects",
        index,
      ]),
    );
    choice.memoriesCreated.forEach((id, index) =>
      addReferenceIssue(issues, sets, "memories", id, choice.id, [
        "choices",
        choice.id,
        "memoriesCreated",
        index,
      ]),
    );
    [...choice.flagsAdded, ...choice.flagsRemoved].forEach((id, index) =>
      addReferenceIssue(issues, sets, "flags", id, choice.id, [
        "choices",
        choice.id,
        "flags",
        index,
      ]),
    );
    choice.mediaHooks.forEach((id, index) =>
      addReferenceIssue(issues, sets, "mediaReactions", id, choice.id, [
        "choices",
        choice.id,
        "mediaHooks",
        index,
      ]),
    );
    choice.followUpIds.forEach((id, index) =>
      addReferenceIssue(issues, sets, "scenarios", id, choice.id, [
        "choices",
        choice.id,
        "followUpIds",
        index,
      ]),
    );
  });
  conditions.forEach((condition) => {
    if (condition.type === "compound")
      condition.conditionIds.forEach((id, index) =>
        addReferenceIssue(issues, sets, "conditions", id, condition.id, [
          "conditions",
          condition.id,
          "conditionIds",
          index,
        ]),
      );
    if (condition.type === "reference") {
      const map: Partial<Record<typeof condition.referenceKind, RegistryKey>> =
        {
          flag: "flags",
          memory: "memories",
          faction: "factions",
          region: "regions",
          law_or_measure: "lawsAndMeasures",
          project: "projects",
          previous_outcome: "outcomes",
        };
      const key = map[condition.referenceKind];
      if (key !== undefined)
        addReferenceIssue(
          issues,
          sets,
          key,
          condition.referenceId,
          condition.id,
          ["conditions", condition.id, "referenceId"],
        );
    }
  });
  effects.forEach((effect) => {
    addReferenceIssue(
      issues,
      sets,
      "scenarios",
      effect.sourceScenarioId,
      effect.id,
      ["effects", effect.id, "sourceScenarioId"],
    );
    addReferenceIssue(
      issues,
      sets,
      "choices",
      effect.sourceChoiceId,
      effect.id,
      ["effects", effect.id, "sourceChoiceId"],
    );
    effect.applicableConditionIds.forEach((id, index) =>
      addReferenceIssue(issues, sets, "conditions", id, effect.id, [
        "effects",
        effect.id,
        "applicableConditionIds",
        index,
      ]),
    );
    if (effect.type === "schedule_delayed_effect")
      addReferenceIssue(
        issues,
        sets,
        "delayedEffects",
        effect.targetReference,
        effect.id,
        ["effects", effect.id, "targetReference"],
      );
    if (effect.type === "schedule_media_reaction")
      addReferenceIssue(
        issues,
        sets,
        "mediaReactions",
        effect.targetReference,
        effect.id,
        ["effects", effect.id, "targetReference"],
      );
    if (effect.type === "trigger_follow_up_eligibility")
      addReferenceIssue(
        issues,
        sets,
        "scenarios",
        effect.targetReference,
        effect.id,
        ["effects", effect.id, "targetReference"],
      );
    const referencedRegistry =
      effect.type === "set_flag" || effect.type === "remove_flag"
        ? "flags"
        : effect.type === "create_memory"
          ? "memories"
          : effect.type === "update_faction"
            ? "factions"
            : effect.type === "update_region"
              ? "regions"
              : effect.type === "update_intelligence_assertion"
                ? "intelligenceAssertions"
                : effect.type === "create_or_update_law" ||
                    effect.type === "create_or_update_measure"
                  ? "lawsAndMeasures"
                  : effect.type === "create_or_update_project"
                    ? "projects"
                    : undefined;
    if (referencedRegistry !== undefined && "targetReference" in effect)
      addReferenceIssue(
        issues,
        sets,
        referencedRegistry,
        effect.targetReference,
        effect.id,
        ["effects", effect.id, "targetReference"],
      );
  });
  delayedEffects.forEach((definition) => {
    addReferenceIssue(
      issues,
      sets,
      "scenarios",
      definition.sourceScenarioId,
      definition.id,
      ["delayedEffects", definition.id, "sourceScenarioId"],
    );
    addReferenceIssue(
      issues,
      sets,
      "choices",
      definition.sourceChoiceId,
      definition.id,
      ["delayedEffects", definition.id, "sourceChoiceId"],
    );
    definition.payload.forEach((id, index) =>
      addReferenceIssue(issues, sets, "effects", id, definition.id, [
        "delayedEffects",
        definition.id,
        "payload",
        index,
      ]),
    );
    [
      ...definition.prerequisites,
      ...definition.cancellationConditions,
      ...definition.expiryConditions,
    ].forEach((id, index) =>
      addReferenceIssue(issues, sets, "conditions", id, definition.id, [
        "delayedEffects",
        definition.id,
        "conditions",
        index,
      ]),
    );
    definition.followUpContentIds.forEach((id, index) => {
      if (!globalOwners.has(id))
        issues.push({
          severity: "blocking",
          code: "missing_reference",
          objectId: definition.id,
          path: ["delayedEffects", definition.id, "followUpContentIds", index],
          message: `Missing content reference ${id}.`,
        });
    });
  });
  memories.forEach((memory) => {
    addReferenceIssue(
      issues,
      sets,
      "scenarios",
      memory.sourceScenarioId,
      memory.id,
      ["memories", memory.id, "sourceScenarioId"],
    );
    if (memory.sourceChoiceId !== undefined)
      addReferenceIssue(
        issues,
        sets,
        "choices",
        memory.sourceChoiceId,
        memory.id,
        ["memories", memory.id, "sourceChoiceId"],
      );
  });
  flags.forEach((flag) =>
    [...flag.creationSources, ...flag.removalSources].forEach(
      (source, index) => {
        addReferenceIssue(
          issues,
          sets,
          "scenarios",
          source.scenarioId,
          flag.id,
          ["flags", flag.id, "sources", index, "scenarioId"],
        );
        if (source.choiceId !== undefined)
          addReferenceIssue(issues, sets, "choices", source.choiceId, flag.id, [
            "flags",
            flag.id,
            "sources",
            index,
            "choiceId",
          ]);
      },
    ),
  );
  mediaReactions.forEach((media) => {
    addReferenceIssue(
      issues,
      sets,
      "scenarios",
      media.relatedScenarioId,
      media.id,
      ["mediaReactions", media.id, "relatedScenarioId"],
    );
    if (media.relatedChoiceId !== undefined)
      addReferenceIssue(
        issues,
        sets,
        "choices",
        media.relatedChoiceId,
        media.id,
        ["mediaReactions", media.id, "relatedChoiceId"],
      );
    [...media.publicKnowledgeRequirements, ...media.leakRequirements].forEach(
      (id, index) =>
        addReferenceIssue(issues, sets, "conditions", id, media.id, [
          "mediaReactions",
          media.id,
          "requirements",
          index,
        ]),
    );
    if (!globalOwners.has(media.sourceEventId))
      issues.push({
        severity: "blocking",
        code: "missing_reference",
        objectId: media.id,
        path: ["mediaReactions", media.id, "sourceEventId"],
        message: `Missing source event ${media.sourceEventId}.`,
      });
  });
  outcomes.forEach((outcome) => {
    outcome.epilogueReferences.forEach((id, index) =>
      addReferenceIssue(issues, sets, "epilogues", id, outcome.id, [
        "outcomes",
        outcome.id,
        "epilogueReferences",
        index,
      ]),
    );
    outcome.eligibility.forEach((id, index) =>
      addReferenceIssue(issues, sets, "conditions", id, outcome.id, [
        "outcomes",
        outcome.id,
        "eligibility",
        index,
      ]),
    );
    [...outcome.requiredFlags, ...outcome.excludedFlags].forEach((id, index) =>
      addReferenceIssue(issues, sets, "flags", id, outcome.id, [
        "outcomes",
        outcome.id,
        "flags",
        index,
      ]),
    );
  });
  epilogues.forEach((epilogue) => {
    addReferenceIssue(
      issues,
      sets,
      "outcomes",
      epilogue.outcomeId,
      epilogue.id,
      ["epilogues", epilogue.id, "outcomeId"],
    );
    [
      ...epilogue.eligibility,
      ...epilogue.exclusions,
      ...epilogue.knowledgeRequirements,
    ].forEach((id, index) =>
      addReferenceIssue(issues, sets, "conditions", id, epilogue.id, [
        "epilogues",
        epilogue.id,
        "conditions",
        index,
      ]),
    );
  });

  [...lawsAndMeasures, ...projects].forEach((policy) => {
    [...policy.immediateEffects, ...policy.delayedEffects].forEach(
      (id, index) =>
        addReferenceIssue(issues, sets, "effects", id, policy.id, [
          policy.type,
          policy.id,
          "effects",
          index,
        ]),
    );
  });

  const metadataObjects = [
    ...scenarios,
    ...characters,
    ...factions,
    ...regions,
    ...institutions,
    ...backgrounds,
    ...lawsAndMeasures,
    ...projects,
    ...intelligenceAssertions,
    ...mediaReactions,
    ...outcomes,
    ...epilogues,
  ];
  metadataObjects.forEach((object) =>
    object.relatedContentIds.forEach((id, index) => {
      if (!globalOwners.has(id))
        issues.push({
          severity: "blocking",
          code: "missing_reference",
          objectId: object.id,
          path: [object.type, object.id, "relatedContentIds", index],
          message: `Missing related content reference ${id}.`,
        });
    }),
  );

  let manifest: ContentManifest | undefined;
  if (parsedInput.data.manifest !== undefined) {
    const result = contentManifestSchema.safeParse(parsedInput.data.manifest);
    if (!result.success)
      result.error.issues.forEach((issue) =>
        issues.push({
          severity: "blocking",
          code: "schema_invalid",
          objectId: candidateId(parsedInput.data.manifest),
          path: ["manifest", ...normalizedPath(issue.path)],
          message: issue.message,
        }),
      );
    else {
      manifest = result.data;
      [...manifest.includedObjectIds, ...manifest.withdrawnObjectIds].forEach(
        (id, index) => {
          if (!globalOwners.has(id))
            issues.push({
              severity: "blocking",
              code: "missing_reference",
              objectId: manifest?.id ?? null,
              path: ["manifest", index],
              message: `Manifest references unknown object ${id}.`,
            });
        },
      );
      if (manifest.releaseStatus === "published")
        manifest.includedObjectIds.forEach((id, index) => {
          const owner = globalOwners.get(id);
          const object =
            owner === undefined
              ? undefined
              : (parsedGroups.get(owner) ?? []).find((item) => item.id === id);
          if (
            object !== undefined &&
            "status" in object &&
            object.status !== "published" &&
            object.status !== "deprecated"
          )
            issues.push({
              severity: "blocking",
              code: "lifecycle_incompatible",
              objectId: id,
              path: ["manifest", "includedObjectIds", index],
              message: `Published manifest cannot include ${String(object.status)} object ${id}.`,
            });
          if (
            object !== undefined &&
            "contentVersion" in object &&
            object.contentVersion !== manifest?.contentVersion
          )
            issues.push({
              severity: "blocking",
              code: "lifecycle_incompatible",
              objectId: id,
              path: ["manifest", "includedObjectIds", index],
              message: `Object ${id} has an incompatible content version.`,
            });
        });
    }
  }

  if (issues.length > 0)
    return { success: false, issues: Object.freeze(issues) };
  const registryWithoutManifest: ContentRegistryBundle = {
    scenarios: toReadonlyRecord(scenarios),
    choices: toReadonlyRecord(choices),
    conditions: toReadonlyRecord(conditions),
    effects: toReadonlyRecord(effects),
    delayedEffects: toReadonlyRecord(delayedEffects),
    memories: toReadonlyRecord(memories),
    flags: toReadonlyRecord(flags),
    characters: toReadonlyRecord(characters),
    factions: toReadonlyRecord(factions),
    regions: toReadonlyRecord(regions),
    institutions: toReadonlyRecord(institutions),
    backgrounds: toReadonlyRecord(backgrounds),
    lawsAndMeasures: toReadonlyRecord(lawsAndMeasures),
    projects: toReadonlyRecord(projects),
    intelligenceAssertions: toReadonlyRecord(intelligenceAssertions),
    mediaReactions: toReadonlyRecord(mediaReactions),
    outcomes: toReadonlyRecord(outcomes),
    epilogues: toReadonlyRecord(epilogues),
  };
  if (manifest === undefined) {
    freezeDeep(registryWithoutManifest);
    return { success: true, registry: registryWithoutManifest };
  }
  const registryWithManifest: ContentRegistryBundle = {
    ...registryWithoutManifest,
    manifest,
  };
  freezeDeep(registryWithManifest);
  return {
    success: true,
    registry: registryWithManifest,
  };
}
