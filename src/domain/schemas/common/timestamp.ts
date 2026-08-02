import { z } from "zod";

export const utcTimestampSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  .refine(
    (value) => {
      const time = Date.parse(value);
      return Number.isFinite(time) && new Date(time).toISOString() === value;
    },
    { message: "Timestamp must be a valid canonical UTC ISO-8601 value." },
  )
  .brand<"UtcTimestamp">();

export type UtcTimestamp = z.infer<typeof utcTimestampSchema>;
