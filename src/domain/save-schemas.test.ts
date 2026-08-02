import { describe, expect, it } from "vitest";

import { authoritativeSaveSchema, publicSaveSummarySchema } from "./index";
import { createValidSaveFixture } from "./test/fixtures";

describe("authoritative save schema", () => {
  it("accepts a complete valid save fixture", () => {
    const save = authoritativeSaveSchema.parse(createValidSaveFixture());
    expect(save.revision).toBe(0);
    expect(save.authoritativeState.eventHistory).toEqual([]);
    expect(save.authoritativeState.delayedEffects).toEqual([]);
    expect(save.authoritativeState.memories).toEqual([]);
    expect(save.authoritativeState.outcomeState).toEqual({});
  });

  it("rejects unknown top-level fields", () => {
    expect(
      authoritativeSaveSchema.safeParse({
        ...createValidSaveFixture(),
        clientCalculatedOutcome: "mvp_civic_stabilization",
      }).success,
    ).toBe(false);
  });

  it("rejects malformed identifiers and metadata", () => {
    const save = createValidSaveFixture();
    expect(
      authoritativeSaveSchema.safeParse({ ...save, saveId: "save_one" })
        .success,
    ).toBe(false);
    expect(
      authoritativeSaveSchema.safeParse({ ...save, revision: -1 }).success,
    ).toBe(false);
    expect(
      authoritativeSaveSchema.safeParse({ ...save, contentVersion: "mvp-next" })
        .success,
    ).toBe(false);
    expect(
      authoritativeSaveSchema.safeParse({
        ...save,
        createdAt: "1983-01-01T02:00:00.000+02:00",
      }).success,
    ).toBe(false);
  });

  it("rejects timestamps that move backwards", () => {
    const save = createValidSaveFixture();
    expect(
      authoritativeSaveSchema.safeParse({
        ...save,
        createdAt: "1983-02-01T00:00:00.000Z",
      }).success,
    ).toBe(false);
  });

  it("rejects mismatched indexed and authoritative state metadata", () => {
    const save = createValidSaveFixture();
    expect(
      authoritativeSaveSchema.safeParse({ ...save, politicalPeriod: 1 })
        .success,
    ).toBe(false);
    expect(
      authoritativeSaveSchema.safeParse({
        ...save,
        selectedBackground: "labor_mediator",
      }).success,
    ).toBe(false);
    expect(
      authoritativeSaveSchema.safeParse({
        ...save,
        familyIdentity: { ...save.familyIdentity, surname: "Different" },
      }).success,
    ).toBe(false);
  });

  it("rejects invalid nested state and unknown nested fields", () => {
    const save = createValidSaveFixture();
    expect(
      authoritativeSaveSchema.safeParse({
        ...save,
        authoritativeState: {
          ...save.authoritativeState,
          economy: {
            ...save.authoritativeState.economy,
            treasuryMinor: 100,
          },
        },
      }).success,
    ).toBe(false);
  });
});

describe("public save summary", () => {
  const summary = {
    saveId: "4cc946fc-22a0-4db1-991f-cf3d93bc11c7",
    saveVersion: "save-1.0.0",
    contentVersion: "mvp-0.1.0",
    schemaVersion: "schema-1.0.0",
    revision: 2,
    politicalPeriod: 1,
    selectedBackground: "civil_service_reformer",
    presidentDisplayName: "President Valère",
    createdAt: "1983-01-01T00:00:00.000Z",
    updatedAt: "1983-02-01T00:00:00.000Z",
  };

  it("accepts only public-safe list metadata", () => {
    expect(publicSaveSummarySchema.safeParse(summary).success).toBe(true);
    expect(
      publicSaveSummarySchema.safeParse({
        ...summary,
        gameSeed: "hidden_seed_value_1983",
      }).success,
    ).toBe(false);
    expect(
      publicSaveSummarySchema.safeParse({
        ...summary,
        authoritativeState: createValidSaveFixture().authoritativeState,
      }).success,
    ).toBe(false);
  });
});
