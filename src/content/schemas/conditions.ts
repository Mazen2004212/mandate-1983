import { z } from "zod";

import {
  basisPointsSchema,
  normalizedScoreSchema,
  politicalBackgroundIdSchema,
  saveVersionSchema,
  stateVisibilitySchema,
} from "../../domain";
import {
  BASIS_POINT_STATE_FIELDS,
  MONEY_STATE_FIELDS,
  NORMALIZED_STATE_FIELDS,
} from "../constants";
import { conditionContentIdSchema, contentObjectIdSchema } from "../ids";
import {
  boundedText,
  chapterIdSchema,
  contentMoneyMinorSchema,
  supportedContentVersionSchema,
} from "./common";

const numericOperators = z.enum([
  "equals",
  "not_equals",
  "greater_than",
  "greater_than_or_equal",
  "less_than",
  "less_than_or_equal",
  "within_range",
]);

const referenceOperators = z.enum([
  "equals",
  "not_equals",
  "contains",
  "does_not_contain",
  "exists",
  "does_not_exist",
]);

const conditionBase = {
  id: conditionContentIdSchema,
  visibility: stateVisibilitySchema,
  developerFailureExplanation: boundedText(1, 400),
} as const;

function validateNumericExpectation(
  condition: {
    operator: z.infer<typeof numericOperators>;
    expectedValue?: unknown | undefined;
    range?: { minimum: number | bigint; maximum: number | bigint } | undefined;
  },
  context: z.RefinementCtx,
) {
  if (condition.operator === "within_range") {
    if (condition.range === undefined) {
      context.addIssue({
        code: "custom",
        path: ["range"],
        message: "within_range requires a range.",
      });
    } else if (condition.range.minimum > condition.range.maximum) {
      context.addIssue({
        code: "custom",
        path: ["range", "maximum"],
        message: "Range maximum cannot precede minimum.",
      });
    }
    if (condition.expectedValue !== undefined) {
      context.addIssue({
        code: "custom",
        path: ["expectedValue"],
        message: "within_range cannot also define expectedValue.",
      });
    }
  } else if (
    condition.expectedValue === undefined ||
    condition.range !== undefined
  ) {
    context.addIssue({
      code: "custom",
      path: ["expectedValue"],
      message: "Numeric comparisons require expectedValue and no range.",
    });
  }
}

export const normalizedScoreConditionSchema = z
  .object({
    ...conditionBase,
    type: z.literal("normalized_score"),
    field: z.enum(NORMALIZED_STATE_FIELDS),
    operator: numericOperators,
    unit: z.literal("normalized_score"),
    expectedValue: normalizedScoreSchema.optional(),
    range: z
      .object({
        minimum: normalizedScoreSchema,
        maximum: normalizedScoreSchema,
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine(validateNumericExpectation);

export const basisPointConditionSchema = z
  .object({
    ...conditionBase,
    type: z.literal("basis_points"),
    field: z.enum(BASIS_POINT_STATE_FIELDS),
    operator: numericOperators,
    unit: z.literal("basis_points"),
    expectedValue: basisPointsSchema.optional(),
    range: z
      .object({ minimum: basisPointsSchema, maximum: basisPointsSchema })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine(validateNumericExpectation);

export const moneyConditionSchema = z
  .object({
    ...conditionBase,
    type: z.literal("money_minor"),
    field: z.enum(MONEY_STATE_FIELDS),
    operator: numericOperators,
    unit: z.literal("money_minor"),
    expectedValue: contentMoneyMinorSchema.optional(),
    range: z
      .object({
        minimum: contentMoneyMinorSchema,
        maximum: contentMoneyMinorSchema,
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((condition, context) => {
    const converted = {
      ...condition,
      range:
        condition.range === undefined
          ? undefined
          : {
              minimum: BigInt(condition.range.minimum),
              maximum: BigInt(condition.range.maximum),
            },
    };
    validateNumericExpectation(converted, context);
  });

export const backgroundConditionSchema = z
  .object({
    ...conditionBase,
    type: z.literal("background"),
    operator: z.enum(["equals", "not_equals"]),
    expectedValue: politicalBackgroundIdSchema,
  })
  .strict();

export const chapterConditionSchema = z
  .object({
    ...conditionBase,
    type: z.literal("chapter"),
    operator: z.enum(["equals", "not_equals"]),
    expectedValue: chapterIdSchema,
  })
  .strict();

export const versionConditionSchema = z
  .object({
    ...conditionBase,
    type: z.enum(["content_version", "save_version"]),
    operator: z.enum(["equals", "not_equals"]),
    expectedValue: z.union([supportedContentVersionSchema, saveVersionSchema]),
  })
  .strict()
  .superRefine((condition, context) => {
    const prefix = condition.type === "content_version" ? "mvp-" : "save-";
    if (!condition.expectedValue.startsWith(prefix)) {
      context.addIssue({
        code: "custom",
        path: ["expectedValue"],
        message: `${condition.type} requires a matching version family.`,
      });
    }
  });

export const referenceConditionSchema = z
  .object({
    ...conditionBase,
    type: z.literal("reference"),
    referenceKind: z.enum([
      "flag",
      "memory",
      "relationship",
      "faction",
      "region",
      "law_or_measure",
      "project",
      "previous_outcome",
      "character_availability",
      "international",
      "family",
    ]),
    referenceId: contentObjectIdSchema,
    operator: referenceOperators,
    expectedValue: z
      .union([contentObjectIdSchema, boundedText(1, 120)])
      .optional(),
  })
  .strict()
  .superRefine((condition, context) => {
    const existenceOperator =
      condition.operator === "exists" ||
      condition.operator === "does_not_exist";
    if (existenceOperator && condition.expectedValue !== undefined) {
      context.addIssue({
        code: "custom",
        path: ["expectedValue"],
        message: "Existence conditions cannot define expectedValue.",
      });
    }
    if (!existenceOperator && condition.expectedValue === undefined) {
      context.addIssue({
        code: "custom",
        path: ["expectedValue"],
        message: "Reference comparisons require expectedValue.",
      });
    }
  });

export const compoundConditionSchema = z
  .object({
    ...conditionBase,
    type: z.literal("compound"),
    operator: z.enum(["all", "any", "none"]),
    conditionIds: z.array(conditionContentIdSchema).min(1),
  })
  .strict();

export const conditionSchema = z.discriminatedUnion("type", [
  normalizedScoreConditionSchema,
  basisPointConditionSchema,
  moneyConditionSchema,
  backgroundConditionSchema,
  chapterConditionSchema,
  versionConditionSchema,
  referenceConditionSchema,
  compoundConditionSchema,
]);

export type ConditionDefinition = z.infer<typeof conditionSchema>;
