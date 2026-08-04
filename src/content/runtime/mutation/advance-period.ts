import {
  authoritativeSaveSchema,
  periodAdvanceHistoryEntrySchema,
  type AuthoritativeSave,
  type PeriodAdvanceHistoryEntry,
} from "../../../domain";
import { CONTENT_SCHEMA_VERSION, CONTENT_VERSION } from "../../constants";

import { processDueDelayedEffects } from "./delayed-effects";
import {
  findHistoryByIdempotencyKey,
  matchesPeriodRequestIdentity,
} from "./history";
import { advancePeriodInputSchema } from "./input-schemas";
import type { MutationWorkingContext } from "./mutation-context";
import { mutationFailure, mutationIssuePath } from "./mutation-errors";
import {
  emptyMutationEvidence,
  evidenceFromReceipt,
  freezeMutationEvidence,
  type PeriodAdvanceResult,
} from "./mutation-result";

const SUPPORTED_SAVE_VERSION = "save-1.0.0";

function alreadyApplied(
  save: AuthoritativeSave,
  receipt: PeriodAdvanceHistoryEntry,
): PeriodAdvanceResult {
  return Object.freeze({
    status: "already_applied",
    save,
    fromPeriod: receipt.fromPeriod,
    toPeriod: receipt.toPeriod,
    previousRevision: receipt.expectedRevision,
    resultingRevision: receipt.resultingRevision,
    idempotencyKey: receipt.idempotencyKey,
    receipt,
    evidence: evidenceFromReceipt(receipt),
  });
}

export function advancePeriod(input: unknown): PeriodAdvanceResult {
  const envelope = advancePeriodInputSchema.safeParse(input);
  if (!envelope.success) {
    return mutationFailure(
      "invalid_input",
      envelope.error.issues.map((issue) => issue.message).join("; "),
      mutationIssuePath(envelope.error.issues[0]?.path, []),
      null,
    );
  }
  const parsedSave = authoritativeSaveSchema.safeParse(envelope.data.save);
  if (!parsedSave.success) {
    return mutationFailure(
      "invalid_save",
      parsedSave.error.issues.map((issue) => issue.message).join("; "),
      mutationIssuePath(parsedSave.error.issues[0]?.path, ["save"]),
      null,
    );
  }
  const save = parsedSave.data;
  const existing = findHistoryByIdempotencyKey(
    save,
    envelope.data.idempotencyKey,
  );
  if (existing !== undefined) {
    if (matchesPeriodRequestIdentity(existing, envelope.data)) {
      return alreadyApplied(save, existing);
    }
    return mutationFailure(
      "idempotency_conflict",
      `Idempotency key ${envelope.data.idempotencyKey} belongs to a different persisted request identity.`,
      ["idempotencyKey"],
      save,
    );
  }
  if (envelope.data.expectedRevision !== save.revision) {
    return mutationFailure(
      "revision_conflict",
      `Expected revision ${envelope.data.expectedRevision} does not match current revision ${save.revision}.`,
      ["expectedRevision"],
      save,
    );
  }
  if (envelope.data.targetPeriod !== save.politicalPeriod + 1) {
    return mutationFailure(
      "invalid_input",
      `MVP period advancement requires target period ${save.politicalPeriod + 1}.`,
      ["targetPeriod"],
      save,
    );
  }
  if (
    save.saveVersion !== SUPPORTED_SAVE_VERSION ||
    save.schemaVersion !== CONTENT_SCHEMA_VERSION ||
    save.contentVersion !== CONTENT_VERSION
  ) {
    return mutationFailure(
      "unsupported_version",
      `Save versions ${save.saveVersion}/${save.schemaVersion}/${save.contentVersion} are unsupported by this mutation engine.`,
      ["save", "saveVersion"],
      save,
    );
  }

  const context: MutationWorkingContext = {
    originalSave: save,
    registry: envelope.data.registry,
    sourceScenarioId: "period_advance",
    sourceChoiceId: "period_advance",
    sourceMutationIdempotencyKey: envelope.data.idempotencyKey,
    evaluationPeriod: envelope.data.targetPeriod,
    state: structuredClone(save.authoritativeState),
    evidence: emptyMutationEvidence(),
  };
  context.evidence.steps.push(
    "Validated one-period advancement without running TASK-09 formulas.",
  );
  const delayed = processDueDelayedEffects(context);
  if (!delayed.success) return delayed.failure;

  const resultingRevision = save.revision + 1;
  const receipt = periodAdvanceHistoryEntrySchema.safeParse({
    type: "period_advance",
    idempotencyKey: envelope.data.idempotencyKey,
    expectedRevision: save.revision,
    resultingRevision,
    fromPeriod: save.politicalPeriod,
    toPeriod: envelope.data.targetPeriod,
    advancedAt: envelope.data.advancedAt,
    appliedEffectIds: context.evidence.appliedEffectIds,
    executedDelayedEffectIds: context.evidence.executedDelayedEffectIds,
    cancelledDelayedEffectIds: context.evidence.cancelledDelayedEffectIds,
    expiredDelayedEffectIds: context.evidence.expiredDelayedEffectIds,
    failedDelayedEffectIds: context.evidence.failedDelayedEffectIds,
    scheduledMediaIds: context.evidence.scheduledMediaIds,
  });
  if (!receipt.success) {
    return mutationFailure(
      "final_validation_failure",
      receipt.error.issues.map((issue) => issue.message).join("; "),
      mutationIssuePath(receipt.error.issues[0]?.path, ["eventHistory"]),
      save,
    );
  }
  context.state.timeline.politicalPeriod = envelope.data.targetPeriod;
  context.state.eventHistory.push(receipt.data);
  context.evidence.steps.push(
    "Appended one period-advance receipt and incremented revision once.",
  );
  const finalSave = authoritativeSaveSchema.safeParse({
    ...save,
    revision: resultingRevision,
    politicalPeriod: envelope.data.targetPeriod,
    updatedAt: envelope.data.advancedAt,
    authoritativeState: context.state,
  });
  if (!finalSave.success) {
    return mutationFailure(
      "final_validation_failure",
      finalSave.error.issues.map((issue) => issue.message).join("; "),
      mutationIssuePath(finalSave.error.issues[0]?.path, ["save"]),
      save,
    );
  }
  return Object.freeze({
    status: "applied",
    save: finalSave.data,
    fromPeriod: save.politicalPeriod,
    toPeriod: envelope.data.targetPeriod,
    previousRevision: save.revision,
    resultingRevision,
    idempotencyKey: envelope.data.idempotencyKey,
    receipt: receipt.data,
    evidence: freezeMutationEvidence(context.evidence),
  });
}
