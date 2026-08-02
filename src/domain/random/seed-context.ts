import { z } from "zod";

import { authoredIdSchema } from "../ids/identifier-schemas";
import {
  politicalPeriodSchema,
  seedValueSchema,
} from "../schemas/common/numeric";
import { contentVersionSchema } from "../schemas/common/versions";
import { encodeUtf8 } from "./utf8";

export const SEED_SERIALIZATION_VERSION = "mandate_seed_v1" as const;

export const seedNamespaceSchema = authoredIdSchema
  .min(1)
  .max(64)
  .brand<"SeedNamespace">();

export const seedEntityIdSchema = authoredIdSchema
  .min(1)
  .max(128)
  .brand<"SeedEntityId">();

export const attemptIndexSchema = z
  .number()
  .int()
  .nonnegative()
  .safe()
  .brand<"AttemptIndex">();

export const seedContextSchema = z
  .object({
    gameSeed: seedValueSchema,
    namespace: seedNamespaceSchema,
    entityId: seedEntityIdSchema,
    politicalPeriod: politicalPeriodSchema,
    attemptIndex: attemptIndexSchema,
    contentVersion: contentVersionSchema,
  })
  .strict();

export type SeedNamespace = z.infer<typeof seedNamespaceSchema>;
export type SeedEntityId = z.infer<typeof seedEntityIdSchema>;
export type AttemptIndex = z.infer<typeof attemptIndexSchema>;
export type SeedContext = Readonly<z.infer<typeof seedContextSchema>>;

export function createSeedContext(input: unknown): SeedContext {
  return Object.freeze(seedContextSchema.parse(input));
}

function serializeField(name: string, value: string): string {
  return `${name}=${encodeUtf8(value).length}:${value}`;
}

/**
 * Canonical mandate_seed_v1 contract:
 *
 * mandate_seed_v1|gameSeed=<UTF-8 byte length>:<value>|namespace=...|
 * entityId=...|politicalPeriod=...|attemptIndex=...|contentVersion=...
 *
 * Field order and names are fixed. Every value is UTF-8-byte-length-prefixed,
 * so adjacent values cannot concatenate ambiguously. Numeric values use
 * locale-independent base-10 strings. Changing this representation requires a
 * new serialization version because it would alter deterministic outcomes.
 */
export function serializeSeedContext(context: SeedContext): string {
  const parsed = seedContextSchema.parse(context);
  return [
    SEED_SERIALIZATION_VERSION,
    serializeField("gameSeed", parsed.gameSeed),
    serializeField("namespace", parsed.namespace),
    serializeField("entityId", parsed.entityId),
    serializeField("politicalPeriod", parsed.politicalPeriod.toString(10)),
    serializeField("attemptIndex", parsed.attemptIndex.toString(10)),
    serializeField("contentVersion", parsed.contentVersion),
  ].join("|");
}
