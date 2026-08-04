import type { DelayedEffectRuntimeState } from "../../../domain";
import { compareAscii } from "../common";
import { evaluateConditionById } from "../conditions";

import { applyEffectById } from "./apply-effect";
import {
  pushUnique,
  scheduleRegisteredFollowUp,
  workingSave,
  type MutationWorkingContext,
} from "./mutation-context";
import { mutationFailure, type MutationFailure } from "./mutation-errors";

export type DelayedProcessingResult =
  | { readonly success: true }
  | { readonly success: false; readonly failure: MutationFailure };

function orderedDueEffects(
  effects: readonly DelayedEffectRuntimeState[],
  targetPeriod: number,
): readonly DelayedEffectRuntimeState[] {
  return effects
    .filter(
      (effect) =>
        effect.status === "pending" && effect.triggerPeriod <= targetPeriod,
    )
    .sort(
      (left, right) =>
        left.triggerPeriod - right.triggerPeriod ||
        right.priority - left.priority ||
        compareAscii(left.id, right.id),
    );
}

function conditionResults(
  ids: readonly string[],
  context: MutationWorkingContext,
) {
  const save = workingSave(context);
  return ids.map((conditionId) =>
    evaluateConditionById(conditionId, {
      save,
      chapter:
        context.registry.scenarios[context.sourceScenarioId]?.chapter ??
        "prologue",
      registry: context.registry,
    }),
  );
}

function restoreEvidence(
  context: MutationWorkingContext,
  snapshot: MutationWorkingContext["evidence"],
): void {
  context.evidence = snapshot;
}

function handleExecutionFailure(
  effect: DelayedEffectRuntimeState,
  context: MutationWorkingContext,
  stateBefore: MutationWorkingContext["state"],
  evidenceBefore: MutationWorkingContext["evidence"],
  failure: MutationFailure,
): DelayedProcessingResult {
  context.state = stateBefore;
  restoreEvidence(context, evidenceBefore);
  const runtime = context.state.delayedEffects.find(
    (entry) => entry.id === effect.id && entry.status === "pending",
  );
  if (runtime === undefined) {
    return {
      success: false,
      failure: mutationFailure(
        "delayed_effect_failure",
        `Delayed effect ${effect.id} disappeared during rollback.`,
        ["delayedEffects", effect.id],
        context.originalSave,
      ),
    };
  }
  if (effect.failureBehavior === "cancel") {
    runtime.status = "cancelled";
    pushUnique(context.evidence.cancelledDelayedEffectIds, effect.id);
    return { success: true };
  }
  if (effect.failureBehavior === "mark_failed") {
    runtime.status = "failed";
    pushUnique(context.evidence.failedDelayedEffectIds, effect.id);
    return { success: true };
  }
  return {
    success: false,
    failure: mutationFailure(
      "delayed_effect_failure",
      `Blocking delayed effect ${effect.id} failed: ${failure.developerMessage}`,
      ["delayedEffects", effect.id],
      context.originalSave,
    ),
  };
}

