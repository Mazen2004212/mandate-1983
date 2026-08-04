import { describe, expect, it } from "vitest";

import {
  authoritativeSaveSchema,
  flagIdSchema,
  memoryStateSchema,
  projectIdSchema,
} from "../../../domain";
import {
  MUTATION_CHOICE_ID,
  MUTATION_EFFECT_ID,
  MUTATION_SCENARIO_ID,
  basisPointEffect,
  characterAvailabilityEffect,
  delayedDefinition,
  factionRegionalInfluenceEffect,
  factionScoreEffect,
  lawOrMeasureMembershipEffect,
  mediaReaction,
  memoryWeightEffect,
  moneyEffect,
  mutationFlag,
  mutationLaw,
  mutationMemory,
  mutationProject,
  mutationRegistry,
  mutationSave,
  mutationScenario,
  normalizedCondition,
  normalizedEffect,
  regionBasisPointEffect,
  regionProjectMembershipEffect,
  regionScoreEffect,
  relationshipScoreEffect,
  resolveInput,
  schedulingEffect,
} from "./test/fixtures";
import { resolveChoice } from "./resolve-choice";

function expectFailure(result: ReturnType<typeof resolveChoice>, code: string) {
  expect(result.status).toBe("failure");
  if (result.status === "failure") expect(result.code).toBe(code);
}

function freezeTestValue(value: unknown): void {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return;
  }
  Object.values(value).forEach(freezeTestValue);
  Object.freeze(value);
}

function saveWithRuntimeMemory(
  overrides: Readonly<Record<string, unknown>> = {},
) {
  const save = mutationSave();
  save.authoritativeState.memories.push(
    memoryStateSchema.parse({
      id: "memory_mutation_test",
      subjectId: "mara_edevane",
      targetId: "president",
      sourceScenarioId: MUTATION_SCENARIO_ID,
      sourceChoiceId: MUTATION_CHOICE_ID,
      emotionalWeight: 5,
      politicalWeight: 5,
      visibility: "hidden",
      creationPeriod: 0,
      decayRatePerPeriod: 0,
      permanent: true,
      dialogueInfluenceTags: ["mutation_test"],
      eventInfluenceTags: [],
      outcomeInfluenceTags: [],
      ...overrides,
    }),
  );
  return save;
}

