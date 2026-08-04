import "server-only";

import { z } from "zod";

import { EnvironmentConfigurationError } from "@/lib/env/environment-error";

const serverEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const postgresConnectionUrlSchema = z.string().superRefine((value, context) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
      context.addIssue({
        code: "custom",
        message: "Database URLs must use the PostgreSQL protocol.",
      });
    }
  } catch {
    context.addIssue({ code: "custom", message: "Invalid database URL." });
  }
});

const databaseEnvironmentSchema = z
  .object({
    SUPABASE_DATABASE_URL: postgresConnectionUrlSchema,
  })
  .strict();

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;
export type DatabaseEnvironment = z.infer<typeof databaseEnvironmentSchema>;

export function parseServerEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
): ServerEnvironment {
  const result = serverEnvironmentSchema.safeParse({
    NODE_ENV: environment.NODE_ENV,
  });
  if (!result.success) {
    throw new EnvironmentConfigurationError("server", result.error.issues);
  }
  return result.data;
}

export function getServerEnvironment(): ServerEnvironment {
  return parseServerEnvironment({ NODE_ENV: process.env.NODE_ENV });
}

export function parseDatabaseEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
): DatabaseEnvironment {
  const result = databaseEnvironmentSchema.safeParse({
    SUPABASE_DATABASE_URL: environment.SUPABASE_DATABASE_URL,
  });
  if (!result.success) {
    throw new EnvironmentConfigurationError("server", result.error.issues);
  }
  return result.data;
}

export function getDatabaseEnvironment(): DatabaseEnvironment {
  return parseDatabaseEnvironment({
    SUPABASE_DATABASE_URL: process.env.SUPABASE_DATABASE_URL,
  });
}
