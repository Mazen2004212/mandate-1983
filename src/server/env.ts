import "server-only";

import { z } from "zod";

import { EnvironmentConfigurationError } from "@/lib/env/environment-error";

const serverEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

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
