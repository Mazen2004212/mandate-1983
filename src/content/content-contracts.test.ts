import { describe, expect, it } from "vitest";

import {
  APPROVED_FAMILY_TOKENS,
  buildContentRegistry,
  choiceSchema,
  compoundConditionSchema,
  contentManifestSchema,
  contentMetadataSchema,
  delayedEffectDefinitionSchema,
  effectSchema,
  epilogueContentSchema,
  factionContentSchema,
  FAMILY_TOKEN_REGISTRY,
  flagDefinitionSchema,
  lawOrMeasureContentSchema,
  mediaReactionContentSchema,
  memoryDefinitionSchema,
  moneyConditionSchema,
  normalizedScoreConditionSchema,
  outcomeContentSchema,
  scenarioSchema,
  validateFamilyTokens,
} from ".";

const metadata = {
  status: "draft",
  contentVersion: "mvp-0.1.0",
  schemaVersion: "schema-1.0.0",
  title: "Test-only fixture",
  summary: "Neutral structural fixture; not production content.",
  chapter: "prologue",
  politicalPeriod: 0,
  authoringOwner: "test_suite",
  createdAt: "1983-01-01T00:00:00.000Z",
  updatedAt: "1983-01-01T00:00:00.000Z",
  tags: ["test_only"],
  canonReferences: ["canon.story_bible"],
  systemReferences: ["system.content_architecture"],
  relatedContentIds: [],
  ratingNotes: ["Neutral test fixture."],
  originalityStatus: "unreviewed",
  changeNotes: [],
} as const;

function scenario(overrides: Record<string, unknown> = {}) {
  return {
    id: "scenario_test_fixture",
    type: "scenario",
    ...metadata,
    politicalPeriodWindow: { minimum: 0, maximum: 1 },
    category: "optional",
    priority: 1,
    urgency: 1,
    repeatability: { repeatable: false },
    location: "presidency",
    participants: ["mara_edevane"],
    requiredCharacters: ["mara_edevane"],
    knowledgeContext: ["Neutral test context."],
    eligibility: [],
    exclusions: [],
    predecessors: [],
    followUps: [],
    opening: "beat_test_opening",
    beats: [
      {
        id: "beat_test_opening",
        speaker: "mara_edevane",
        prose: "Neutral test prose.",
        knowledgeRequirementIds: [],
        conditionalVariantBeatIds: [],
        memoryVariantBeatIds: [],
        choiceTransitionIds: ["choice_test_fixture"],
      },
    ],
    choices: ["choice_test_fixture"],
    resolutionNotes: "Test-only resolution note.",
    mediaHooks: [],
    continuityRequirements: [],
    developerNotes: ["Never ship this fixture."],
    ...overrides,
  };
}

function choice(overrides: Record<string, unknown> = {}) {
  return {
    id: "choice_test_fixture",
    scenarioId: "scenario_test_fixture",
    label: "Acknowledge the test fixture",
    playerIntent: "Confirm a neutral structural choice.",
    availability: [],
    visibility: "visible",
    confirmationRequirement: "none",
    baseEffects: ["effect_test_fixture"],
    conditionalEffects: [],
    delayedEffects: [],
    memoriesCreated: [],
    flagsAdded: [],
    flagsRemoved: [],
    mediaHooks: [],
    followUpIds: [],
    costSummary: "No simulated cost.",
    developerExplanation: "Neutral test-only choice.",
    ratingNotes: ["Neutral test fixture."],
    ...overrides,
  };
}

function effect(overrides: Record<string, unknown> = {}) {
  return {
    id: "effect_test_fixture",
    type: "normalized_score_adjustment",
    targetDomain: "government",
    targetField: "government.publicApproval",
    operation: "adjust",
    value: 1,
    unit: "normalized_score",
    sourceScenarioId: "scenario_test_fixture",
    sourceChoiceId: "choice_test_fixture",
    visibility: "developer_only",
    justification: "Neutral test-only effect.",
    magnitudeClassification: "unclassified",
    applicableConditionIds: [],
    ...overrides,
  };
}

