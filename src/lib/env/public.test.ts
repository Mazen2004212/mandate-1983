import { describe, expect, it } from "vitest";

import { EnvironmentConfigurationError } from "./environment-error";
import { parsePublicEnvironment } from "./public";

const VALID_KEY = "sb_publishable_local_test_key_123456789";

describe("public environment validation", () => {
  it("accepts HTTPS projects and local HTTP development", () => {
    expect(
      parsePublicEnvironment({
        NEXT_PUBLIC_APP_ENV: "preview",
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: VALID_KEY,
      }),
    ).toEqual({
      NEXT_PUBLIC_APP_ENV: "preview",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: VALID_KEY,
    });

    expect(
      parsePublicEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: VALID_KEY,
      }).NEXT_PUBLIC_APP_ENV,
    ).toBe("development");
  });

  it.each([
    ["missing values", {}],
    [
      "remote plain HTTP",
      {
        NEXT_PUBLIC_SUPABASE_URL: "http://example.com",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: VALID_KEY,
      },
    ],
    [
      "malformed key",
      {
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "short secret value",
      },
    ],
  ])("rejects %s without echoing environment values", (_label, input) => {
    let caught: unknown;
    try {
      parsePublicEnvironment(input);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(EnvironmentConfigurationError);
    expect(String(caught)).not.toContain("short secret value");
    expect(String(caught)).not.toContain("http://example.com");
  });
});
