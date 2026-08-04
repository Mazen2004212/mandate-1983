import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

let parseServerEnvironment: typeof import("./env").parseServerEnvironment;
let parseDatabaseEnvironment: typeof import("./env").parseDatabaseEnvironment;

beforeAll(async () => {
  ({ parseDatabaseEnvironment, parseServerEnvironment } =
    await import("./env"));
});

describe("server environment validation", () => {
  it("accepts the supported runtime modes", () => {
    expect(parseServerEnvironment({ NODE_ENV: "production" })).toEqual({
      NODE_ENV: "production",
    });
  });

  it("fails with a sanitized error for an unsupported mode", () => {
    expect(() =>
      parseServerEnvironment({ NODE_ENV: "secret-runtime-mode" }),
    ).toThrow("Invalid server environment configuration (NODE_ENV).");
    expect(() =>
      parseServerEnvironment({ NODE_ENV: "secret-runtime-mode" }),
    ).not.toThrow("secret-runtime-mode");
  });

  it("accepts only a server-side PostgreSQL connection URL", () => {
    expect(
      parseDatabaseEnvironment({
        SUPABASE_DATABASE_URL:
          "postgresql://postgres:local-placeholder@127.0.0.1:54322/postgres",
      }),
    ).toEqual({
      SUPABASE_DATABASE_URL:
        "postgresql://postgres:local-placeholder@127.0.0.1:54322/postgres",
    });
    expect(() =>
      parseDatabaseEnvironment({
        SUPABASE_DATABASE_URL: "https://not-a-database.example.test",
      }),
    ).toThrow("Invalid server environment configuration");
  });
});