function emptyRegistry(overrides: Record<string, unknown> = {}) {
  return {
    scenarios: [],
    choices: [],
    conditions: [],
    effects: [],
    delayedEffects: [],
    memories: [],
    flags: [],
    characters: [],
    factions: [],
    regions: [],
    institutions: [],
    backgrounds: [],
    lawsAndMeasures: [],
    projects: [],
    intelligenceAssertions: [],
    mediaReactions: [],
    outcomes: [],
    epilogues: [],
    ...overrides,
  };
}

function validRegistry() {
  return emptyRegistry({
    scenarios: [scenario()],
    choices: [choice()],
    effects: [effect()],
  });
}

function manifest(overrides: Record<string, unknown> = {}) {
  return {
    id: "manifest_test_fixture",
    contentVersion: "mvp-0.1.0",
    schemaVersion: "schema-1.0.0",
    releaseStatus: "draft",
    minimumCompatibleSaveVersion: "save-1.0.0",
    includedObjectIds: ["scenario_test_fixture"],
    withdrawnObjectIds: [],
    migrationRequirements: [],
    integrity: {
      algorithm: "external",
      value: "test-integrity-value",
      suppliedBy: "test_suite",
    },
    releaseNotes: [],
    ...overrides,
  };
}

describe("common content metadata", () => {
  const valid = {
    id: "scenario_metadata_fixture",
    type: "scenario",
    ...metadata,
  };

  it("accepts strict valid metadata", () =>
    expect(contentMetadataSchema.safeParse(valid).success).toBe(true));
  it("rejects unknown properties", () =>
    expect(
      contentMetadataSchema.safeParse({ ...valid, surprise: true }).success,
    ).toBe(false));
  it("rejects invalid stable IDs", () =>
    expect(
      contentMetadataSchema.safeParse({ ...valid, id: "Bad ID" }).success,
    ).toBe(false));
  it("rejects invalid timestamps", () =>
    expect(
      contentMetadataSchema.safeParse({ ...valid, createdAt: "1983" }).success,
    ).toBe(false));
  it("rejects reversed timestamps", () =>
    expect(
      contentMetadataSchema.safeParse({
        ...valid,
        updatedAt: "1982-01-01T00:00:00.000Z",
      }).success,
    ).toBe(false));
  it("rejects unsupported lifecycle values", () =>
    expect(
      contentMetadataSchema.safeParse({ ...valid, status: "ready" }).success,
    ).toBe(false));
  it("requires publication change notes", () =>
    expect(
      contentMetadataSchema.safeParse({
        ...valid,
        status: "published",
        originalityStatus: "reviewed_original",
      }).success,
    ).toBe(false));
  it("rejects unsupported versions", () =>
    expect(
      contentMetadataSchema.safeParse({ ...valid, contentVersion: "mvp-1.0.0" })
        .success,
    ).toBe(false));
  it("rejects control characters and excessive text", () => {
    expect(
      contentMetadataSchema.safeParse({ ...valid, title: "bad\u0000text" })
        .success,
    ).toBe(false);
    expect(
      contentMetadataSchema.safeParse({ ...valid, title: "x".repeat(121) })
        .success,
    ).toBe(false);
  });
});

describe("scenarios and choices", () => {
  it("accepts a neutral scenario and its internal beat", () =>
    expect(scenarioSchema.safeParse(scenario()).success).toBe(true));
  it("rejects a missing opening beat", () =>
    expect(
      scenarioSchema.safeParse(scenario({ opening: "beat_missing" })).success,
    ).toBe(false));
  it("rejects an invalid participant", () =>
    expect(
      scenarioSchema.safeParse(scenario({ participants: ["unknown_person"] }))
        .success,
    ).toBe(false));
  it("rejects an invalid required character", () =>
    expect(
      scenarioSchema.safeParse(
        scenario({ requiredCharacters: ["unknown_person"] }),
      ).success,
    ).toBe(false));
  it("rejects direct self predecessors and follow-ups", () => {
    expect(
      scenarioSchema.safeParse(
        scenario({ predecessors: ["scenario_test_fixture"] }),
      ).success,
    ).toBe(false);
    expect(
      scenarioSchema.safeParse(
        scenario({ followUps: ["scenario_test_fixture"] }),
      ).success,
    ).toBe(false);
  });
  it("rejects invalid category and period windows", () => {
    expect(
      scenarioSchema.safeParse(scenario({ category: "meeting" })).success,
    ).toBe(false);
    expect(
      scenarioSchema.safeParse(
        scenario({ politicalPeriodWindow: { minimum: 2, maximum: 1 } }),
      ).success,
    ).toBe(false);
  });
  it("rejects unknown visibility and hidden-disabled contradictions", () => {
    expect(
      choiceSchema.safeParse(choice({ visibility: "concealed" })).success,
    ).toBe(false);
    expect(
      choiceSchema.safeParse(
        choice({
          visibility: "hidden_until_eligible",
          disabledReason: "Not available.",
        }),
      ).success,
    ).toBe(false);
  });
  it("requires a reason for a visibly disabled choice", () =>
    expect(
      choiceSchema.safeParse(choice({ visibility: "visible_but_disabled" }))
        .success,
    ).toBe(false));
});

