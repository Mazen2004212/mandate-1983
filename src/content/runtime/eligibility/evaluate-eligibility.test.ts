import { describe, expect, it } from "vitest";

import {
  contentVersionSchema,
  resolvedChoiceHistoryEntrySchema,
} from "../../../domain";
import type { ConditionDefinition } from "../../schemas/conditions";
import { contentManifestSchema } from "../../schemas/manifest";
import {
  runtimeCondition,
  runtimeRegistry,
  runtimeSave,
  runtimeScenario,
} from "../test/fixtures";
import {
  evaluateCharacterAvailability,
  evaluateScenarioEligibility,
  type ScenarioEligibilityContext,
} from ".";

function context(
  scenarios = [runtimeScenario("scenario_eligible")],
  conditions: readonly ConditionDefinition[] = [],
): ScenarioEligibilityContext {
  return {
    registry: runtimeRegistry({ scenarios, conditions }),
    save: runtimeSave(),
    chapter: "prologue",
    history: [],
  };
}

describe("character availability", () => {
  it.each([
    ["active", true],
    ["resigned", false],
    ["dismissed", false],
    ["unavailable", false],
    ["imprisoned", false],
    ["exiled", false],
    ["deceased", false],
  ] as const)(
    "treats %s according to the default active-only contract",
    (availability, available) => {
      const source = runtimeSave().authoritativeState;
      const state = {
        ...source,
        characters: {
          ...source.characters,
          mara_edevane: { ...source.characters.mara_edevane, availability },
        },
      };
      expect(
        evaluateCharacterAvailability("mara_edevane", state).available,
      ).toBe(available);
    },
  );

  it("allows only explicitly supplied special availability states", () => {
    const source = runtimeSave().authoritativeState;
    const state = {
      ...source,
      characters: {
        ...source.characters,
        mara_edevane: {
          ...source.characters.mara_edevane,
          availability: "resigned" as const,
        },
      },
    };
    expect(
      evaluateCharacterAvailability("mara_edevane", state, [
        "active",
        "resigned",
      ]).available,
    ).toBe(true);
  });

  it("resolves stable family roles and fails safely when canonical state is absent", () => {
    const state = structuredClone(runtimeSave().authoritativeState);
    expect(evaluateCharacterAvailability("spouse", state)).toMatchObject({
      participantKind: "family_role",
      available: true,
    });
    Reflect.deleteProperty(state.characters, "mara_edevane");
    expect(evaluateCharacterAvailability("mara_edevane", state)).toMatchObject({
      exists: false,
      available: false,
      playerExplanation: "A required participant is unavailable.",
    });
  });
});