export function processDueDelayedEffects(
  context: MutationWorkingContext,
): DelayedProcessingResult {
  const previouslyFailed = context.state.delayedEffects.find(
    (effect) => effect.status === "failed",
  );
  if (previouslyFailed !== undefined) {
    return {
      success: false,
      failure: mutationFailure(
        "delayed_effect_failure",
        `Failed delayed effect ${previouslyFailed.id} blocks safe period advancement.`,
        ["delayedEffects", previouslyFailed.id, "status"],
        context.originalSave,
      ),
    };
  }
  for (const effect of orderedDueEffects(
    context.state.delayedEffects,
    context.evaluationPeriod,
  )) {
    const runtime = context.state.delayedEffects.find(
      (entry) => entry.id === effect.id && entry.status === "pending",
    );
    if (runtime === undefined) continue;
    const sourceContext: MutationWorkingContext = {
      ...context,
      sourceScenarioId: runtime.sourceScenarioId,
      sourceChoiceId: runtime.sourceChoiceId,
      sourceMutationIdempotencyKey: runtime.sourceMutationIdempotencyKey,
    };
    if (
      runtime.definitionContentVersion !== context.originalSave.contentVersion
    ) {
      return {
        success: false,
        failure: mutationFailure(
          "delayed_effect_failure",
          `Delayed effect ${runtime.id} snapshot content version is incompatible.`,
          ["delayedEffects", runtime.id, "definitionContentVersion"],
          context.originalSave,
        ),
      };
    }
    const allConditionIds = [
      ...runtime.prerequisiteConditionIds,
      ...runtime.cancellationConditionIds,
      ...runtime.expiryConditionIds,
    ];
    const missingCondition = allConditionIds.find(
      (conditionId) => context.registry.conditions[conditionId] === undefined,
    );
    if (missingCondition !== undefined) {
      const stateBefore = structuredClone(context.state);
      const evidenceBefore = structuredClone(context.evidence);
      const handled = handleExecutionFailure(
        runtime,
        sourceContext,
        stateBefore,
        evidenceBefore,
        mutationFailure(
          "delayed_effect_failure",
          `Delayed effect ${runtime.id} references missing condition ${missingCondition}.`,
          ["delayedEffects", runtime.id, "prerequisiteConditionIds"],
          context.originalSave,
        ),
      );
      context.state = sourceContext.state;
      context.evidence = sourceContext.evidence;
      if (!handled.success) return handled;
      continue;
    }
    const cancellations = conditionResults(
      runtime.cancellationConditionIds,
      sourceContext,
    );
    cancellations.forEach((result) =>
      context.evidence.conditionExplanations.push(result.developerExplanation),
    );
    if (cancellations.some((result) => result.passed)) {
      runtime.status = "cancelled";
      pushUnique(context.evidence.cancelledDelayedEffectIds, runtime.id);
      continue;
    }
    const expiries = conditionResults(
      runtime.expiryConditionIds,
      sourceContext,
    );
    expiries.forEach((result) =>
      context.evidence.conditionExplanations.push(result.developerExplanation),
    );
    if (expiries.some((result) => result.passed)) {
      runtime.status = "expired";
      pushUnique(context.evidence.expiredDelayedEffectIds, runtime.id);
      continue;
    }
    const prerequisites = conditionResults(
      runtime.prerequisiteConditionIds,
      sourceContext,
    );
    prerequisites.forEach((result) =>
      context.evidence.conditionExplanations.push(result.developerExplanation),
    );
    if (prerequisites.some((result) => !result.passed)) continue;

    const stateBefore = structuredClone(context.state);
    const evidenceBefore = structuredClone(context.evidence);
    let executionFailure: MutationFailure | null = null;
    for (const effectId of runtime.effectIds) {
      const result = applyEffectById(effectId, sourceContext);
      if (!result.success) {
        executionFailure = result.failure;
        break;
      }
    }
    if (executionFailure === null) {
      for (const followUpId of runtime.followUpContentIds) {
        const failure = scheduleRegisteredFollowUp(followUpId, sourceContext);
        if (failure !== null) {
          executionFailure = failure;
          break;
        }
      }
    }
    if (executionFailure !== null) {
      const handled = handleExecutionFailure(
        runtime,
        sourceContext,
        stateBefore,
        evidenceBefore,
        executionFailure,
      );
      context.state = sourceContext.state;
      context.evidence = sourceContext.evidence;
      if (!handled.success) return handled;
      continue;
    }
    context.state = sourceContext.state;
    context.evidence = sourceContext.evidence;
    const completed = context.state.delayedEffects.find(
      (entry) => entry.id === runtime.id && entry.status === "pending",
    );
    if (completed === undefined) {
      return {
        success: false,
        failure: mutationFailure(
          "delayed_effect_failure",
          `Delayed effect ${runtime.id} disappeared during execution.`,
          ["delayedEffects", runtime.id],
          context.originalSave,
        ),
      };
    }
    completed.status = "executed";
    pushUnique(context.evidence.executedDelayedEffectIds, completed.id);
  }
  return { success: true };
}