describe("condition, effect, delayed, memory, and flag contracts", () => {
  const conditionBase = {
    id: "condition_test_fixture",
    visibility: "developer_only",
    developerFailureExplanation: "Test failure detail.",
  };

  it("accepts supported score and exact-money comparisons", () => {
    expect(
      normalizedScoreConditionSchema.safeParse({
        ...conditionBase,
        type: "normalized_score",
        field: "government.publicApproval",
        operator: "greater_than",
        unit: "normalized_score",
        expectedValue: 50,
      }).success,
    ).toBe(true);
    expect(
      moneyConditionSchema.safeParse({
        ...conditionBase,
        type: "money_minor",
        field: "economy.treasuryMinor",
        operator: "equals",
        unit: "money_minor",
        expectedValue: "0",
      }).success,
    ).toBe(true);
  });
  it("accepts all, any, and none compounds and rejects empty compounds", () => {
    for (const operator of ["all", "any", "none"] as const)
      expect(
        compoundConditionSchema.safeParse({
          ...conditionBase,
          type: "compound",
          operator,
          conditionIds: ["condition_child"],
        }).success,
      ).toBe(true);
    expect(
      compoundConditionSchema.safeParse({
        ...conditionBase,
        type: "compound",
        operator: "all",
        conditionIds: [],
      }).success,
    ).toBe(false);
  });
  it("rejects unknown fields, wrong units, invalid ranges, and callbacks", () => {
    expect(
      normalizedScoreConditionSchema.safeParse({
        ...conditionBase,
        type: "normalized_score",
        field: "government.unknown",
        operator: "equals",
        unit: "normalized_score",
        expectedValue: 1,
      }).success,
    ).toBe(false);
    expect(
      normalizedScoreConditionSchema.safeParse({
        ...conditionBase,
        type: "normalized_score",
        field: "government.publicApproval",
        operator: "equals",
        unit: "basis_points",
        expectedValue: 1,
      }).success,
    ).toBe(false);
    expect(
      normalizedScoreConditionSchema.safeParse({
        ...conditionBase,
        type: "normalized_score",
        field: "government.publicApproval",
        operator: "within_range",
        unit: "normalized_score",
        range: { minimum: 70, maximum: 20 },
      }).success,
    ).toBe(false);
    expect(
      normalizedScoreConditionSchema.safeParse({
        ...conditionBase,
        type: "normalized_score",
        field: "government.publicApproval",
        operator: "equals",
        unit: "normalized_score",
        expectedValue: 1,
        execute: () => true,
      }).success,
    ).toBe(false);
  });
  it("accepts score, signed-weight, basis-point, and exact-money effects", () => {
    expect(effectSchema.safeParse(effect()).success).toBe(true);
    expect(
      effectSchema.safeParse(
        effect({
          type: "signed_weight_adjustment",
          targetDomain: "media",
          targetField: "media.sentiment",
          value: -2,
          unit: "signed_weight",
        }),
      ).success,
    ).toBe(true);
    expect(
      effectSchema.safeParse(
        effect({
          type: "basis_point_adjustment",
          targetDomain: "economy",
          targetField: "economy.inflationBps",
          value: 25,
          unit: "basis_points",
        }),
      ).success,
    ).toBe(true);
    expect(
      effectSchema.safeParse(
        effect({
          type: "money_minor_adjustment",
          targetDomain: "economy",
          targetField: "economy.treasuryMinor",
          value: "100",
          unit: "money_minor",
        }),
      ).success,
    ).toBe(true);
  });
  it("rejects bad effect units, targets, fractions, money, and executable fields", () => {
    expect(
      effectSchema.safeParse(effect({ unit: "basis_points" })).success,
    ).toBe(false);
    expect(
      effectSchema.safeParse(effect({ targetField: "government.unknown" }))
        .success,
    ).toBe(false);
    expect(effectSchema.safeParse(effect({ value: 1.5 })).success).toBe(false);
    expect(
      effectSchema.safeParse(
        effect({
          type: "money_minor_adjustment",
          targetDomain: "economy",
          targetField: "economy.treasuryMinor",
          value: "01",
          unit: "money_minor",
        }),
      ).success,
    ).toBe(false);
    expect(
      effectSchema.safeParse(effect({ callback: () => undefined })).success,
    ).toBe(false);
  });
  it("enforces unambiguous delayed timing and closed statuses", () => {
    const delayed = {
      id: "delayed_test_fixture",
      sourceScenarioId: "scenario_test_fixture",
      sourceChoiceId: "choice_test_fixture",
      creationPeriod: 0,
      triggerPeriod: 1,
      priority: 1,
      payload: ["effect_test_fixture"],
      prerequisites: [],
      cancellationConditions: [],
      expiryConditions: [],
      idempotencyScope: "choice",
      status: "pending",
      failureBehavior: "mark_failed",
      followUpContentIds: [],
      developerExplanation: "Neutral delayed fixture.",
    };
    expect(delayedEffectDefinitionSchema.safeParse(delayed).success).toBe(true);
    expect(
      delayedEffectDefinitionSchema.safeParse({
        ...delayed,
        triggerPeriod: undefined,
        relativeDelay: 1,
      }).success,
    ).toBe(true);
    expect(
      delayedEffectDefinitionSchema.safeParse({ ...delayed, relativeDelay: 1 })
        .success,
    ).toBe(false);
    expect(
      delayedEffectDefinitionSchema.safeParse({
        ...delayed,
        triggerPeriod: undefined,
        relativeDelay: -1,
      }).success,
    ).toBe(false);
    expect(
      delayedEffectDefinitionSchema.safeParse({ ...delayed, status: "queued" })
        .success,
    ).toBe(false);
  });
  it("enforces memory decay and flag permanence", () => {
    const memory = {
      id: "memory_test_fixture",
      subjectId: "mara_edevane",
      targetId: "president",
      sourceScenarioId: "scenario_test_fixture",
      emotionalWeight: 0,
      politicalWeight: 0,
      visibility: "hidden",
      creationPeriod: 0,
      decayRatePerPeriod: 0,
      permanent: true,
      dialogueInfluenceTags: [],
      eventInfluenceTags: [],
      outcomeInfluenceTags: [],
      stackingRule: "reject_duplicate",
      developerDescription: "Neutral test memory.",
    };
    expect(memoryDefinitionSchema.safeParse(memory).success).toBe(true);
    expect(
      memoryDefinitionSchema.safeParse({ ...memory, decayRatePerPeriod: 1 })
        .success,
    ).toBe(false);
    expect(
      memoryDefinitionSchema.safeParse({
        ...memory,
        permanent: false,
        decayRatePerPeriod: 1,
      }).success,
    ).toBe(true);
    const flag = {
      id: "flag_test_fixture",
      description: "Neutral factual test flag.",
      visibility: "hidden",
      creationSources: [{ scenarioId: "scenario_test_fixture" }],
      removalSources: [],
      permanence: true,
      compatibilityNotes: [],
    };
    expect(flagDefinitionSchema.safeParse(flag).success).toBe(true);
    expect(
      flagDefinitionSchema.safeParse({
        ...flag,
        removalSources: [{ scenarioId: "scenario_test_fixture" }],
      }).success,
    ).toBe(false);
  });
});

