import { z } from "zod";

import { canonicalCharacterIdSchema, familyRoleIdSchema } from "../../domain";
import { CHOICE_VISIBILITIES, SCENARIO_CATEGORIES } from "../constants";
import {
  beatIdSchema,
  choiceContentIdSchema,
  conditionContentIdSchema,
  contentObjectIdSchema,
  delayedEffectContentIdSchema,
  effectContentIdSchema,
  flagContentIdSchema,
  mediaContentIdSchema,
  memoryContentIdSchema,
  scenarioContentIdSchema,
} from "../ids";
import {
  boundedText,
  commonMetadataFields,
  politicalPeriodWindowSchema,
  validateCommonMetadata,
} from "./common";
import { conditionalEffectSchema } from "./effects";

export const participantIdSchema = z.union([
  canonicalCharacterIdSchema,
  familyRoleIdSchema,
]);

export const scenarioBeatSchema = z
  .object({
    id: beatIdSchema,
    speaker: participantIdSchema.optional(),
    addressee: participantIdSchema.optional(),
    prose: boundedText(1, 4_000),
    stageDirection: boundedText(1, 400).optional(),
    portraitReference: contentObjectIdSchema.optional(),
    expressionReference: contentObjectIdSchema.optional(),
    location: contentObjectIdSchema.optional(),
    knowledgeRequirementIds: z.array(conditionContentIdSchema),
    conditionalVariantBeatIds: z.array(beatIdSchema),
    memoryVariantBeatIds: z.array(beatIdSchema),
    acknowledgment: boundedText(1, 400).optional(),
    nextBeatId: beatIdSchema.optional(),
    choiceTransitionIds: z.array(choiceContentIdSchema),
  })
  .strict();

export const choiceSchema = z
  .object({
    id: choiceContentIdSchema,
    scenarioId: scenarioContentIdSchema,
    label: boundedText(1, 240),
    playerIntent: boundedText(1, 400),
    availability: z.array(conditionContentIdSchema),
    visibility: z.enum(CHOICE_VISIBILITIES),
    disabledReason: boundedText(1, 240).optional(),
    confirmationRequirement: z.enum(["none", "confirm"]),
    baseEffects: z.array(effectContentIdSchema),
    conditionalEffects: z.array(conditionalEffectSchema),
    delayedEffects: z.array(delayedEffectContentIdSchema),
    memoriesCreated: z.array(memoryContentIdSchema),
    flagsAdded: z.array(flagContentIdSchema),
    flagsRemoved: z.array(flagContentIdSchema),
    mediaHooks: z.array(mediaContentIdSchema),
    followUpIds: z.array(scenarioContentIdSchema),
    costSummary: boundedText(1, 400),
    developerExplanation: boundedText(1, 600),
    ratingNotes: z.array(boundedText(1, 240)),
  })
  .strict()
  .superRefine((choice, context) => {
    if (
      choice.visibility === "visible_but_disabled" &&
      choice.disabledReason === undefined
    ) {
      context.addIssue({
        code: "custom",
        path: ["disabledReason"],
        message: "A visibly disabled choice requires a safe reason.",
      });
    }
    if (
      choice.visibility !== "visible_but_disabled" &&
      choice.disabledReason !== undefined
    ) {
      context.addIssue({
        code: "custom",
        path: ["disabledReason"],
        message:
          "Only visible_but_disabled choices may define a disabled reason.",
      });
    }
  });

export const scenarioSchema = z
  .object({
    id: scenarioContentIdSchema,
    type: z.literal("scenario"),
    ...commonMetadataFields,
    politicalPeriodWindow: politicalPeriodWindowSchema,
    category: z.enum(SCENARIO_CATEGORIES),
    priority: z.number().int().min(0).max(10_000),
    urgency: z.number().int().min(0).max(10_000),
    repeatability: z
      .object({
        repeatable: z.boolean(),
        maximumOccurrences: z.number().int().positive().optional(),
      })
      .strict(),
    location: contentObjectIdSchema,
    participants: z.array(participantIdSchema),
    requiredCharacters: z.array(participantIdSchema),
    knowledgeContext: z.array(boundedText(1, 400)),
    eligibility: z.array(conditionContentIdSchema),
    exclusions: z.array(conditionContentIdSchema),
    predecessors: z.array(scenarioContentIdSchema),
    followUps: z.array(scenarioContentIdSchema),
    opening: beatIdSchema,
    beats: z.array(scenarioBeatSchema).min(1),
    choices: z.array(choiceContentIdSchema),
    resolutionNotes: boundedText(1, 1_200),
    mediaHooks: z.array(mediaContentIdSchema),
    continuityRequirements: z.array(boundedText(1, 400)),
    developerNotes: z.array(boundedText(1, 600)),
  })
  .strict()
  .superRefine((scenario, context) => {
    validateCommonMetadata(scenario, context);
    for (const [field, references] of [
      ["predecessors", scenario.predecessors],
      ["followUps", scenario.followUps],
    ] as const) {
      if (references.includes(scenario.id)) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: `A scenario cannot reference itself in ${field}.`,
        });
      }
    }
    if (
      !scenario.repeatability.repeatable &&
      scenario.repeatability.maximumOccurrences !== undefined
    ) {
      context.addIssue({
        code: "custom",
        path: ["repeatability", "maximumOccurrences"],
        message: "A non-repeatable scenario cannot define maximumOccurrences.",
      });
    }
    const beatIds = new Set<string>();
    scenario.beats.forEach((beat, index) => {
      if (beatIds.has(beat.id)) {
        context.addIssue({
          code: "custom",
          path: ["beats", index, "id"],
          message: `Duplicate beat ID ${beat.id}.`,
        });
      }
      beatIds.add(beat.id);
    });
    if (!beatIds.has(scenario.opening)) {
      context.addIssue({
        code: "custom",
        path: ["opening"],
        message: "Opening beat must exist inside the scenario.",
      });
    }
    scenario.beats.forEach((beat, index) => {
      const references = [
        ...(beat.nextBeatId === undefined ? [] : [beat.nextBeatId]),
        ...beat.conditionalVariantBeatIds,
        ...beat.memoryVariantBeatIds,
      ];
      references.forEach((reference) => {
        if (!beatIds.has(reference)) {
          context.addIssue({
            code: "custom",
            path: ["beats", index],
            message: `Beat reference ${reference} does not exist in this scenario.`,
          });
        }
      });
      beat.choiceTransitionIds.forEach((choiceId) => {
        if (!scenario.choices.includes(choiceId)) {
          context.addIssue({
            code: "custom",
            path: ["beats", index, "choiceTransitionIds"],
            message: `Beat choice transition ${choiceId} is not declared by this scenario.`,
          });
        }
      });
    });
  });

export type ScenarioBeat = z.infer<typeof scenarioBeatSchema>;
export type ChoiceDefinition = z.infer<typeof choiceSchema>;
export type ScenarioDefinition = z.infer<typeof scenarioSchema>;
