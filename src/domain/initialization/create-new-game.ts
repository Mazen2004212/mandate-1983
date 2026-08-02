import { z } from "zod";

import { INITIAL_CONTENT_VERSION } from "../constants/classifications";
import { saveIdSchema, userIdSchema } from "../ids/identifier-schemas";
import { politicalBackgroundIdSchema } from "../schemas/common/classifications";
import { familyIdentitySchema } from "../schemas/common/family-identity";
import { seedValueSchema } from "../schemas/common/numeric";
import { utcTimestampSchema } from "../schemas/common/timestamp";
import {
  contentVersionSchema,
  saveVersionSchema,
  schemaVersionSchema,
} from "../schemas/common/versions";
import {
  authoritativeSaveSchema,
  type AuthoritativeSave,
} from "../schemas/save/save-schemas";
import { applyPoliticalBackground } from "./apply-background";
import {
  INITIAL_POLITICAL_PERIOD,
  INITIAL_REVISION,
  INITIAL_SAVE_VERSION,
  INITIAL_SCHEMA_VERSION,
} from "./constants";
import { createInitialStateDraft } from "./initial-state";

export const newGameInputSchema = z
  .object({
    saveId: saveIdSchema,
    ownerId: userIdSchema,
    saveVersion: z
      .literal(INITIAL_SAVE_VERSION)
      .transform((value) => saveVersionSchema.parse(value)),
    contentVersion: z
      .literal(INITIAL_CONTENT_VERSION)
      .transform((value) => contentVersionSchema.parse(value)),
    schemaVersion: z
      .literal(INITIAL_SCHEMA_VERSION)
      .transform((value) => schemaVersionSchema.parse(value)),
    gameSeed: seedValueSchema,
    selectedBackground: politicalBackgroundIdSchema,
    familyIdentity: familyIdentitySchema,
    createdAt: utcTimestampSchema,
    updatedAt: utcTimestampSchema,
  })
  .strict()
  .refine((input) => input.updatedAt >= input.createdAt, {
    path: ["updatedAt"],
    message: "A new game cannot be updated before it is created.",
  });

export type NewGameInput = z.infer<typeof newGameInputSchema>;

export function createNewGame(input: unknown): AuthoritativeSave {
  const parsedInput = newGameInputSchema.parse(input);
  const draft = createInitialStateDraft({
    selectedBackground: parsedInput.selectedBackground,
    familyIdentity: parsedInput.familyIdentity,
  });
  const initialized = applyPoliticalBackground(
    draft,
    parsedInput.selectedBackground,
  );

  return authoritativeSaveSchema.parse({
    ...parsedInput,
    revision: INITIAL_REVISION,
    politicalPeriod: INITIAL_POLITICAL_PERIOD,
    authoritativeState: initialized.authoritativeState,
  });
}
