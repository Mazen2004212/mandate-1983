import { z } from "zod";

import { portraitPresetIdSchema } from "../../ids/identifier-schemas";

const CONTROL_OR_FORMAT_CHARACTER = /[\p{Cc}\p{Cf}]/u;

export const familyNameSchema = z
  .string()
  .min(1)
  .max(64)
  .refine((value) => value === value.trim(), {
    message: "Names cannot have leading or trailing whitespace.",
  })
  .refine((value) => !CONTROL_OR_FORMAT_CHARACTER.test(value), {
    message: "Names cannot contain control or format characters.",
  })
  .brand<"FamilyName">();

export const presidentPublicNamePreferenceSchema = z.enum([
  "full_name",
  "first_name",
  "title_and_last_name",
]);

const familyMemberIdentityFields = {
  firstName: familyNameSchema,
  lastName: familyNameSchema,
  portraitPresetId: portraitPresetIdSchema,
} as const;

export const presidentIdentitySchema = z
  .object({
    role: z.literal("president"),
    ...familyMemberIdentityFields,
    publicNamePreference: presidentPublicNamePreferenceSchema.optional(),
  })
  .strict();

export const spouseIdentitySchema = z
  .object({
    role: z.literal("spouse"),
    ...familyMemberIdentityFields,
  })
  .strict();

export const adultDaughterIdentitySchema = z
  .object({
    role: z.literal("adult_daughter"),
    ...familyMemberIdentityFields,
  })
  .strict();

export const adultSonIdentitySchema = z
  .object({
    role: z.literal("adult_son"),
    ...familyMemberIdentityFields,
  })
  .strict();

export const adultSiblingIdentitySchema = z
  .object({
    role: z.literal("adult_sibling"),
    ...familyMemberIdentityFields,
  })
  .strict();

export const familyIdentitySchema = z
  .object({
    surname: familyNameSchema,
    president: presidentIdentitySchema,
    spouse: spouseIdentitySchema,
    adultDaughter: adultDaughterIdentitySchema,
    adultSon: adultSonIdentitySchema,
    adultSibling: adultSiblingIdentitySchema,
  })
  .strict();

export type FamilyName = z.infer<typeof familyNameSchema>;
export type PresidentPublicNamePreference = z.infer<
  typeof presidentPublicNamePreferenceSchema
>;
export type FamilyIdentity = z.infer<typeof familyIdentitySchema>;
