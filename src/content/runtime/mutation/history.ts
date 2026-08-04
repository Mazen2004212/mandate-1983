import type {
  AuthoritativeSave,
  ChoiceResolutionHistoryEntry,
  MutationHistoryEntry,
  PeriodAdvanceHistoryEntry,
} from "../../../domain";

export function findHistoryByIdempotencyKey(
  save: AuthoritativeSave,
  idempotencyKey: string,
): MutationHistoryEntry | undefined {
  return save.authoritativeState.eventHistory.find(
    (entry) => entry.idempotencyKey === idempotencyKey,
  );
}

export function matchesChoiceRequestIdentity(
  receipt: MutationHistoryEntry,
  input: {
    readonly idempotencyKey: string;
    readonly scenarioId: string;
    readonly choiceId: string;
    readonly expectedRevision: number;
    readonly resolvedAt: string;
  },
): receipt is ChoiceResolutionHistoryEntry {
  return (
    receipt.type === "choice_resolution" &&
    receipt.idempotencyKey === input.idempotencyKey &&
    receipt.scenarioId === input.scenarioId &&
    receipt.choiceId === input.choiceId &&
    receipt.expectedRevision === input.expectedRevision &&
    receipt.resolvedAt === input.resolvedAt
  );
}

export function matchesPeriodRequestIdentity(
  receipt: MutationHistoryEntry,
  input: {
    readonly idempotencyKey: string;
    readonly expectedRevision: number;
    readonly targetPeriod: number;
    readonly advancedAt: string;
  },
): receipt is PeriodAdvanceHistoryEntry {
  return (
    receipt.type === "period_advance" &&
    receipt.idempotencyKey === input.idempotencyKey &&
    receipt.expectedRevision === input.expectedRevision &&
    receipt.toPeriod === input.targetPeriod &&
    receipt.advancedAt === input.advancedAt
  );
}
