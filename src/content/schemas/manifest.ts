import { z } from "zod";

import {
  contentLifecycleStatusSchema,
  saveVersionSchema,
  utcTimestampSchema,
} from "../../domain";
import { CONTENT_SCHEMA_VERSION, CONTENT_VERSION } from "../constants";
import { contentObjectIdSchema, manifestContentIdSchema } from "../ids";
import { boundedText } from "./common";

function versionParts(value: string): readonly number[] {
  return value
    .slice(value.indexOf("-") + 1)
    .split(".")
    .map(Number);
}

function compareVersions(left: string, right: string): number {
  const leftParts = versionParts(left);
  const rightParts = versionParts(right);
  for (let index = 0; index < 3; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

export const contentManifestSchema = z
  .object({
    id: manifestContentIdSchema,
    contentVersion: z.literal(CONTENT_VERSION),
    schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
    releaseStatus: contentLifecycleStatusSchema,
    minimumCompatibleSaveVersion: saveVersionSchema,
    maximumCompatibleSaveVersion: saveVersionSchema.optional(),
    publicationTimestamp: utcTimestampSchema.optional(),
    includedObjectIds: z.array(contentObjectIdSchema),
    withdrawnObjectIds: z.array(contentObjectIdSchema),
    migrationRequirements: z.array(boundedText(1, 400)),
    integrity: z
      .object({
        algorithm: z.enum(["sha256", "external"]),
        value: boundedText(1, 256),
        suppliedBy: boundedText(1, 120),
      })
      .strict(),
    releaseNotes: z.array(boundedText(1, 600)),
  })
  .strict()
  .superRefine((manifest, context) => {
    const included = new Set(manifest.includedObjectIds);
    const withdrawn = new Set(manifest.withdrawnObjectIds);
    if (included.size !== manifest.includedObjectIds.length) {
      context.addIssue({
        code: "custom",
        path: ["includedObjectIds"],
        message: "Included IDs must be unique.",
      });
    }
    if (withdrawn.size !== manifest.withdrawnObjectIds.length) {
      context.addIssue({
        code: "custom",
        path: ["withdrawnObjectIds"],
        message: "Withdrawn IDs must be unique.",
      });
    }
    for (const id of included) {
      if (withdrawn.has(id)) {
        context.addIssue({
          code: "custom",
          path: ["includedObjectIds"],
          message: `Object ${id} cannot be both included and withdrawn.`,
        });
      }
    }
    if (
      manifest.maximumCompatibleSaveVersion !== undefined &&
      compareVersions(
        manifest.maximumCompatibleSaveVersion,
        manifest.minimumCompatibleSaveVersion,
      ) < 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["maximumCompatibleSaveVersion"],
        message: "Maximum compatible save version cannot precede minimum.",
      });
    }
    if (manifest.releaseStatus === "published") {
      if (manifest.publicationTimestamp === undefined) {
        context.addIssue({
          code: "custom",
          path: ["publicationTimestamp"],
          message: "Published manifests require a publication timestamp.",
        });
      }
      if (manifest.releaseNotes.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["releaseNotes"],
          message: "Published manifests require release notes.",
        });
      }
    } else if (manifest.publicationTimestamp !== undefined) {
      context.addIssue({
        code: "custom",
        path: ["publicationTimestamp"],
        message: "Only published manifests may define a publication timestamp.",
      });
    }
  });

export type ContentManifest = z.infer<typeof contentManifestSchema>;
