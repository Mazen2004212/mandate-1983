import { describe, expect, it } from "vitest";

import { contentManifestSchema } from "../../schemas/manifest";
import { runtimeScenario } from "../test/fixtures";
import { analyzeContentGraph } from ".";

function scenarioRecord(
  scenarios: readonly ReturnType<typeof runtimeScenario>[],
) {
  return Object.fromEntries(
    scenarios.map((scenario) => [scenario.id, scenario]),
  );
}

describe("content graph analysis", () => {
  it("identifies deterministic entry, terminal, and reachable nodes", () => {
    const first = runtimeScenario("scenario_graph_first", {
      followUps: ["scenario_graph_second"],
    });
    const second = runtimeScenario("scenario_graph_second", {
      predecessors: ["scenario_graph_first"],
      followUps: ["scenario_graph_third"],
    });
    const third = runtimeScenario("scenario_graph_third", {
      predecessors: ["scenario_graph_second"],
    });
    const result = analyzeContentGraph({
      scenarios: scenarioRecord([third, first, second]),
    });
    expect(result.entryScenarioIds).toEqual([first.id]);
    expect(result.terminalScenarioIds).toEqual([third.id]);
    expect(result.reachableScenarioIds).toEqual([
      first.id,
      second.id,
      third.id,
    ]);
    expect(result.valid).toBe(true);
  });

  it("reports missing references, self references, and contradictions", () => {
    const valid = runtimeScenario("scenario_graph_invalid", {
      predecessors: ["scenario_graph_missing_predecessor"],
      followUps: ["scenario_graph_missing_followup"],
      eligibility: ["condition_graph_conflict"],
      exclusions: ["condition_graph_conflict"],
    });
    const selfReferenced = {
      ...valid,
      predecessors: [valid.id],
    };
    const result = analyzeContentGraph({
      scenarios: scenarioRecord([selfReferenced]),
    });
    expect(result.findings.map((entry) => entry.code)).toEqual(
      expect.arrayContaining([
        "contradictory_conditions",
        "missing_follow_up",
        "self_reference",
      ]),
    );
    expect(result.valid).toBe(false);
  });

  it("distinguishes mandatory cycles from benign repeatable optional cycles", () => {
    const mandatoryA = runtimeScenario("scenario_mandatory_a", {
      category: "mandatory",
      predecessors: ["scenario_mandatory_b"],
    });
    const mandatoryB = runtimeScenario("scenario_mandatory_b", {
      category: "mandatory",
      predecessors: ["scenario_mandatory_a"],
    });
    const optionalA = runtimeScenario("scenario_optional_a", {
      repeatability: { repeatable: true },
      predecessors: ["scenario_optional_b"],
    });
    const optionalB = runtimeScenario("scenario_optional_b", {
      repeatability: { repeatable: true },
      predecessors: ["scenario_optional_a"],
    });
    const result = analyzeContentGraph({
      scenarios: scenarioRecord([optionalB, mandatoryB, optionalA, mandatoryA]),
    });
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "mandatory_cycle", severity: "error" }),
        expect.objectContaining({ code: "cycle", severity: "information" }),
      ]),
    );
  });

  it("detects a deterministic multi-node cycle", () => {
    const alpha = runtimeScenario("scenario_cycle_alpha", {
      predecessors: ["scenario_cycle_gamma"],
    });
    const beta = runtimeScenario("scenario_cycle_beta", {
      predecessors: ["scenario_cycle_alpha"],
    });
    const gamma = runtimeScenario("scenario_cycle_gamma", {
      predecessors: ["scenario_cycle_beta"],
    });
    const result = analyzeContentGraph({
      scenarios: scenarioRecord([gamma, alpha, beta]),
    });
    expect(result.findings).toContainEqual(
      expect.objectContaining({
        code: "cycle",
        scenarioIds: [alpha.id, beta.id, gamma.id],
      }),
    );
  });

  it("flags unreachable mandatory nodes and manifest exclusions", () => {
    const entry = runtimeScenario("scenario_manifest_entry");
    const isolatedMandatory = runtimeScenario("scenario_manifest_mandatory", {
      category: "mandatory",
      predecessors: ["scenario_manifest_excluded"],
    });
    const excluded = runtimeScenario("scenario_manifest_excluded");
    const manifest = contentManifestSchema.parse({
      id: "manifest_graph_test",
      contentVersion: "mvp-0.1.0",
      schemaVersion: "schema-1.0.0",
      releaseStatus: "published",
      minimumCompatibleSaveVersion: "save-1.0.0",
      publicationTimestamp: "1983-01-01T00:00:00.000Z",
      includedObjectIds: [entry.id, isolatedMandatory.id],
      withdrawnObjectIds: [],
      migrationRequirements: [],
      integrity: {
        algorithm: "external",
        value: "graph-test-integrity",
        suppliedBy: "test_suite",
      },
      releaseNotes: ["Test-only graph manifest."],
    });
    const result = analyzeContentGraph({
      scenarios: scenarioRecord([entry, isolatedMandatory, excluded]),
      manifest,
    });
    expect(result.findings.map((item) => item.code)).toEqual(
      expect.arrayContaining([
        "manifest_excluded",
        "missing_predecessor",
        "unreachable_mandatory",
      ]),
    );
  });

  it("returns identical ordered findings for differently ordered records", () => {
    const alpha = runtimeScenario("scenario_order_alpha", {
      followUps: ["scenario_order_missing"],
    });
    const beta = runtimeScenario("scenario_order_beta", {
      predecessors: ["scenario_order_missing"],
    });
    const forward = analyzeContentGraph({
      scenarios: scenarioRecord([alpha, beta]),
    });
    const reverse = analyzeContentGraph({
      scenarios: scenarioRecord([beta, alpha]),
    });
    expect(reverse).toEqual(forward);
  });
});