describe("atomic choice resolution", () => {
  it("applies a choice atomically, increments one revision, and validates the result", () => {
    const save = mutationSave();
    const result = resolveChoice(resolveInput(save));

    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.previousRevision).toBe(0);
    expect(result.resultingRevision).toBe(1);
    expect(result.scenarioId).toBe(MUTATION_SCENARIO_ID);
    expect(result.choiceId).toBe(MUTATION_CHOICE_ID);
    expect(result.save.authoritativeState.government.publicApproval).toBe(54);
    expect(result.save.authoritativeState.eventHistory).toEqual([
      result.receipt,
    ]);
    expect(result.receipt.appliedEffectIds).toEqual([MUTATION_EFFECT_ID]);
    expect(authoritativeSaveSchema.safeParse(result.save).success).toBe(true);
    expect(save).toEqual(mutationSave());
  });

  it("rejects malformed envelopes and invalid saves with structured failures", () => {
    expectFailure(resolveChoice({}), "invalid_input");
    expectFailure(
      resolveChoice({ ...resolveInput(), unknownProperty: true }),
      "invalid_input",
    );
    expectFailure(
      resolveChoice({ ...resolveInput(), resolvedAt: "January 2, 1983" }),
      "invalid_input",
    );
    expectFailure(
      resolveChoice({ ...resolveInput(), save: { invalid: true } }),
      "invalid_save",
    );
    const registry = mutationRegistry();
    expectFailure(
      resolveChoice({
        ...resolveInput(mutationSave(), registry),
        registry: Object.freeze({
          ...registry,
          effects: { ...registry.effects },
        }),
      }),
      "invalid_input",
    );
  });

  it("rejects stale revisions after checking persisted idempotency", () => {
    const input = resolveInput();
    expectFailure(
      resolveChoice({ ...input, expectedRevision: input.expectedRevision + 1 }),
      "revision_conflict",
    );
  });

  it("rejects unsupported save, schema, and content versions", () => {
    for (const patch of [
      { saveVersion: "save-2.0.0" },
      { schemaVersion: "schema-2.0.0" },
      { contentVersion: "mvp-0.2.0" },
    ]) {
      expectFailure(
        resolveChoice({
          ...resolveInput(),
          save: { ...mutationSave(), ...patch },
        }),
        "unsupported_version",
      );
    }
  });

  it("rejects missing scenarios and choices", () => {
    expectFailure(
      resolveChoice({ ...resolveInput(), scenarioId: "scenario_absent" }),
      "missing_scenario",
    );
    expectFailure(
      resolveChoice({ ...resolveInput(), choiceId: "choice_absent" }),
      "missing_choice",
    );
  });

  it("rejects a choice resolved against a different valid scenario", () => {
    const other = mutationScenario({
      id: "scenario_other",
      opening: "beat_other",
      beats: [
        {
          id: "beat_other",
          prose: "Other neutral scenario.",
          knowledgeRequirementIds: [],
          conditionalVariantBeatIds: [],
          memoryVariantBeatIds: [],
          choiceTransitionIds: [],
        },
      ],
      choices: [],
    });
    const registry = mutationRegistry({ additionalScenarios: [other] });
    expectFailure(
      resolveChoice({
        ...resolveInput(mutationSave(), registry),
        scenarioId: "scenario_other",
      }),
      "choice_scenario_mismatch",
    );
  });

  it("rejects ineligible scenarios and unavailable choices", () => {
    const ineligible = mutationRegistry({
      scenarioOverrides: { politicalPeriodWindow: { minimum: 1, maximum: 6 } },
    });
    expectFailure(
      resolveChoice(resolveInput(mutationSave(), ineligible)),
      "scenario_ineligible",
    );

    const unavailable = mutationRegistry({
      choiceOverrides: { availability: ["condition_unavailable"] },
      conditions: [normalizedCondition("condition_unavailable", 100)],
    });
    expectFailure(
      resolveChoice(resolveInput(mutationSave(), unavailable)),
      "choice_unavailable",
    );
  });

  it("rejects a second resolution of a non-repeatable scenario", () => {
    const first = resolveChoice(resolveInput());
    expect(first.status).toBe("applied");
    if (first.status !== "applied") return;
    expectFailure(
      resolveChoice({
        ...resolveInput(first.save),
        idempotencyKey: "mutation_request_002",
        resolvedAt: "1983-01-03T00:00:00.000Z",
      }),
      "duplicate_non_repeatable_resolution",
    );
  });

  it("returns a stable already-applied receipt even when the current revision is newer", () => {
    const input = resolveInput();
    const first = resolveChoice(input);
    expect(first.status).toBe("applied");
    if (first.status !== "applied") return;
    const retry = resolveChoice({ ...input, save: first.save });
    expect(retry.status).toBe("already_applied");
    if (retry.status !== "already_applied") return;
    expect(retry.receipt).toEqual(first.receipt);
    expect(retry.resultingRevision).toBe(first.resultingRevision);
    expect(retry.save).toEqual(first.save);
  });

  it("detects reuse of an idempotency key with a different request identity", () => {
    const input = resolveInput();
    const first = resolveChoice(input);
    expect(first.status).toBe("applied");
    if (first.status !== "applied") return;
    expectFailure(
      resolveChoice({
        ...input,
        save: first.save,
        choiceId: "choice_absent",
      }),
      "idempotency_conflict",
    );
  });

  it("does not leak partial changes when final save validation fails", () => {
    const save = mutationSave();
    const before = structuredClone(save);
    const result = resolveChoice({
      ...resolveInput(save),
      resolvedAt: "1982-12-31T00:00:00.000Z",
    });
    expectFailure(result, "final_validation_failure");
    expect(save).toEqual(before);
  });

  it("does not mutate inputs or the immutable content registry", () => {
    const save = mutationSave();
    const registry = mutationRegistry();
    const beforeSave = structuredClone(save);
    const beforeRegistry = structuredClone(registry);
    resolveChoice(resolveInput(save, registry));
    expect(save).toEqual(beforeSave);
    expect(registry).toEqual(beforeRegistry);
    expect(Object.isFrozen(registry)).toBe(true);
  });
});

