import { roundNearest, weightedAverage } from "../arithmetic";
import { CANONICAL_FACTION_IDS } from "../constants/canonical-ids";
import type { z } from "zod";

import { canonicalOutcomeIdSchema } from "../ids/identifier-schemas";
import {
  rootGameStateSchema,
  type RootGameState,
} from "../schemas/state/root-state";
import { calculateEconomicDerivedScores } from "./economy";
import {
  calculateAverageFactionTrust,
  calculateAverageRegionalUnrest,
  calculateFamilyUnity,
  calculateForeignLeverage,
  calculateSecurityMetrics,
} from "./political";

type CanonicalOutcomeId = z.infer<typeof canonicalOutcomeIdSchema>;

export interface OutcomeScores {
  readonly institutionalScore: number;
  readonly orderScore: number;
  readonly resilienceScore: number;
}

export interface OutcomeEligibility {
  readonly civicStabilization: boolean;
  readonly orderedEmergency: boolean;
  readonly fracturedMandate: boolean;
}

export interface OutcomeResolution {
  readonly selectedOutcomeId: CanonicalOutcomeId;
  readonly resolvedAtPeriod: number;
  readonly scores: OutcomeScores;
  readonly eligibility: OutcomeEligibility;
  readonly contributingValues: Readonly<Record<string, number | boolean>>;
  readonly explanation: string;
}

export function calculateOutcomeScores(
  stateInput: RootGameState,
): OutcomeScores {
  const state = rootGameStateSchema.parse(stateInput);
  const economy = calculateEconomicDerivedScores(state.economy);
  const averageFactionTrust = calculateAverageFactionTrust(state.factions);
  const averageRegionalUnrest = calculateAverageRegionalUnrest(state.regions);
  const averageRegionalApproval = roundNearest(
    Object.values(state.regions).reduce(
      (sum, region) => sum + region.approval,
      0,
    ),
    4,
  );
  const security = calculateSecurityMetrics(
    state.security,
    state.government.governmentLegitimacy,
    averageRegionalUnrest,
    state.international.dravicaRelations,
  );
  const familyUnity = calculateFamilyUnity(state.family);
  const foreignLeverage = calculateForeignLeverage(
    state.international,
    security.borderStability,
  );
  return {
    institutionalScore: weightedAverage([
      { value: state.government.governmentLegitimacy, weight: 20 },
      { value: state.government.constitutionalCompliance, weight: 20 },
      { value: state.government.cabinetUnity, weight: 15 },
      { value: state.government.assemblySupport, weight: 15 },
      { value: state.government.civilServiceEfficiency, weight: 10 },
      { value: state.government.electionIntegrity, weight: 10 },
      { value: averageFactionTrust, weight: 10 },
    ]),
    orderScore: weightedAverage([
      { value: 100 - averageRegionalUnrest, weight: 20 },
      { value: state.security.armyLoyalty, weight: 15 },
      { value: state.security.policeLoyalty, weight: 15 },
      { value: state.security.intelligenceLoyalty, weight: 15 },
      { value: state.security.borderSecurity, weight: 10 },
      { value: state.government.governmentLegitimacy, weight: 15 },
      { value: state.government.cabinetUnity, weight: 10 },
    ]),
    resilienceScore: weightedAverage([
      { value: economy.supplyStability, weight: 20 },
      { value: economy.fiscalSolvency, weight: 15 },
      { value: state.economy.consumerConfidence, weight: 10 },
      { value: state.economy.investorConfidence, weight: 10 },
      { value: averageRegionalApproval, weight: 15 },
      { value: familyUnity, weight: 10 },
      { value: foreignLeverage, weight: 10 },
      { value: state.government.cabinetUnity, weight: 10 },
    ]),
  };
}

export function resolveMvpOutcome(input: {
  readonly state: RootGameState;
  readonly chapterOneComplete: boolean;
}): OutcomeResolution | null {
  const state = rootGameStateSchema.parse(input.state);
  if (!input.chapterOneComplete) return null;
  const scores = calculateOutcomeScores(state);
  const averageRegionalUnrest = calculateAverageRegionalUnrest(state.regions);
  const economy = calculateEconomicDerivedScores(state.economy);
  const security = calculateSecurityMetrics(
    state.security,
    state.government.governmentLegitimacy,
    averageRegionalUnrest,
    state.international.dravicaRelations,
  );
  const trustedFactionCount = CANONICAL_FACTION_IDS.filter(
    (id) => state.factions[id].trust >= 45,
  ).length;
  const severeConstitutionalBreachAbsent = !state.flags.some(
    (flag) => String(flag) === "severe_constitutional_breach",
  );
  const securityCommandBreakdownAbsent = !state.flags.some(
    (flag) => String(flag) === "security_command_breakdown",
  );
  const civicStabilization =
    scores.institutionalScore >= 60 &&
    state.government.constitutionalCompliance >= 55 &&
    averageRegionalUnrest <= 55 &&
    trustedFactionCount >= 2 &&
    severeConstitutionalBreachAbsent;
  const orderedEmergency =
    !civicStabilization &&
    scores.orderScore >= 62 &&
    state.government.emergencyAuthority >= 50 &&
    security.borderEscalation <= 70 &&
    economy.supplyStability >= 40 &&
    securityCommandBreakdownAbsent;
  const eligibility = {
    civicStabilization,
    orderedEmergency,
    fracturedMandate: !civicStabilization && !orderedEmergency,
  };
  const selectedOutcomeId: CanonicalOutcomeId = canonicalOutcomeIdSchema.parse(
    civicStabilization
      ? "mvp_civic_stabilization"
      : orderedEmergency
        ? "mvp_ordered_emergency"
        : "mvp_fractured_mandate",
  );
  const contributingValues = {
    chapterOneComplete: true,
    institutionalScore: scores.institutionalScore,
    orderScore: scores.orderScore,
    resilienceScore: scores.resilienceScore,
    constitutionalCompliance: state.government.constitutionalCompliance,
    averageRegionalUnrest,
    trustedFactionCount,
    severeConstitutionalBreachAbsent,
    emergencyAuthority: state.government.emergencyAuthority,
    borderEscalation: security.borderEscalation,
    supplyStability: economy.supplyStability,
    securityCommandBreakdownAbsent,
  };
  return {
    selectedOutcomeId,
    resolvedAtPeriod: state.timeline.politicalPeriod,
    scores,
    eligibility,
    contributingValues,
    explanation: `${selectedOutcomeId} selected by civic > ordered > fallback priority from validated Chapter 1 state.`,
  };
}
