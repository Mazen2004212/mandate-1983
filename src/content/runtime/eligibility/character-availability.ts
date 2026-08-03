import {
  FAMILY_ROLE_IDS,
  type CharacterAvailability,
  type RootGameState,
} from "../../../domain";
export type ScenarioParticipantId = string;

export interface CharacterAvailabilityResult {
  readonly participantId: string;
  readonly participantKind: "canonical_character" | "family_role";
  readonly exists: boolean;
  readonly available: boolean;
  readonly actualAvailability:
    CharacterAvailability | "active_family_role" | null;
  readonly permittedAvailabilities: readonly CharacterAvailability[];
  readonly developerExplanation: string;
  readonly playerExplanation: string | null;
}

function isFamilyRole(participantId: string): boolean {
  return FAMILY_ROLE_IDS.some((roleId) => roleId === participantId);
}

export function evaluateCharacterAvailability(
  participantId: ScenarioParticipantId,
  state: RootGameState,
  permittedAvailabilities: readonly CharacterAvailability[] = ["active"],
): CharacterAvailabilityResult {
  const permitted = Object.freeze([...permittedAvailabilities]);
  if (isFamilyRole(participantId)) {
    return Object.freeze({
      participantId,
      participantKind: "family_role",
      exists: true,
      available: true,
      actualAvailability: "active_family_role",
      permittedAvailabilities: permitted,
      developerExplanation: `Stable family role ${participantId} resolves through family identity and has no separate availability field.`,
      playerExplanation: null,
    });
  }

  const entry = Object.entries(state.characters).find(
    ([characterId]) => characterId === participantId,
  )?.[1];
  if (entry === undefined) {
    return Object.freeze({
      participantId,
      participantKind: "canonical_character",
      exists: false,
      available: false,
      actualAvailability: null,
      permittedAvailabilities: permitted,
      developerExplanation: `Character ${participantId} is absent from authoritative character state.`,
      playerExplanation: "A required participant is unavailable.",
    });
  }

  const available = permitted.includes(entry.availability);
  return Object.freeze({
    participantId,
    participantKind: "canonical_character",
    exists: true,
    available,
    actualAvailability: entry.availability,
    permittedAvailabilities: permitted,
    developerExplanation: available
      ? `Character ${participantId} is ${entry.availability}, which is permitted.`
      : `Character ${participantId} is ${entry.availability}; permitted states are ${permitted.join(", ")}.`,
    playerExplanation: available
      ? null
      : "A required participant is unavailable.",
  });
}