describe("deterministic effect application", () => {
  it("clamps normalized scores to their authoritative range", () => {
    const registry = mutationRegistry({
      effects: [normalizedEffect({ value: 100 })],
    });
    const result = resolveChoice(resolveInput(mutationSave(), registry));
    expect(result.status).toBe("applied");
    if (result.status === "applied") {
      expect(result.save.authoritativeState.government.publicApproval).toBe(
        100,
      );
    }
  });

  it("clamps normalized scores at the lower authoritative bound", () => {
    const registry = mutationRegistry({
      effects: [normalizedEffect({ value: -100 })],
    });
    const result = resolveChoice(resolveInput(mutationSave(), registry));
    expect(result.status).toBe("applied");
    if (result.status === "applied") {
      expect(result.save.authoritativeState.government.publicApproval).toBe(0);
    }
  });

  it("rejects wrong units and unknown closed targets at registry validation", () => {
    expect(() =>
      mutationRegistry({
        effects: [normalizedEffect({ unit: "basis_points" })],
      }),
    ).toThrow();
    expect(() =>
      mutationRegistry({
        effects: [
          normalizedEffect({ targetField: "government.unknownTarget" }),
        ],
      }),
    ).toThrow();
  });

  it("applies basis-point and positive and negative MoneyMinor adjustments", () => {
    const effects = [
      basisPointEffect("effect_inflation"),
      moneyEffect("effect_money_in", "100"),
      moneyEffect("effect_money_out", "-40"),
    ];
    const registry = mutationRegistry({
      choiceOverrides: { baseEffects: effects.map((effect) => effect.id) },
      effects,
    });
    const result = resolveChoice(resolveInput(mutationSave(), registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.save.authoritativeState.economy.inflationBps).toBe(1145);
    expect(result.save.authoritativeState.economy.treasuryMinor).toBe(
      4_800_000_060n,
    );
  });

  it("updates canonical character availability", () => {
    const effect = characterAvailabilityEffect("effect_character");
    const registry = mutationRegistry({
      choiceOverrides: { baseEffects: [effect.id] },
      effects: [effect],
    });
    const result = resolveChoice(resolveInput(mutationSave(), registry));
    expect(result.status).toBe("applied");
    if (result.status === "applied") {
      expect(
        result.save.authoritativeState.characters.mara_edevane.availability,
      ).toBe("unavailable");
    }
  });

  it("applies and skips conditional effects at their declared timing", () => {
    const before = normalizedEffect({ id: "effect_before", value: 2 });
    const after = normalizedEffect({ id: "effect_after", value: 3 });
    const skipped = normalizedEffect({ id: "effect_skipped", value: 50 });
    const condition = normalizedCondition("condition_after", 50);
    const impossible = normalizedCondition("condition_impossible", 100);
    const registry = mutationRegistry({
      choiceOverrides: {
        baseEffects: [],
        conditionalEffects: [
          {
            effectId: before.id,
            requiredConditionIds: [],
            excludedConditionIds: [],
            evaluationTiming: "before_base_effects",
            stackingRule: "reject_duplicate",
            developerExplanation: "Apply before base effects.",
          },
          {
            effectId: after.id,
            requiredConditionIds: [condition.id],
            excludedConditionIds: [],
            evaluationTiming: "after_base_effects",
            stackingRule: "reject_duplicate",
            developerExplanation: "Apply after base effects.",
          },
          {
            effectId: skipped.id,
            requiredConditionIds: [impossible.id],
            excludedConditionIds: [],
            evaluationTiming: "after_relationship_updates",
            stackingRule: "reject_duplicate",
            developerExplanation: "Skip after relationship updates.",
          },
        ],
      },
      conditions: [condition, impossible],
      effects: [before, after, skipped],
    });
    const result = resolveChoice(resolveInput(mutationSave(), registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.save.authoritativeState.government.publicApproval).toBe(54);
    expect(result.receipt.appliedEffectIds).toEqual([
      "effect_before",
      "effect_after",
    ]);
    expect(result.evidence.skippedEffectIds).toEqual(["effect_skipped"]);
  });

  it("evaluates after-memory conditionals against the newly created memory", () => {
    const memory = mutationMemory();
    const effect = normalizedEffect({ id: "effect_after_memory", value: 6 });
    const condition = {
      id: "condition_memory_exists",
      type: "reference",
      referenceKind: "memory",
      referenceId: memory.id,
      operator: "exists",
      visibility: "developer_only",
      developerFailureExplanation: "Expected the new memory.",
    };
    const registry = mutationRegistry({
      choiceOverrides: {
        baseEffects: [],
        memoriesCreated: [memory.id],
        conditionalEffects: [
          {
            effectId: effect.id,
            requiredConditionIds: [condition.id],
            excludedConditionIds: [],
            evaluationTiming: "after_memory_creation",
            stackingRule: "reject_duplicate",
            developerExplanation: "Apply after memory creation.",
          },
        ],
      },
      conditions: [condition],
      effects: [effect],
      memories: [memory],
    });
    const result = resolveChoice(resolveInput(mutationSave(), registry));
    expect(result.status).toBe("applied");
    if (result.status === "applied") {
      expect(result.save.authoritativeState.government.publicApproval).toBe(55);
      expect(result.receipt.appliedEffectIds).toEqual([effect.id]);
    }
  });

  it("creates memory and mutates flags without duplicate identifiers", () => {
    const memory = mutationMemory();
    const flag = mutationFlag();
    const registry = mutationRegistry({
      choiceOverrides: {
        memoriesCreated: [memory.id],
        flagsAdded: [flag.id],
      },
      memories: [memory],
      flags: [flag],
    });
    const result = resolveChoice(resolveInput(mutationSave(), registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.save.authoritativeState.memories.map(({ id }) => id)).toEqual(
      [memory.id],
    );
    expect(
      result.save.authoritativeState.characters.mara_edevane.memoryIds,
    ).toContain(memory.id);
    expect(
      result.save.authoritativeState.relationships.mara_edevane
        .permanentMemoryIds,
    ).toContain(memory.id);
    expect(result.save.authoritativeState.flags).toEqual([flag.id]);
    expect(result.receipt.createdMemoryIds).toEqual([memory.id]);
    expect(result.receipt.addedFlagIds).toEqual([flag.id]);
  });

  it("removes a removable registered flag", () => {
    const flag = mutationFlag();
    const save = mutationSave();
    save.authoritativeState.flags.push(flagIdSchema.parse(flag.id));
    const registry = mutationRegistry({
      choiceOverrides: { flagsRemoved: [flag.id] },
      flags: [flag],
    });
    const result = resolveChoice(resolveInput(save, registry));
    expect(result.status).toBe("applied");
    if (result.status === "applied") {
      expect(result.save.authoritativeState.flags).not.toContain(flag.id);
      expect(result.receipt.removedFlagIds).toEqual([flag.id]);
    }
  });

  it("rejects permanent flag removal atomically", () => {
    const flag = mutationFlag({ permanence: true, removalSources: [] });
    const save = mutationSave();
    save.authoritativeState.flags.push(flagIdSchema.parse(flag.id));
    const before = structuredClone(save);
    const registry = mutationRegistry({
      choiceOverrides: { flagsRemoved: [flag.id] },
      flags: [flag],
    });
    expectFailure(
      resolveChoice(resolveInput(save, registry)),
      "permanent_flag_removal",
    );
    expect(save).toEqual(before);
  });

  it("schedules delayed snapshots and media through authored identifiers", () => {
    const delayedEffect = normalizedEffect({ id: "effect_delayed", value: 7 });
    const delayed = delayedDefinition("delayed_mutation_test", [
      delayedEffect.id,
    ]);
    const media = mediaReaction();
    const registry = mutationRegistry({
      choiceOverrides: {
        baseEffects: [],
        delayedEffects: [delayed.id],
        mediaHooks: [media.id],
      },
      effects: [delayedEffect],
      delayedEffects: [delayed],
      mediaReactions: [media],
    });
    const result = resolveChoice(resolveInput(mutationSave(), registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.save.authoritativeState.delayedEffects[0]).toMatchObject({
      id: delayed.id,
      definitionContentVersion: "mvp-0.1.0",
      sourceMutationIdempotencyKey: "mutation_request_001",
      triggerPeriod: 1,
      effectIds: [delayedEffect.id],
      status: "pending",
    });
    expect(result.save.authoritativeState.media).toEqual([media.id]);
  });

  it("supports scheduling effect definitions without generating IDs", () => {
    const effect = schedulingEffect(
      "effect_schedule_delayed",
      "schedule_delayed_effect",
      "delayed_effect",
      "delayed_scheduled",
    );
    const delayed = delayedDefinition("delayed_scheduled", [effect.id]);
    const registry = mutationRegistry({
      choiceOverrides: { baseEffects: [effect.id] },
      effects: [effect],
      delayedEffects: [delayed],
    });
    const result = resolveChoice(resolveInput(mutationSave(), registry));
    expect(result.status).toBe("applied");
    if (result.status === "applied") {
      expect(result.save.authoritativeState.delayedEffects[0]?.id).toBe(
        delayed.id,
      );
    }
  });

  it("adjusts relationship scores and records the applied effect", () => {
    const effect = relationshipScoreEffect("effect_relationship");
    const registry = mutationRegistry({
      choiceOverrides: { baseEffects: [effect.id] },
      effects: [effect],
    });
    const result = resolveChoice(resolveInput(mutationSave(), registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(
      result.save.authoritativeState.relationships.mara_edevane.trust,
    ).toBe(55);
    expect(result.receipt.appliedEffectIds).toEqual([effect.id]);
  });

  it("returns a stable retry receipt without reapplying a typed relationship effect", () => {
    const effect = relationshipScoreEffect("effect_relationship_retry");
    const registry = mutationRegistry({
      choiceOverrides: { baseEffects: [effect.id] },
      effects: [effect],
    });
    const input = resolveInput(mutationSave(), registry);
    const applied = resolveChoice(input);
    expect(applied.status).toBe("applied");
    if (applied.status !== "applied") return;

    const retry = resolveChoice({ ...input, save: applied.save });
    expect(retry.status).toBe("already_applied");
    if (retry.status !== "already_applied") return;
    expect(retry.receipt).toEqual(applied.receipt);
    expect(retry.save.authoritativeState.relationships.mara_edevane.trust).toBe(
      55,
    );
    expect(retry.save).toEqual(applied.save);
  });

  it.each([
    [100, 100],
    [-100, 0],
  ])("clamps relationship trust delta %i to %i", (value, expected) => {
    const effect = relationshipScoreEffect("effect_relationship_clamp", {
      value,
    });
    const registry = mutationRegistry({
      choiceOverrides: { baseEffects: [effect.id] },
      effects: [effect],
    });
    const result = resolveChoice(resolveInput(mutationSave(), registry));
    expect(result.status).toBe("applied");
    if (result.status === "applied") {
      expect(
        result.save.authoritativeState.relationships.mara_edevane.trust,
      ).toBe(expected);
    }
  });

  it("fails atomically when optional affection is absent", () => {
    const save = mutationSave();
    const before = structuredClone(save);
    const effect = relationshipScoreEffect("effect_affection", {
      field: "affection",
    });
    const registry = mutationRegistry({
      choiceOverrides: { baseEffects: [effect.id] },
      effects: [effect],
    });
    expectFailure(
      resolveChoice(resolveInput(save, registry)),
      "invalid_target",
    );
    expect(save).toEqual(before);
  });

  it("adjusts faction scores and faction regional influence", () => {
    const effects = [
      factionScoreEffect("effect_faction", { value: 6 }),
      factionRegionalInfluenceEffect("effect_faction_region", { value: -7 }),
    ];
    const registry = mutationRegistry({
      choiceOverrides: { baseEffects: effects.map(({ id }) => id) },
      effects,
    });
    const result = resolveChoice(resolveInput(mutationSave(), registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    const faction =
      result.save.authoritativeState.factions.civic_renewal_league;
    expect(faction.support).toBe(56);
    expect(faction.regionalInfluence.orsanne_metropolitan_district).toBe(43);
    expect(result.receipt.appliedEffectIds).toEqual(
      effects.map(({ id }) => id),
    );
  });

  it("adjusts regional scores and regional unemployment basis points", () => {
    const effects = [
      regionScoreEffect("effect_region", { value: -8 }),
      regionBasisPointEffect("effect_region_unemployment", { value: 125 }),
    ];
    const registry = mutationRegistry({
      choiceOverrides: { baseEffects: effects.map(({ id }) => id) },
      effects,
    });
    const result = resolveChoice(resolveInput(mutationSave(), registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    const region =
      result.save.authoritativeState.regions.orsanne_metropolitan_district;
    expect(region.approval).toBe(42);
    expect(region.unemploymentBps).toBe(1025);
  });

  it("rejects regional unemployment outside its final authoritative range", () => {
    const save = mutationSave();
    const before = structuredClone(save);
    const effect = regionBasisPointEffect("effect_region_invalid", {
      value: 4_000,
    });
    const registry = mutationRegistry({
      choiceOverrides: { baseEffects: [effect.id] },
      effects: [effect],
    });
    expectFailure(
      resolveChoice(resolveInput(save, registry)),
      "invalid_target",
    );
    expect(save).toEqual(before);
  });

  it("applies family normalized-score adjustments through the closed family field", () => {
    const effect = normalizedEffect({
      id: "effect_family",
      targetDomain: "family",
      targetField: "family.spouseTrust",
      value: 5,
    });
    const registry = mutationRegistry({
      choiceOverrides: { baseEffects: [effect.id] },
      effects: [effect],
    });
    const result = resolveChoice(resolveInput(mutationSave(), registry));
    expect(result.status).toBe("applied");
    if (result.status === "applied") {
      expect(result.save.authoritativeState.family.spouseTrust).toBe(67);
    }
  });

  it.each([
    ["emotionalWeight", 10],
    ["politicalWeight", 10],
  ])("adjusts existing memory %s", (field, expected) => {
    const memory = mutationMemory();
    const effect = memoryWeightEffect(
      field === "emotionalWeight"
        ? "effect_memory_emotional_weight"
        : "effect_memory_political_weight",
      { field },
    );
    const registry = mutationRegistry({
      choiceOverrides: { baseEffects: [effect.id] },
      effects: [effect],
      memories: [memory],
    });
    const result = resolveChoice(
      resolveInput(saveWithRuntimeMemory(), registry),
    );
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    const storedMemory = result.save.authoritativeState.memories[0];
    expect(storedMemory).toBeDefined();
    if (storedMemory !== undefined) {
      expect(Reflect.get(storedMemory, field)).toBe(expected);
    }
  });

  it.each([
    [95, 20, 100],
    [-95, -20, -100],
  ])(
    "clamps signed memory weight %i plus %i to %i",
    (initial, value, expected) => {
      const memory = mutationMemory();
      const effect = memoryWeightEffect("effect_memory_clamp", { value });
      const registry = mutationRegistry({
        choiceOverrides: { baseEffects: [effect.id] },
        effects: [effect],
        memories: [memory],
      });
      const result = resolveChoice(
        resolveInput(
          saveWithRuntimeMemory({ emotionalWeight: initial }),
          registry,
        ),
      );
      expect(result.status).toBe("applied");
      if (result.status === "applied") {
        expect(
          result.save.authoritativeState.memories[0]?.emotionalWeight,
        ).toBe(expected);
      }
    },
  );

  it("adds a regional project once when the add effect is repeated against membership", () => {
    const project = mutationProject();
    const effect = regionProjectMembershipEffect("effect_project_add", "add");
    const save = mutationSave();
    save.authoritativeState.regions.orsanne_metropolitan_district.activeProjectIds.push(
      projectIdSchema.parse(project.id),
    );
    const registry = mutationRegistry({
      choiceOverrides: { baseEffects: [effect.id] },
      effects: [effect],
      projects: [project],
    });
    const result = resolveChoice(resolveInput(save, registry));
    expect(result.status).toBe("applied");
    if (result.status === "applied") {
      expect(
        result.save.authoritativeState.regions.orsanne_metropolitan_district
          .activeProjectIds,
      ).toEqual([project.id]);
    }
  });

  it("adds and removes regional project membership deterministically", () => {
    const project = mutationProject();
    const add = regionProjectMembershipEffect("effect_project_add", "add");
    const addRegistry = mutationRegistry({
      choiceOverrides: { baseEffects: [add.id] },
      effects: [add],
      projects: [project],
    });
    const added = resolveChoice(resolveInput(mutationSave(), addRegistry));
    expect(added.status).toBe("applied");
    if (added.status !== "applied") return;
    expect(
      added.save.authoritativeState.regions.orsanne_metropolitan_district
        .activeProjectIds,
    ).toEqual([project.id]);

    const remove = regionProjectMembershipEffect(
      "effect_project_remove",
      "remove",
    );
    const removeRegistry = mutationRegistry({
      choiceOverrides: { baseEffects: [remove.id] },
      effects: [remove],
      projects: [project],
      scenarioOverrides: { repeatability: { repeatable: true } },
    });
    const removed = resolveChoice({
      ...resolveInput(added.save, removeRegistry),
      idempotencyKey: "mutation_request_project_remove",
      resolvedAt: "1983-01-03T00:00:00.000Z",
    });
    expect(removed.status).toBe("applied");
    if (removed.status === "applied") {
      expect(
        removed.save.authoritativeState.regions.orsanne_metropolitan_district
          .activeProjectIds,
      ).toEqual([]);
    }
  });

  it("treats removal of an absent regional project as an idempotent no-op", () => {
    const project = mutationProject();
    const effect = regionProjectMembershipEffect(
      "effect_project_remove_absent",
      "remove",
    );
    const registry = mutationRegistry({
      choiceOverrides: { baseEffects: [effect.id] },
      effects: [effect],
      projects: [project],
    });
    const result = resolveChoice(resolveInput(mutationSave(), registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(
      result.save.authoritativeState.regions.orsanne_metropolitan_district
        .activeProjectIds,
    ).toEqual([]);
    expect(result.receipt.appliedEffectIds).toEqual([effect.id]);
  });

  it("fails an unknown project defensively without mutating the save", () => {
    const project = mutationProject();
    const effect = regionProjectMembershipEffect(
      "effect_project_unknown",
      "add",
    );
    const validRegistry = mutationRegistry({
      choiceOverrides: { baseEffects: [effect.id] },
      effects: [effect],
      projects: [project],
    });
    const corruptedRegistry = {
      ...validRegistry,
      projects: {},
    };
    freezeTestValue(corruptedRegistry);
    const save = mutationSave();
    const before = structuredClone(save);
    expectFailure(
      resolveChoice(resolveInput(save, corruptedRegistry)),
      "invalid_target",
    );
    expect(save).toEqual(before);
  });

  it("adds and removes registered law membership with idempotent absent removal", () => {
    const law = mutationLaw();
    const add = lawOrMeasureMembershipEffect("effect_law_add", "add");
    const registry = mutationRegistry({
      choiceOverrides: { baseEffects: [add.id] },
      effects: [add],
      lawsAndMeasures: [law],
    });
    const added = resolveChoice(resolveInput(mutationSave(), registry));
    expect(added.status).toBe("applied");
    if (added.status !== "applied") return;
    expect(added.save.authoritativeState.lawsAndMeasures).toEqual([law.id]);

    const remove = lawOrMeasureMembershipEffect("effect_law_remove", "remove");
    const removeRegistry = mutationRegistry({
      scenarioOverrides: { repeatability: { repeatable: true } },
      choiceOverrides: { baseEffects: [remove.id] },
      effects: [remove],
      lawsAndMeasures: [law],
    });
    const removed = resolveChoice({
      ...resolveInput(added.save, removeRegistry),
      idempotencyKey: "mutation_request_law_remove",
      resolvedAt: "1983-01-03T00:00:00.000Z",
    });
    expect(removed.status).toBe("applied");
    if (removed.status === "applied") {
      expect(removed.save.authoritativeState.lawsAndMeasures).toEqual([]);
    }
  });

  it("produces the same result for identical deterministic inputs", () => {
    const inputA = resolveInput();
    const inputB = resolveInput();
    expect(resolveChoice(inputA)).toEqual(resolveChoice(inputB));
  });
});
