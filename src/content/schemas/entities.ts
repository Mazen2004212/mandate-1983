import { z } from "zod";

import {
  canonicalCharacterIdSchema,
  canonicalFactionIdSchema,
  canonicalInternationalEntityIdSchema,
  canonicalOutcomeIdSchema,
  canonicalRegionIdSchema,
  characterAvailabilitySchema,
  familyRoleIdSchema,
  normalizedScoreSchema,
  politicalBackgroundIdSchema,
  politicalPeriodSchema,
  signedWeightSchema,
  stateVisibilitySchema,
} from "../../domain";
import { CANONICAL_INSTITUTION_IDS, CANONICAL_OUTLET_IDS } from "../constants";
import {
  choiceContentIdSchema,
  conditionContentIdSchema,
  contentObjectIdSchema,
  effectContentIdSchema,
  epilogueIdSchema,
  flagContentIdSchema,
  intelligenceAssertionIdSchema,
  institutionIdSchema,
  lawOrMeasureContentIdSchema,
  mediaContentIdSchema,
  memoryContentIdSchema,
  projectContentIdSchema,
  scenarioContentIdSchema,
} from "../ids";
import {
  boundedText,
  commonMetadataFields,
  contentMoneyMinorSchema,
  validateCommonMetadata,
} from "./common";

const metadata = (type: string) => ({
  type: z.literal(type),
});

const entityMetadataValidationSchema = z
  .object(commonMetadataFields)
  .superRefine(validateCommonMetadata);

function withMetadataValidation<T extends z.ZodRawShape>(shape: T) {
  return z
    .object({ ...commonMetadataFields, ...shape })
    .strict()
    .superRefine((value, context) => {
      const result = entityMetadataValidationSchema.safeParse(value);
      if (!result.success) {
        result.error.issues.forEach((issue) =>
          context.addIssue({
            code: "custom",
            path: issue.path,
            message: issue.message,
          }),
        );
      }
    });
}

export const characterContentSchema = withMetadataValidation({
  id: z.union([canonicalCharacterIdSchema, familyRoleIdSchema]),
  ...metadata("character"),
  displayName: boundedText(1, 120),
  customizableRole: familyRoleIdSchema.optional(),
  age: z.number().int().min(18).max(120),
  pronounAndGrammarMetadata: z.record(z.string(), boundedText(1, 80)),
  officeOrRole: boundedText(1, 160),
  factionAffiliations: z.array(canonicalFactionIdSchema),
  publicProfile: boundedText(1, 1_200),
  privateMotivation: boundedText(1, 1_200),
  voiceGuidance: boundedText(1, 800),
  knowledgeAccess: z.array(boundedText(1, 120)),
  continuityState: z.array(boundedText(1, 240)),
  portraitReferences: z.array(contentObjectIdSchema),
  expressionReferences: z.array(contentObjectIdSchema),
  relationshipDimensions: z.array(boundedText(1, 80)),
  memoryReferences: z.array(memoryContentIdSchema),
  availability: characterAvailabilitySchema,
});

export const factionContentSchema = withMetadataValidation({
  id: canonicalFactionIdSchema,
  ...metadata("faction"),
  publicPosition: boundedText(1, 600),
  priorities: z.array(boundedText(1, 240)),
  regionalBases: z.array(canonicalRegionIdSchema),
});

export const regionContentSchema = withMetadataValidation({
  id: canonicalRegionIdSchema,
  ...metadata("region"),
  profile: boundedText(1, 600),
  factionReferences: z.array(canonicalFactionIdSchema),
});

export const institutionContentSchema = withMetadataValidation({
  id: z.enum(CANONICAL_INSTITUTION_IDS),
  ...metadata("institution"),
  authority: boundedText(1, 600),
  characterReferences: z.array(canonicalCharacterIdSchema),
});

export const politicalBackgroundContentSchema = withMetadataValidation({
  id: politicalBackgroundIdSchema,
  ...metadata("political_background"),
  initializationDefinitionId: politicalBackgroundIdSchema,
  publicDescription: boundedText(1, 600),
});

const policyFields = {
  title: boundedText(1, 160),
  publicSummary: boundedText(1, 800),
  legalAuthority: boundedText(1, 400),
  sponsor: contentObjectIdSchema,
  requiredApprovals: z.array(institutionIdSchema),
  politicalCost: z.number().int().min(0).max(100),
  fiscalCostMinor: contentMoneyMinorSchema,
  recurringCostMinor: contentMoneyMinorSchema.nullable(),
  implementationPeriod: politicalPeriodSchema,
  affectedDomains: z.array(boundedText(1, 80)),
  immediateEffects: z.array(effectContentIdSchema),
  delayedEffects: z.array(effectContentIdSchema),
  factionReactions: z.array(canonicalFactionIdSchema),
  regionalEffects: z.array(canonicalRegionIdSchema),
  constitutionalConsiderations: boundedText(1, 600),
  cancellationBehavior: boundedText(1, 400),
  completionBehavior: boundedText(1, 400),
  compatibilityNotes: z.array(boundedText(1, 400)),
} as const;

