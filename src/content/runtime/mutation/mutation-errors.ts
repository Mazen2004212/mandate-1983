import type { AuthoritativeSave } from "../../../domain";

export type MutationFailureCode =
  | "choice_scenario_mismatch"
  | "choice_unavailable"
  | "delayed_effect_failure"
  | "duplicate_non_repeatable_resolution"
  | "final_validation_failure"
  | "idempotency_conflict"
  | "invalid_input"
  | "invalid_save"
  | "invalid_target"
  | "missing_choice"
  | "missing_flag"
  | "missing_memory"
  | "missing_scenario"
  | "permanent_flag_removal"
  | "revision_conflict"
  | "scenario_ineligible"
  | "unit_mismatch"
  | "unknown_effect"
  | "unsupported_mutation_representation"
  | "unsupported_version";

export interface MutationFailure {
  readonly status: "failure";
  readonly code: MutationFailureCode;
  readonly path: readonly (string | number)[];
  readonly developerMessage: string;
  readonly playerMessage: string;
  readonly save: AuthoritativeSave | null;
}

export function mutationFailure(
  code: MutationFailureCode,
  developerMessage: string,
  path: readonly (string | number)[],
  save: AuthoritativeSave | null,
): MutationFailure {
  return Object.freeze({
    status: "failure",
    code,
    path: Object.freeze([...path]),
    developerMessage,
    playerMessage:
      code === "revision_conflict"
        ? "This save changed before the request could be applied. Reload and try again."
        : "The request could not be applied safely.",
    save,
  });
}

export function mutationIssuePath(
  path: readonly PropertyKey[] | undefined,
  fallback: readonly (string | number)[],
): readonly (string | number)[] {
  return (path ?? fallback).map((segment) =>
    typeof segment === "symbol" ? String(segment) : segment,
  );
}
