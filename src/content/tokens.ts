import { z } from "zod";

import { boundedText } from "./schemas/common";
import { tokenIdSchema } from "./ids";

export const APPROVED_FAMILY_TOKENS = [
  "{{president.firstName}}",
  "{{president.lastName}}",
  "{{president.publicName}}",
  "{{spouse.firstName}}",
  "{{spouse.lastName}}",
  "{{daughter.firstName}}",
  "{{daughter.lastName}}",
  "{{son.firstName}}",
  "{{son.lastName}}",
  "{{sibling.firstName}}",
  "{{sibling.lastName}}",
  "{{family.surname}}",
] as const;

export const familyTokenSchema = z.enum(APPROVED_FAMILY_TOKENS);

export const tokenRegistryEntrySchema = z
  .object({
    id: tokenIdSchema,
    token: familyTokenSchema,
    valueSource: boundedText(1, 80),
    allowedContexts: z
      .array(z.enum(["narrative", "dialogue", "document", "media", "epilogue"]))
      .min(1),
    grammar: boundedText(1, 240),
    fallback: boundedText(1, 80),
    visibility: z.literal("player_visible"),
    validationExamples: z.array(boundedText(1, 120)).min(1).max(10),
  })
  .strict();

const TOKEN_IDS = [
  "president_first_name",
  "president_last_name",
  "president_public_name",
  "spouse_first_name",
  "spouse_last_name",
  "daughter_first_name",
  "daughter_last_name",
  "son_first_name",
  "son_last_name",
  "sibling_first_name",
  "sibling_last_name",
  "family_surname",
] as const;

export const FAMILY_TOKEN_REGISTRY = Object.freeze(
  z.record(familyTokenSchema, tokenRegistryEntrySchema).parse(
    Object.fromEntries(
      APPROVED_FAMILY_TOKENS.map((token, index) => [
        token,
        Object.freeze(
          tokenRegistryEntrySchema.parse({
            id: TOKEN_IDS[index],
            token,
            valueSource: token.slice(2, -2),
            allowedContexts: [
              "narrative",
              "dialogue",
              "document",
              "media",
              "epilogue",
            ],
            grammar:
              "Use as an inert family-identity value with contextual grammar.",
            fallback: "Office holder",
            visibility: "player_visible",
            validationExamples: ["A", "Ana-María", "O'Rian", "Jean Luc"],
          }),
        ),
      ]),
    ),
  ),
);

export interface FamilyTokenIssue {
  readonly code: "unknown_family_token" | "malformed_family_token";
  readonly token: string;
  readonly index: number;
  readonly message: string;
}

export interface FamilyTokenValidationResult {
  readonly tokens: readonly z.infer<typeof familyTokenSchema>[];
  readonly issues: readonly FamilyTokenIssue[];
}

export function validateFamilyTokens(
  text: string,
): FamilyTokenValidationResult {
  const tokens: z.infer<typeof familyTokenSchema>[] = [];
  const issues: FamilyTokenIssue[] = [];
  const consumedRanges: Array<readonly [number, number]> = [];
  const candidatePattern = /\{\{[^{}]*\}\}/gu;

  for (const match of text.matchAll(candidatePattern)) {
    const index = match.index;
    const candidate = match[0];
    consumedRanges.push([index, index + candidate.length]);
    const parsed = familyTokenSchema.safeParse(candidate);
    if (parsed.success) {
      tokens.push(parsed.data);
    } else {
      issues.push({
        code: "unknown_family_token",
        token: candidate,
        index,
        message: `Unknown family token ${candidate}.`,
      });
    }
  }

  const residual = text
    .split("")
    .map((character, index) =>
      consumedRanges.some(([start, end]) => index >= start && index < end)
        ? " "
        : character,
    );
  const residualText = residual.join("");
  for (const marker of ["{{", "}}"] as const) {
    let index = residualText.indexOf(marker);
    while (index !== -1) {
      issues.push({
        code: "malformed_family_token",
        token: marker,
        index,
        message:
          "Malformed family-token braces. Single braces are inert; double braces always begin or end token syntax.",
      });
      index = residualText.indexOf(marker, index + marker.length);
    }
  }

  return Object.freeze({
    tokens: Object.freeze(tokens),
    issues: Object.freeze(issues),
  });
}

export function extractFamilyTokens(text: string) {
  return validateFamilyTokens(text).tokens;
}

export type FamilyToken = z.infer<typeof familyTokenSchema>;
export type TokenRegistryEntry = z.infer<typeof tokenRegistryEntrySchema>;