export const lawOrMeasureContentSchema = withMetadataValidation({
  id: lawOrMeasureContentIdSchema,
  ...metadata("law_or_measure"),
  policyType: z.enum(["law", "decree", "budget_measure", "emergency_measure"]),
  ...policyFields,
});

export const projectContentSchema = withMetadataValidation({
  id: projectContentIdSchema,
  ...metadata("project"),
  policyType: z.literal("government_project"),
  ...policyFields,
});

export const intelligenceAssertionContentSchema = withMetadataValidation({
  id: intelligenceAssertionIdSchema,
  ...metadata("intelligence_assertion"),
  subject: contentObjectIdSchema,
  claim: boundedText(1, 1_200),
  classification: stateVisibilitySchema,
  confidence: normalizedScoreSchema,
  sourceCount: z.number().int().min(0),
  independentSourceCount: z.number().int().min(0),
  corroboration: z.array(contentObjectIdSchema),
  contradiction: z.array(contentObjectIdSchema),
  possibleManipulation: z.boolean(),
  intentionalFabricationAssessment: z.enum([
    "not_assessed",
    "unlikely",
    "possible",
    "likely",
  ]),
  knowingCharacters: z.array(canonicalCharacterIdSchema),
  knowingInstitutions: z.array(institutionIdSchema),
  publicDisclosureStatus: z.enum(["private", "leaked", "public"]),
  reassessmentPeriod: politicalPeriodSchema.nullable(),
  relatedScenarios: z.array(scenarioContentIdSchema),
});

export const mediaReactionContentSchema = withMetadataValidation({
  id: mediaContentIdSchema,
  ...metadata("media_reaction"),
  outletId: z.enum(CANONICAL_OUTLET_IDS),
  sourceEventId: contentObjectIdSchema,
  knownFacts: z.array(contentObjectIdSchema),
  editorialFrame: boundedText(1, 600),
  headline: boundedText(1, 200),
  sentiment: signedWeightSchema,
  reach: normalizedScoreSchema,
  credibility: normalizedScoreSchema,
  publicationPeriod: politicalPeriodSchema,
  publicKnowledgeRequirements: z.array(conditionContentIdSchema),
  leakRequirements: z.array(conditionContentIdSchema),
  factionImplications: z.array(canonicalFactionIdSchema),
  regionalImplications: z.array(canonicalRegionIdSchema),
  relatedScenarioId: scenarioContentIdSchema,
  relatedChoiceId: choiceContentIdSchema.optional(),
});

export const outcomeContentSchema = withMetadataValidation({
  id: canonicalOutcomeIdSchema,
  ...metadata("outcome"),
  eligibility: z.array(conditionContentIdSchema),
  selectionPriority: z.number().int().min(0).max(10_000),
  publicTitle: boundedText(1, 160),
  narrativeTone: boundedText(1, 400),
  contributingValueReferences: z.array(contentObjectIdSchema),
  requiredFlags: z.array(flagContentIdSchema),
  excludedFlags: z.array(flagContentIdSchema),
  epilogueReferences: z.array(epilogueIdSchema),
  developerExplanation: boundedText(1, 600),
  compatibilityNotes: z.array(boundedText(1, 400)),
});

export const epilogueContentSchema = withMetadataValidation({
  id: epilogueIdSchema,
  ...metadata("epilogue"),
  subject: z.union([
    contentObjectIdSchema,
    canonicalInternationalEntityIdSchema,
  ]),
  outcomeId: canonicalOutcomeIdSchema,
  eligibility: z.array(conditionContentIdSchema),
  exclusions: z.array(conditionContentIdSchema),
  prose: boundedText(1, 4_000),
  knowledgeRequirements: z.array(conditionContentIdSchema),
  continuityRequirements: z.array(boundedText(1, 400)),
  priority: z.number().int().min(0).max(10_000),
  fallback: z.boolean(),
});

export type CharacterContent = z.infer<typeof characterContentSchema>;
export type FactionContent = z.infer<typeof factionContentSchema>;
export type RegionContent = z.infer<typeof regionContentSchema>;
export type InstitutionContent = z.infer<typeof institutionContentSchema>;
export type PoliticalBackgroundContent = z.infer<
  typeof politicalBackgroundContentSchema
>;
export type LawOrMeasureContent = z.infer<typeof lawOrMeasureContentSchema>;
export type ProjectContent = z.infer<typeof projectContentSchema>;
export type IntelligenceAssertionContent = z.infer<
  typeof intelligenceAssertionContentSchema
>;
export type MediaReactionContent = z.infer<typeof mediaReactionContentSchema>;
export type OutcomeContent = z.infer<typeof outcomeContentSchema>;
export type EpilogueContent = z.infer<typeof epilogueContentSchema>;
