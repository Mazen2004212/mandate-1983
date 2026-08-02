import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z
    .enum(["development", "test", "preview", "production"])
    .default("development"),
});

export type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>;

export function parsePublicEnvironment(
  environment: NodeJS.ProcessEnv,
): PublicEnvironment {
  return publicEnvironmentSchema.parse({
    NEXT_PUBLIC_APP_ENV: environment.NEXT_PUBLIC_APP_ENV,
  });
}

export const publicEnvironment = parsePublicEnvironment(process.env);
