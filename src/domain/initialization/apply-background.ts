import { clamp100 } from "../arithmetic";
import type { PoliticalBackgroundId } from "../schemas/common/classifications";
import { normalizedScoreSchema } from "../schemas/common/numeric";
import {
  rootGameStateSchema,
  type RootGameState,
} from "../schemas/state/root-state";
import {
  DuplicatePoliticalBackgroundError,
  PoliticalBackgroundMismatchError,
} from "./initialization-errors";
import type { InitializationDraft } from "./initial-state";
import {
  POLITICAL_BACKGROUND_DEFINITIONS,
  type PoliticalBackgroundModifier,
} from "./political-backgrounds";

type CanonicalFactionId = keyof RootGameState["factions"];
type CanonicalRegionId = keyof RootGameState["regions"];

function adjustedScore(value: number, delta: number) {
  return normalizedScoreSchema.parse(clamp100(value + delta));
}

function updateFactionTrust(
  state: RootGameState,
  factionId: CanonicalFactionId,
  delta: number,
): RootGameState {
  const faction = state.factions[factionId];
  return {
    ...state,
    factions: {
      ...state.factions,
      [factionId]: {
        ...faction,
        trust: adjustedScore(faction.trust, delta),
      },
    },
  };
}

function updateRegionApproval(
  state: RootGameState,
  regionId: CanonicalRegionId,
  delta: number,
): RootGameState {
  const region = state.regions[regionId];
  return {
    ...state,
    regions: {
      ...state.regions,
      [regionId]: {
        ...region,
        approval: adjustedScore(region.approval, delta),
      },
    },
  };
}

function updateGovernorTrust(
  state: RootGameState,
  regionId: CanonicalRegionId,
  delta: number,
): RootGameState {
  const region = state.regions[regionId];
  return {
    ...state,
    regions: {
      ...state.regions,
      [regionId]: {
        ...region,
        governorTrust: adjustedScore(region.governorTrust, delta),
      },
    },
  };
}

function applyModifier(
  state: RootGameState,
  modifier: PoliticalBackgroundModifier,
): RootGameState {
  const { delta } = modifier;
  switch (modifier.target) {
    case "government.civilServiceEfficiency":
      return {
        ...state,
        government: {
          ...state.government,
          civilServiceEfficiency: adjustedScore(
            state.government.civilServiceEfficiency,
            delta,
          ),
        },
      };
    case "government.constitutionalCompliance":
      return {
        ...state,
        government: {
          ...state.government,
          constitutionalCompliance: adjustedScore(
            state.government.constitutionalCompliance,
            delta,
          ),
        },
      };
    case "government.cabinetUnity":
      return {
        ...state,
        government: {
          ...state.government,
          cabinetUnity: adjustedScore(state.government.cabinetUnity, delta),
        },
      };
    case "economy.investorConfidence":
      return {
        ...state,
        economy: {
          ...state.economy,
          investorConfidence: adjustedScore(
            state.economy.investorConfidence,
            delta,
          ),
        },
      };
    case "security.armyLoyalty":
      return {
        ...state,
        security: {
          ...state.security,
          armyLoyalty: adjustedScore(state.security.armyLoyalty, delta),
        },
      };
    case "security.policeLoyalty":
      return {
        ...state,
        security: {
          ...state.security,
          policeLoyalty: adjustedScore(state.security.policeLoyalty, delta),
        },
      };
    case "security.borderSecurity":
      return {
        ...state,
        security: {
          ...state.security,
          borderSecurity: adjustedScore(state.security.borderSecurity, delta),
        },
      };
    case "factions.civic_renewal_league.trust":
      return updateFactionTrust(state, "civic_renewal_league", delta);
    case "factions.national_stewardship_union.trust":
      return updateFactionTrust(state, "national_stewardship_union", delta);
    case "factions.workers_commonwealth.trust":
      return updateFactionTrust(state, "workers_commonwealth", delta);
    case "regions.orsanne_metropolitan_district.approval":
      return updateRegionApproval(
        state,
        "orsanne_metropolitan_district",
        delta,
      );
    case "regions.kestrel_industrial_basin.approval":
      return updateRegionApproval(state, "kestrel_industrial_basin", delta);
    case "regions.lydra_agricultural_plain.approval":
      return updateRegionApproval(state, "lydra_agricultural_plain", delta);
    case "regions.roven_marches.approval":
      return updateRegionApproval(state, "roven_marches", delta);
    case "regions.orsanne_metropolitan_district.governorTrust":
      return updateGovernorTrust(state, "orsanne_metropolitan_district", delta);
    case "regions.kestrel_industrial_basin.governorTrust":
      return updateGovernorTrust(state, "kestrel_industrial_basin", delta);
    case "regions.lydra_agricultural_plain.governorTrust":
      return updateGovernorTrust(state, "lydra_agricultural_plain", delta);
    case "regions.roven_marches.governorTrust":
      return updateGovernorTrust(state, "roven_marches", delta);
  }
}

export function applyPoliticalBackground(
  draft: InitializationDraft,
  backgroundId: PoliticalBackgroundId,
): InitializationDraft {
  if (draft.appliedBackground !== null) {
    throw new DuplicatePoliticalBackgroundError();
  }
  if (draft.authoritativeState.identity.selectedBackground !== backgroundId) {
    throw new PoliticalBackgroundMismatchError();
  }

  const definition = POLITICAL_BACKGROUND_DEFINITIONS[backgroundId];
  const modifiedState = definition.modifiers.reduce(applyModifier, {
    ...draft.authoritativeState,
  });

  return {
    authoritativeState: rootGameStateSchema.parse(modifiedState),
    appliedBackground: backgroundId,
  };
}
