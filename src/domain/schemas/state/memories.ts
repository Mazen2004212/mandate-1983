import { z } from "zod";

import {
  authoredIdSchema,
  canonicalCharacterIdSchema,
  choiceIdSchema,
  familyRoleIdSchema,
  memoryIdSchema,
  scenarioIdSchema,
} from "../../ids/identifier-schemas";
import { stateVisibilitySchema } from "../common/classifications";
import {
  normalizedScoreSchema,
  politicalPeriodSchema,
  signedWeightSchema,
} from "../common/numeric";

export const memoryActorIdSchema = z.union([
  canonicalCharacterIdSchema,
  familyRoleIdSchema,
]);

export const memoryStateSchema = z
  .object({
    id: memoryIdSchema,
    subjectId: memoryActorIdSchema,
    targetId: memoryActorIdSchema,
    sourceScenarioId: scenarioIdSchema,
    sourceChoiceId: choiceIdSchema,
    emotionalWeight: signedWeightSchema,
    politicalWeight: signedWeightSchema,
    visibility: stateVisibilitySchema,
    creationPeriod: politicalPeriodSchema,
    decayRatePerPeriod: normalizedScoreSchema,
    permanent: z.boolean(),
    dialogueInfluenceTags: z.array(authoredIdSchema),
    eventInfluenceTags: z.array(authoredIdSchema),
    outcomeInfluenceTags: z.array(authoredIdSchema),
  })
  .strict()
  .superRefine((memory, context) => {
    if (memory.permanent && memory.decayRatePerPeriod !== 0) {
      context.addIssue({
        code: "custom",
        path: ["decayRatePerPeriod"],
        message: "Permanent memories cannot decay.",
      });
    }
  });

export const memoriesStateSchema = z.array(memoryStateSchema);

export type MemoryState = z.infer<typeof memoryStateSchema>;
export type MemoriesState = z.infer<typeof memoriesStateSchema>;
