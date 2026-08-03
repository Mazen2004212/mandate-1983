import { z } from "zod";

import {
  contentLifecycleStatusSchema,
  moneyMinorSchema,
  politicalPeriodSchema,
  serializedMoneyMinorSchema,
  utcTimestampSchema,
} from "../../domain";
import {
  CANON_REFERENCE_IDS,
  CONTENT_OBJECT_TYPES,
  CONTENT_SCHEMA_VERSION,
  CONTENT_VERSION,
  MVP_CHAPTER_IDS,
  ORIGINALITY_STATUSES,
  SYSTEM_REFERENCE_IDS,
} from "../constants";
import { contentObjectIdSchema } from "../ids";

const CONTROL_CHARACTER_PATTERN =
  /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;

export function boundedText(min: number, max: number) {
  return z
    .string()
    .min(min)
    .max(max)
    .refine((value) => !CONTROL_CHARACTER_PATTERN.test(value), {
      message: "Content text cannot contain control characters.",
    });
}

export const chapterIdSchema = z.enum(MVP_CHAPTER_IDS);
export const contentObjectTypeSchema = z.enum(CONTENT_OBJECT_TYPES);
export const originalityStatusSchema = z.enum(ORIGINALITY_STATUSES);
export const canonReferenceSchema = z.enum(CANON_REFERENCE_IDS);
export const systemReferenceSchema = z.enum(SYSTEM_REFERENCE_IDS);
export const supportedContentVersionSchema = z.literal(CONTENT_VERSION);
export const supportedContentSchemaVersionSchema = z.literal(
  CONTENT_SCHEMA_VERSION,
);
export const contentMoneyMinorSchema = serializedMoneyMinorSchema.refine(
  (value) => moneyMinorSchema.safeParse(BigInt(value)).success,
  {
    message:
      "Serialized content money must fit the canonical MoneyMinor range.",
  },
);

export const commonMetadataFields = {
  status: contentLifecycleStatusSchema,
  contentVersion: supportedContentVersionSchema,
  schemaVersion: supportedContentSchemaVersionSchema,
  title: boundedText(1, 120),
  summary: boundedText(1, 600),
  chapter: chapterIdSchema.nullable(),
  politicalPeriod: politicalPeriodSchema.nullable(),
  authoringOwner: boundedText(1, 80),
  createdAt: utcTimestampSchema,
  updatedAt: utcTimestampSchema,
  tags: z.array(boundedText(1, 40)).max(20),
  canonReferences: z.array(canonReferenceSchema).max(30),
  systemReferences: z.array(systemReferenceSchema).max(30),
  relatedContentIds: z.array(contentObjectIdSchema).max(50),
  ratingNotes: z.array(boundedText(1, 240)).max(20),
  originalityStatus: originalityStatusSchema,
  changeNotes: z.array(boundedText(1, 400)).max(30),
} as const;

export function validateCommonMetadata(
  value: {
    status: z.infer<typeof contentLifecycleStatusSchema>;
    createdAt: string;
    updatedAt: string;
    originalityStatus: z.infer<typeof originalityStatusSchema>;
    changeNotes: readonly string[];
  },
  context: z.RefinementCtx,
) {
  if (value.updatedAt < value.createdAt) {
    context.addIssue({
      code: "custom",
      path: ["updatedAt"],
      message: "Content cannot be updated before it is created.",
    });
  }
  if (value.status === "published" && value.changeNotes.length === 0) {
    context.addIssue({
      code: "custom",
      path: ["changeNotes"],
      message:
        "Published content requires change notes because behavioral changes cannot be inferred structurally.",
    });
  }
  if (
    value.status === "published" &&
    value.originalityStatus !== "reviewed_original"
  ) {
    context.addIssue({
      code: "custom",
      path: ["originalityStatus"],
      message: "Published content must have reviewed_original status.",
    });
  }
}

export const contentMetadataSchema = z
  .object({
    id: contentObjectIdSchema,
    type: contentObjectTypeSchema,
    ...commonMetadataFields,
  })
  .strict()
  .superRefine(validateCommonMetadata);

export const politicalPeriodWindowSchema = z
  .object({
    minimum: politicalPeriodSchema,
    maximum: politicalPeriodSchema,
  })
  .strict()
  .refine((window) => window.minimum <= window.maximum, {
    path: ["maximum"],
    message: "Political-period window maximum cannot precede its minimum.",
  });

export type ContentMetadata = z.infer<typeof contentMetadataSchema>;
export type ChapterId = z.infer<typeof chapterIdSchema>;
export type OriginalityStatus = z.infer<typeof originalityStatusSchema>;