describe("family token contract", () => {
  it("registers and accepts every approved token", () => {
    expect(Object.keys(FAMILY_TOKEN_REGISTRY)).toEqual([
      ...APPROVED_FAMILY_TOKENS,
    ]);
    expect(
      validateFamilyTokens(APPROVED_FAMILY_TOKENS.join(" ")).issues,
    ).toHaveLength(0);
  });
  it("rejects unknown and malformed double-brace syntax", () => {
    expect(
      validateFamilyTokens("{{president.middleName}}").issues[0]?.code,
    ).toBe("unknown_family_token");
    expect(validateFamilyTokens("{{president.firstName}").issues[0]?.code).toBe(
      "malformed_family_token",
    );
  });
  it("keeps Unicode values and markup-like strings inert without substitution", () => {
    const input =
      "Ana-María <script>test()</script> {literal} {{spouse.firstName}}";
    const result = validateFamilyTokens(input);
    expect(result.tokens).toEqual(["{{spouse.firstName}}"]);
    expect(input).toContain("Ana-María <script>");
  });
});

describe("entity contracts", () => {
  it("accepts canonical factions and rejects unknown factions", () => {
    const fixture = {
      id: "civic_renewal_league",
      type: "faction",
      ...metadata,
      publicPosition: "Neutral test position.",
      priorities: [],
      regionalBases: [],
    };
    expect(factionContentSchema.safeParse(fixture).success).toBe(true);
    expect(
      factionContentSchema.safeParse({ ...fixture, id: "unknown_faction" })
        .success,
    ).toBe(false);
  });
  it("rejects invalid media scores and fiscal serialization", () => {
    const media = {
      id: "media_test_fixture",
      type: "media_reaction",
      ...metadata,
      outletId: "orsanne_ledger",
      sourceEventId: "scenario_test_fixture",
      knownFacts: [],
      editorialFrame: "Neutral frame.",
      headline: "Test fixture headline",
      sentiment: 0,
      reach: 50,
      credibility: 50,
      publicationPeriod: 0,
      publicKnowledgeRequirements: [],
      leakRequirements: [],
      factionImplications: [],
      regionalImplications: [],
      relatedScenarioId: "scenario_test_fixture",
    };
    expect(
      mediaReactionContentSchema.safeParse({ ...media, reach: 101 }).success,
    ).toBe(false);
    const law = {
      id: "law_test_fixture",
      type: "law_or_measure",
      ...metadata,
      policyType: "law",
      publicSummary: "Neutral summary.",
      legalAuthority: "Test authority.",
      sponsor: "mara_edevane",
      requiredApprovals: [],
      politicalCost: 1,
      fiscalCostMinor: "01",
      recurringCostMinor: null,
      implementationPeriod: 0,
      affectedDomains: [],
      immediateEffects: [],
      delayedEffects: [],
      factionReactions: [],
      regionalEffects: [],
      constitutionalConsiderations: "Test consideration.",
      cancellationBehavior: "Test behavior.",
      completionBehavior: "Test behavior.",
      compatibilityNotes: [],
    };
    expect(lawOrMeasureContentSchema.safeParse(law).success).toBe(false);
  });
  it("accepts exact canonical outcomes and rejects unknown outcomes", () => {
    const outcome = {
      id: "mvp_civic_stabilization",
      type: "outcome",
      ...metadata,
      eligibility: [],
      selectionPriority: 1,
      publicTitle: "Test outcome",
      narrativeTone: "Neutral test tone.",
      contributingValueReferences: [],
      requiredFlags: [],
      excludedFlags: [],
      epilogueReferences: [],
      developerExplanation: "Neutral test explanation.",
      compatibilityNotes: [],
    };
    expect(outcomeContentSchema.safeParse(outcome).success).toBe(true);
    expect(
      outcomeContentSchema.safeParse({ ...outcome, id: "unknown_outcome" })
        .success,
    ).toBe(false);
  });
  it("requires epilogues to use a canonical outcome ID structurally", () => {
    const epilogue = {
      id: "epilogue_test_fixture",
      type: "epilogue",
      ...metadata,
      subject: "mara_edevane",
      outcomeId: "unknown_outcome",
      eligibility: [],
      exclusions: [],
      prose: "Neutral test prose.",
      knowledgeRequirements: [],
      continuityRequirements: [],
      priority: 1,
      fallback: true,
    };
    expect(epilogueContentSchema.safeParse(epilogue).success).toBe(false);
  });
});

