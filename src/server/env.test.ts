import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

let parseServerEnvironment: typeof import("./env").parseServerEnvironment;

beforeAll(async () => {
  ({ parseServerEnvironment } = await import("./env"));
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
});