describe("scenario eligibility", () => {
  it("accepts an active scenario in its period with available participants", () => {
    const scenario = runtimeScenario("scenario_eligible");
    expect(
      evaluateScenarioEligibility(scenario, context([scenario])),
    ).toMatchObject({
      eligible: true,
      periodStatus: "currently_available",
      occurrenceCount: 0,
    });
  });

  it.each([
    ["draft", "inactive_lifecycle"],
    ["review", "inactive_lifecycle"],
    ["approved", "inactive_lifecycle"],
    ["deprecated", "inactive_lifecycle"],
    ["withdrawn", "inactive_lifecycle"],
  ] as const)("rejects %s lifecycle content", (status, code) => {
    const scenario = runtimeScenario(`scenario_${status}`, { status });
    const result = evaluateScenarioEligibility(scenario, context([scenario]));
    expect(result.blockingReasons.map((entry) => entry.code)).toContain(code);
  });

  it("distinguishes not-yet-available and expired windows", () => {
    const future = runtimeScenario("scenario_future", {
      politicalPeriodWindow: { minimum: 1, maximum: 2 },
    });
    const expired = runtimeScenario("scenario_expired", {
      politicalPeriodWindow: { minimum: 0, maximum: 0 },
    });
    expect(
      evaluateScenarioEligibility(future, context([future])).periodStatus,
    ).toBe("not_yet_available");
    const expiredContext = {
      ...context([expired]),
      save: runtimeSave(1),
    };
    expect(
      evaluateScenarioEligibility(expired, expiredContext).periodStatus,
    ).toBe("expired");
  });

  it("requires registered and completed predecessors", () => {
    const first = runtimeScenario("scenario_first", {
      followUps: ["scenario_second"],
    });
    const second = runtimeScenario("scenario_second", {
      predecessors: ["scenario_first"],
    });
    const base = context([first, second]);
    expect(evaluateScenarioEligibility(second, base).eligible).toBe(false);
    const history = [
      resolvedChoiceHistoryEntrySchema.parse({
        scenarioId: first.id,
        choiceId: "choice_runtime_resolution",
        politicalPeriod: 0,
        resolvedAt: "1983-01-01T00:00:00.000Z",
      }),
    ];
    expect(
      evaluateScenarioEligibility(second, { ...base, history }).eligible,
    ).toBe(true);
  });

  it("enforces non-repeatability and authored maximum occurrences", () => {
    const once = runtimeScenario("scenario_once");
    const repeatable = runtimeScenario("scenario_repeatable", {
      repeatability: { repeatable: true, maximumOccurrences: 2 },
    });
    const entry = (scenarioId: string, choiceId: string) =>
      resolvedChoiceHistoryEntrySchema.parse({
        scenarioId,
        choiceId,
        politicalPeriod: 0,
        resolvedAt: "1983-01-01T00:00:00.000Z",
      });
    expect(
      evaluateScenarioEligibility(once, {
        ...context([once]),
        history: [entry(once.id, "choice_once")],
      }).blockingReasons.map((item) => item.code),
    ).toContain("resolved_non_repeatable");
    expect(
      evaluateScenarioEligibility(repeatable, {
        ...context([repeatable]),
        history: [
          entry(repeatable.id, "choice_repeat_one"),
          entry(repeatable.id, "choice_repeat_two"),
        ],
      }).blockingReasons.map((item) => item.code),
    ).toContain("repeat_limit_reached");
  });

  it("applies required and exclusion conditions and hides developer-only detail", () => {
    const pass = runtimeCondition({
      id: "condition_eligibility_pass",
      type: "chapter",
      operator: "equals",
      expectedValue: "prologue",
      visibility: "player_visible_qualitative",
    });
    const exclusion = runtimeCondition({
      id: "condition_exclusion_pass",
      type: "background",
      operator: "equals",
      expectedValue: "civil_service_reformer",
      visibility: "developer_only",
    });
    const scenario = runtimeScenario("scenario_conditions", {
      eligibility: [pass.id],
      exclusions: [exclusion.id],
    });
    const result = evaluateScenarioEligibility(
      scenario,
      context([scenario], [pass, exclusion]),
    );
    expect(result.blockingReasons.map((entry) => entry.code)).toContain(
      "exclusion_satisfied",
    );
    expect(result.playerConditionExplanations).toHaveLength(1);
    expect(result.playerBlockingReasons).not.toContain(
      "Exclusion condition_exclusion_pass is satisfied.",
    );
  });

  it("allows an unsatisfied exclusion and blocks unavailable or missing required characters", () => {
    const exclusion = runtimeCondition({
      id: "condition_exclusion_false",
      type: "background",
      operator: "not_equals",
      expectedValue: "civil_service_reformer",
    });
    const scenario = runtimeScenario("scenario_character_requirements", {
      exclusions: [exclusion.id],
    });
    const activeContext = context([scenario], [exclusion]);
    expect(evaluateScenarioEligibility(scenario, activeContext).eligible).toBe(
      true,
    );
    const unavailableContext: ScenarioEligibilityContext = {
      ...activeContext,
      save: {
        ...activeContext.save,
        authoritativeState: {
          ...activeContext.save.authoritativeState,
          characters: {
            ...activeContext.save.authoritativeState.characters,
            mara_edevane: {
              ...activeContext.save.authoritativeState.characters.mara_edevane,
              availability: "unavailable",
            },
          },
        },
      },
    };
    expect(
      evaluateScenarioEligibility(
        scenario,
        unavailableContext,
      ).blockingReasons.map((entry) => entry.code),
    ).toContain("participant_unavailable");
    const missingContext = structuredClone(activeContext);
    Reflect.deleteProperty(
      missingContext.save.authoritativeState.characters,
      "mara_edevane",
    );
    expect(
      evaluateScenarioEligibility(scenario, missingContext).blockingReasons.map(
        (entry) => entry.code,
      ),
    ).toContain("participant_unavailable");
  });

  it("enforces manifest inclusion, withdrawal, save compatibility, and content version", () => {
    const scenario = runtimeScenario("scenario_manifest_contract");
    const manifest = (overrides: Record<string, unknown> = {}) =>
      contentManifestSchema.parse({
        id: "manifest_eligibility_test",
        contentVersion: "mvp-0.1.0",
        schemaVersion: "schema-1.0.0",
        releaseStatus: "published",
        minimumCompatibleSaveVersion: "save-1.0.0",
        publicationTimestamp: "1983-01-01T00:00:00.000Z",
        includedObjectIds: [scenario.id],
        withdrawnObjectIds: [],
        migrationRequirements: [],
        integrity: {
          algorithm: "external",
          value: "eligibility-test-integrity",
          suppliedBy: "test_suite",
        },
        releaseNotes: ["Test-only eligibility manifest."],
        ...overrides,
      });
    const withManifest = (
      activeManifest: ReturnType<typeof manifest>,
    ): ScenarioEligibilityContext => ({
      ...context([scenario]),
      registry: runtimeRegistry({
        scenarios: [scenario],
        manifest: activeManifest,
      }),
    });

    const excluded = evaluateScenarioEligibility(
      scenario,
      withManifest(manifest({ includedObjectIds: [] })),
    );
    expect(excluded.blockingReasons.map((entry) => entry.code)).toContain(
      "manifest_excluded",
    );
    const withdrawn = evaluateScenarioEligibility(
      scenario,
      withManifest(
        manifest({ includedObjectIds: [], withdrawnObjectIds: [scenario.id] }),
      ),
    );
    expect(withdrawn.blockingReasons.map((entry) => entry.code)).toContain(
      "manifest_withdrawn",
    );
    const incompatibleSave = evaluateScenarioEligibility(
      scenario,
      withManifest(manifest({ minimumCompatibleSaveVersion: "save-2.0.0" })),
    );
    expect(
      incompatibleSave.blockingReasons.map((entry) => entry.code),
    ).toContain("save_version_mismatch");
    const base = context([scenario]);
    const contentMismatch = evaluateScenarioEligibility(scenario, {
      ...base,
      save: {
        ...base.save,
        contentVersion: contentVersionSchema.parse("mvp-0.2.0"),
      },
    });
    expect(
      contentMismatch.blockingReasons.map((entry) => entry.code),
    ).toContain("content_version_mismatch");
  });

  it("reports multiple simultaneous blockers and does not mutate any input", () => {
    const failing = runtimeCondition({
      id: "condition_required_failure",
      type: "chapter",
      operator: "not_equals",
      expectedValue: "prologue",
    });
    const scenario = runtimeScenario("scenario_many_blockers", {
      politicalPeriodWindow: { minimum: 2, maximum: 3 },
      eligibility: [failing.id],
      participants: ["mara_edevane"],
    });
    const baseContext = context([scenario], [failing]);
    const evaluationContext: ScenarioEligibilityContext = {
      ...baseContext,
      save: {
        ...baseContext.save,
        authoritativeState: {
          ...baseContext.save.authoritativeState,
          characters: {
            ...baseContext.save.authoritativeState.characters,
            mara_edevane: {
              ...baseContext.save.authoritativeState.characters.mara_edevane,
              availability: "dismissed",
            },
          },
        },
      },
    };
    const beforeScenario = structuredClone(scenario);
    const beforeContext = structuredClone(evaluationContext);
    const result = evaluateScenarioEligibility(scenario, evaluationContext);
    expect(result.blockingReasons.length).toBeGreaterThanOrEqual(3);
    expect(scenario).toEqual(beforeScenario);
    expect(evaluationContext).toEqual(beforeContext);
  });
});
