import type { RootGameState } from "../../../domain";
import {
  BASIS_POINT_STATE_FIELDS,
  MONEY_STATE_FIELDS,
  NORMALIZED_STATE_FIELDS,
} from "../../constants";

export type NormalizedStateField = (typeof NORMALIZED_STATE_FIELDS)[number];
export type BasisPointStateField = (typeof BASIS_POINT_STATE_FIELDS)[number];
export type MoneyStateField = (typeof MONEY_STATE_FIELDS)[number];

const normalizedAccessors: Readonly<
  Record<NormalizedStateField, (state: RootGameState) => number>
> = {
  "economy.currencyStability": (state) => state.economy.currencyStability,
  "economy.foodSupply": (state) => state.economy.foodSupply,
  "economy.fuelSupply": (state) => state.economy.fuelSupply,
  "economy.industrialOutput": (state) => state.economy.industrialOutput,
  "economy.agriculturalOutput": (state) => state.economy.agriculturalOutput,
  "economy.infrastructure": (state) => state.economy.infrastructure,
  "economy.corruption": (state) => state.economy.corruption,
  "economy.investorConfidence": (state) => state.economy.investorConfidence,
  "economy.consumerConfidence": (state) => state.economy.consumerConfidence,
  "government.publicApproval": (state) => state.government.publicApproval,
  "government.governmentLegitimacy": (state) =>
    state.government.governmentLegitimacy,
  "government.assemblySupport": (state) => state.government.assemblySupport,
  "government.cabinetUnity": (state) => state.government.cabinetUnity,
  "government.civilServiceEfficiency": (state) =>
    state.government.civilServiceEfficiency,
  "government.constitutionalCompliance": (state) =>
    state.government.constitutionalCompliance,
  "government.pressFreedom": (state) => state.government.pressFreedom,
  "government.electionIntegrity": (state) => state.government.electionIntegrity,
  "government.emergencyAuthority": (state) =>
    state.government.emergencyAuthority,
  "government.mediaClimate": (state) => state.government.mediaClimate,
  "security.armyLoyalty": (state) => state.security.armyLoyalty,
  "security.armyReadiness": (state) => state.security.armyReadiness,
  "security.armyAlertLevel": (state) => state.security.armyAlertLevel,
  "security.policeLoyalty": (state) => state.security.policeLoyalty,
  "security.intelligenceLoyalty": (state) => state.security.intelligenceLoyalty,
  "security.presidentialGuardLoyalty": (state) =>
    state.security.presidentialGuardLoyalty,
  "security.borderSecurity": (state) => state.security.borderSecurity,
  "security.foreignInfiltrationRisk": (state) =>
    state.security.foreignInfiltrationRisk,
  "security.borderTension": (state) => state.security.borderTension,
  "security.publicRetaliationDemand": (state) =>
    state.security.publicRetaliationDemand,
  "security.intelligenceUncertainty": (state) =>
    state.security.intelligenceUncertainty,
  "international.caldrisRelations": (state) =>
    state.international.caldrisRelations,
  "international.dromirRelations": (state) =>
    state.international.dromirRelations,
  "international.dravicaRelations": (state) =>
    state.international.dravicaRelations,
  "international.belvarRelations": (state) =>
    state.international.belvarRelations,
  "international.cyraneRelations": (state) =>
    state.international.cyraneRelations,
  "international.internationalReputation": (state) =>
    state.international.internationalReputation,
  "international.tradeAccess": (state) => state.international.tradeAccess,
  "international.diplomaticLeverage": (state) =>
    state.international.diplomaticLeverage,
  "international.foreignAidDependence": (state) =>
    state.international.foreignAidDependence,
  "international.sanctionsRisk": (state) => state.international.sanctionsRisk,
  "family.spouseTrust": (state) => state.family.spouseTrust,
  "family.daughterTrust": (state) => state.family.daughterTrust,
  "family.sonTrust": (state) => state.family.sonTrust,
  "family.siblingTrust": (state) => state.family.siblingTrust,
  "family.familyPublicReputation": (state) =>
    state.family.familyPublicReputation,
  "family.spousePublicReputation": (state) =>
    state.family.spousePublicReputation,
  "family.familyScandalRisk": (state) => state.family.familyScandalRisk,
};

const basisPointAccessors: Readonly<
  Record<BasisPointStateField, (state: RootGameState) => number>
> = {
  "economy.inflationBps": (state) => state.economy.inflationBps,
  "economy.unemploymentBps": (state) => state.economy.unemploymentBps,
  "economy.annualGrowthBps": (state) => state.economy.annualGrowthBps,
};

const moneyAccessors: Readonly<
  Record<MoneyStateField, (state: RootGameState) => bigint>
> = {
  "economy.treasuryMinor": (state) => state.economy.treasuryMinor,
  "economy.monthlyRevenueMinor": (state) => state.economy.monthlyRevenueMinor,
  "economy.monthlyExpenditureMinor": (state) =>
    state.economy.monthlyExpenditureMinor,
  "economy.monthlyDebtServiceMinor": (state) =>
    state.economy.monthlyDebtServiceMinor,
  "economy.arrearsMinor": (state) => state.economy.arrearsMinor,
  "economy.plannedArrearsPaymentMinor": (state) =>
    state.economy.plannedArrearsPaymentMinor,
  "economy.periodFinancingInflowsMinor": (state) =>
    state.economy.periodFinancingInflowsMinor,
  "economy.periodProjectOutflowsMinor": (state) =>
    state.economy.periodProjectOutflowsMinor,
};

export function readNormalizedStateField(
  state: RootGameState,
  field: NormalizedStateField,
): number {
  return normalizedAccessors[field](state);
}

export function readBasisPointStateField(
  state: RootGameState,
  field: BasisPointStateField,
): number {
  return basisPointAccessors[field](state);
}

export function readMoneyStateField(
  state: RootGameState,
  field: MoneyStateField,
): bigint {
  return moneyAccessors[field](state);
}