describe("registry and manifest", () => {
  it("builds deterministic immutable lookup independent of insertion order", () => {
    const first = buildContentRegistry(validRegistry());
    const second = buildContentRegistry(
      emptyRegistry({
        scenarios: [scenario()],
        effects: [effect()],
        choices: [choice()],
      }),
    );
    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    if (first.success && second.success) {
      expect(Object.keys(first.registry)).toEqual(Object.keys(second.registry));
      expect(Object.isFrozen(first.registry)).toBe(true);
      expect(Object.isFrozen(first.registry.scenarios)).toBe(true);
    }
  });
  it("rejects duplicate local and global IDs", () => {
    const local = buildContentRegistry(
      emptyRegistry({ effects: [effect(), effect()] }),
    );
    expect(local.success && true).toBe(false);
    if (!local.success)
      expect(local.issues.some((issue) => issue.code === "duplicate_id")).toBe(
        true,
      );
    const global = buildContentRegistry(
      emptyRegistry({
        conditions: [
          {
            id: "shared_fixture",
            type: "compound",
            visibility: "developer_only",
            developerFailureExplanation: "Test.",
            operator: "all",
            conditionIds: ["shared_fixture"],
          },
        ],
        effects: [effect({ id: "shared_fixture" })],
      }),
    );
    expect(global.success && true).toBe(false);
    if (!global.success)
      expect(
        global.issues.some((issue) => issue.code === "global_id_collision"),
      ).toBe(true);
  });
  it("rejects missing choice, effect, and source references with precise paths", () => {
    const result = buildContentRegistry(
      emptyRegistry({ scenarios: [scenario()] }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.issues.some((issue) => issue.code === "missing_reference"),
      ).toBe(true);
      expect(result.issues[0]?.path.length).toBeGreaterThan(2);
    }
  });
  it("rejects unknown input groups and unknown canonical references", () => {
    expect(
      buildContentRegistry({ ...emptyRegistry(), widgets: [] }).success,
    ).toBe(false);
    expect(
      scenarioSchema.safeParse(scenario({ canonReferences: ["canon.unknown"] }))
        .success,
    ).toBe(false);
    expect(
      scenarioSchema.safeParse(
        scenario({ systemReferences: ["system.unknown"] }),
      ).success,
    ).toBe(false);
  });
  it("accepts a strict compatible manifest and rejects duplicates or overlap", () => {
    expect(contentManifestSchema.safeParse(manifest()).success).toBe(true);
    expect(
      contentManifestSchema.safeParse(
        manifest({
          includedObjectIds: ["scenario_test_fixture", "scenario_test_fixture"],
        }),
      ).success,
    ).toBe(false);
    expect(
      contentManifestSchema.safeParse(
        manifest({ withdrawnObjectIds: ["scenario_test_fixture"] }),
      ).success,
    ).toBe(false);
  });
  it("rejects invalid compatibility, status, and missing published notes", () => {
    expect(
      contentManifestSchema.safeParse(
        manifest({
          minimumCompatibleSaveVersion: "save-2.0.0",
          maximumCompatibleSaveVersion: "save-1.0.0",
        }),
      ).success,
    ).toBe(false);
    expect(
      contentManifestSchema.safeParse(manifest({ releaseStatus: "ready" }))
        .success,
    ).toBe(false);
    expect(
      contentManifestSchema.safeParse(
        manifest({
          releaseStatus: "published",
          publicationTimestamp: "1983-01-01T00:00:00.000Z",
        }),
      ).success,
    ).toBe(false);
  });
  it("rejects a missing included object and draft content in a published manifest", () => {
    const missing = buildContentRegistry({
      ...validRegistry(),
      manifest: manifest({ includedObjectIds: ["scenario_missing"] }),
    });
    expect(missing.success).toBe(false);
    const published = buildContentRegistry({
      ...validRegistry(),
      manifest: manifest({
        releaseStatus: "published",
        publicationTimestamp: "1983-01-01T00:00:00.000Z",
        releaseNotes: ["Test release note."],
      }),
    });
    expect(published.success).toBe(false);
    if (!published.success)
      expect(
        published.issues.some(
          (issue) => issue.code === "lifecycle_incompatible",
        ),
      ).toBe(true);
  });
});
