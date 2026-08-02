import { z } from "zod";

export const saveVersionSchema = z
  .string()
  .regex(/^save-(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/)
  .brand<"SaveVersion">();

export const contentVersionSchema = z
  .string()
  .regex(/^mvp-(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/)
  .brand<"ContentVersion">();

export const schemaVersionSchema = z
  .string()
  .regex(/^schema-(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/)
  .brand<"SchemaVersion">();

export type SaveVersion = z.infer<typeof saveVersionSchema>;
export type ContentVersion = z.infer<typeof contentVersionSchema>;
export type SchemaVersion = z.infer<typeof schemaVersionSchema>;
