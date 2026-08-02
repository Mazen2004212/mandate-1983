import { z } from "zod";

import { saveIdSchema, userIdSchema } from "../../ids/identifier-schemas";
import { politicalBackgroundIdSchema } from "../common/classifications";
import {
  familyIdentitySchema,
  familyNameSchema,
} from "../common/family-identity";
import {
  politicalPeriodSchema,
  revisionSchema,
  seedValueSchema,
} from "../common/numeric";
import { utcTimestampSchema } from "../common/timestamp";
import {
  contentVersionSchema,
  saveVersionSchema,
  schemaVersionSchema,
} from "../common/versions";
import { rootGameStateSchema } from "../state/root-state";

export const authoritativeSaveSchema = z
  .object({
    saveId: saveIdSchema,
    ownerId: userIdSchema,
    saveVersion: saveVersionSchema,
    contentVersion: contentVersionSchema,
    schemaVersion: schemaVersionSchema,
    revision: revisionSchema,
    gameSeed: seedValueSchema,
    politicalPeriod: politicalPeriodSchema,
    createdAt: utcTimestampSchema,
    updatedAt: utcTimestampSchema,
    selectedBackground: politicalBackgroundIdSchema,
    familyIdentity: familyIdentitySchema,
    authoritativeState: rootGameStateSchema,
  })
  .strict()
  .superRefine((save, context) => {
    if (save.updatedAt < save.createdAt) {
      context.addIssue({
        code: "custom",
        path: ["updatedAt"],
        message: "A save cannot be updated before it is created.",
      });
    }
    if (
      save.politicalPeriod !== save.authoritativeState.timeline.politicalPeriod
    ) {
      context.addIssue({
        code: "custom",
        path: ["politicalPeriod"],
        message: "Indexed political period must match authoritative state.",
      });
    }
    if (
      save.selectedBackground !==
      save.authoritativeState.identity.selectedBackground
    ) {
      context.addIssue({
        code: "custom",
        path: ["selectedBackground"],
        message: "Indexed background must match authoritative state.",
      });
    }
    if (
      JSON.stringify(save.familyIdentity) !==
      JSON.stringify(save.authoritativeState.identity.familyIdentity)
    ) {
      context.addIssue({
        code: "custom",
        path: ["familyIdentity"],
        message: "Indexed family identity must match authoritative state.",
      });
    }
  });

export const publicSaveSummarySchema = z
  .object({
    saveId: saveIdSchema,
    saveVersion: saveVersionSchema,
    contentVersion: contentVersionSchema,
    schemaVersion: schemaVersionSchema,
    revision: revisionSchema,
    politicalPeriod: politicalPeriodSchema,
    selectedBackground: politicalBackgroundIdSchema,
    presidentDisplayName: familyNameSchema,
    createdAt: utcTimestampSchema,
    updatedAt: utcTimestampSchema,
  })
  .strict();

export type AuthoritativeSave = z.infer<typeof authoritativeSaveSchema>;
export type PublicSaveSummary = z.infer<typeof publicSaveSummarySchema>;
