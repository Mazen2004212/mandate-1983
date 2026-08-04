import { z } from "zod";

import { EnvironmentConfigurationError } from "./environment-error";

const supabaseProjectUrlSchema = z.url().superRefine((value, context) => {
  const url = new URL(value);
  const isLocalHttp =
    url.protocol === "http:" &&
    (url.hostname === "127.0.0.1" || url.hostname === "localhost");
  if (url.protocol !== "https:" && !isLocalHttp) {
    context.addIssue({
      code: "custom",
      message: "Supabase project URLs must use HTTPS except on localhost.",
    });
  }
});

const browserSafeSupabaseKeySchema = z
  .string()
  .min(20)
  .max(2048)
  .regex(
    /^(?:sb_publishable_[A-Za-z0-9_-]{20,}|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/,
  );

const publicEnvironmentSchema = z
  .object({
    NEXT_PUBLIC_APP_ENV: z
      .enum(["development", "test", "preview", "production"])
      .default("development"),
    NEXT_PUBLIC_SUPABASE_URL: supabaseProjectUrlSchema,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: browserSafeSupabaseKeySchema,
  })
  .strict();

export type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>;

export function parsePublicEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
): PublicEnvironment {
  const result = publicEnvironmentSchema.safeParse({
    NEXT_PUBLIC_APP_ENV: environment.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_SUPABASE_URL: environment.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  if (!result.success) {
    throw new EnvironmentConfigurationError("public", result.error.issues);
  }
  return result.data;
}

export function getPublicEnvironment(): PublicEnvironment {
  return parsePublicEnvironment({
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
