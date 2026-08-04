import type {
  AuthoritativeSave,
  ChoiceResolutionHistoryEntry,
  MutationHistoryEntry,
  PeriodAdvanceHistoryEntry,
} from "../../../domain";

import type { MutationFailure } from "./mutation-errors";

export interface MutationEvidence {
  readonly appliedEffectIds: readonly string[];
  readonly skippedEffectIds: readonly string[];
  readonly createdMemoryIds: readonly string[];
  readonly addedFlagIds: readonly string[];
  readonly removedFlagIds: readonly string[];
  readonly scheduledDelayedEffectIds: readonly string[];
  readonly scheduledMediaIds: readonly string[];
  readonly executedDelayedEffectIds: readonly string[];
  readonly cancelledDelayedEffectIds: readonly string[];
  readonly expiredDelayedEffectIds: readonly string[];
  readonly failedDelayedEffectIds: readonly string[];
  readonly conditionExplanations: readonly string[];
  readonly steps: readonly string[];
}

export interface MutationSuccess<
  TReceipt extends MutationHistoryEntry = MutationHistoryEntry,
> {
  readonly status: "applied" | "already_applied";
  readonly save: AuthoritativeSave;
  readonly previousRevision: number;
  readonly resultingRevision: number;
  readonly idempotencyKey: string;
  readonly receipt: TReceipt;
  readonly evidence: MutationEvidence;
}

export interface ChoiceResolutionSuccess extends MutationSuccess<ChoiceResolutionHistoryEntry> {
  readonly scenarioId: ChoiceResolutionHistoryEntry["scenarioId"];
  readonly choiceId: ChoiceResolutionHistoryEntry["choiceId"];
}

export interface PeriodAdvanceSuccess extends MutationSuccess<PeriodAdvanceHistoryEntry> {
  readonly fromPeriod: PeriodAdvanceHistoryEntry["fromPeriod"];
  readonly toPeriod: PeriodAdvanceHistoryEntry["toPeriod"];
}

export type ChoiceResolutionResult = ChoiceResolutionSuccess | MutationFailure;

export type PeriodAdvanceResult = PeriodAdvanceSuccess | MutationFailure;

export function emptyMutationEvidence(): MutableMutationEvidence {
  return {
    appliedEffectIds: [],
    skippedEffectIds: [],
    createdMemoryIds: [],
    addedFlagIds: [],
    removedFlagIds: [],
    scheduledDelayedEffectIds: [],
    scheduledMediaIds: [],
    executedDelayedEffectIds: [],
    cancelledDelayedEffectIds: [],
    expiredDelayedEffectIds: [],
    failedDelayedEffectIds: [],
    conditionExplanations: [],
    steps: [],
  };
}

export interface MutableMutationEvidence {
  appliedEffectIds: string[];
  skippedEffectIds: string[];
  createdMemoryIds: string[];
  addedFlagIds: string[];
  removedFlagIds: string[];
  scheduledDelayedEffectIds: string[];
  scheduledMediaIds: string[];
  executedDelayedEffectIds: string[];
  cancelledDelayedEffectIds: string[];
  expiredDelayedEffectIds: string[];
  failedDelayedEffectIds: string[];
  conditionExplanations: string[];
  steps: string[];
}

export function freezeMutationEvidence(
  evidence: MutableMutationEvidence,
): MutationEvidence {
  return Object.freeze({
    appliedEffectIds: Object.freeze([...evidence.appliedEffectIds]),
    skippedEffectIds: Object.freeze([...evidence.skippedEffectIds]),
    createdMemoryIds: Object.freeze([...evidence.createdMemoryIds]),
    addedFlagIds: Object.freeze([...evidence.addedFlagIds]),
    removedFlagIds: Object.freeze([...evidence.removedFlagIds]),
    scheduledDelayedEffectIds: Object.freeze([
      ...evidence.scheduledDelayedEffectIds,
    ]),
    scheduledMediaIds: Object.freeze([...evidence.scheduledMediaIds]),
    executedDelayedEffectIds: Object.freeze([
      ...evidence.executedDelayedEffectIds,
    ]),
    cancelledDelayedEffectIds: Object.freeze([
      ...evidence.cancelledDelayedEffectIds,
    ]),
    expiredDelayedEffectIds: Object.freeze([
      ...evidence.expiredDelayedEffectIds,
    ]),
    failedDelayedEffectIds: Object.freeze([...evidence.failedDelayedEffectIds]),
    conditionExplanations: Object.freeze([...evidence.conditionExplanations]),
    steps: Object.freeze([...evidence.steps]),
  });
}

export function evidenceFromReceipt(
  receipt: MutationHistoryEntry,
): MutationEvidence {
  const evidence = emptyMutationEvidence();
  evidence.appliedEffectIds.push(...receipt.appliedEffectIds);
  evidence.scheduledMediaIds.push(...receipt.scheduledMediaIds);
  if (receipt.type === "choice_resolution") {
    evidence.createdMemoryIds.push(...receipt.createdMemoryIds);
    evidence.addedFlagIds.push(...receipt.addedFlagIds);
    evidence.removedFlagIds.push(...receipt.removedFlagIds);
    evidence.scheduledDelayedEffectIds.push(
      ...receipt.scheduledDelayedEffectIds,
    );
  } else {
    evidence.executedDelayedEffectIds.push(...receipt.executedDelayedEffectIds);
    evidence.cancelledDelayedEffectIds.push(
      ...receipt.cancelledDelayedEffectIds,
    );
    evidence.expiredDelayedEffectIds.push(...receipt.expiredDelayedEffectIds);
    evidence.failedDelayedEffectIds.push(...receipt.failedDelayedEffectIds);
  }
  evidence.steps.push("Returned the persisted mutation receipt unchanged.");
  return freezeMutationEvidence(evidence);
}
