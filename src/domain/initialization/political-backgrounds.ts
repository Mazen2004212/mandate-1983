import type { PoliticalBackgroundId } from "../schemas/common/classifications";

export type PoliticalBackgroundModifierTarget =
  | "government.civilServiceEfficiency"
  | "government.constitutionalCompliance"
  | "government.cabinetUnity"
  | "economy.investorConfidence"
  | "security.armyLoyalty"
  | "security.policeLoyalty"
  | "security.borderSecurity"
  | "factions.civic_renewal_league.trust"
  | "factions.national_stewardship_union.trust"
  | "factions.workers_commonwealth.trust"
  | "regions.orsanne_metropolitan_district.approval"
  | "regions.kestrel_industrial_basin.approval"
  | "regions.lydra_agricultural_plain.approval"
  | "regions.roven_marches.approval"
  | "regions.orsanne_metropolitan_district.governorTrust"
  | "regions.kestrel_industrial_basin.governorTrust"
  | "regions.lydra_agricultural_plain.governorTrust"
  | "regions.roven_marches.governorTrust";

export interface PoliticalBackgroundModifier {
  readonly target: PoliticalBackgroundModifierTarget;
  readonly delta: number;
}

export interface PoliticalBackgroundDefinition {
  readonly id: PoliticalBackgroundId;
  readonly modifiers: readonly PoliticalBackgroundModifier[];
}

function modifier(
  target: PoliticalBackgroundModifierTarget,
  delta: number,
): PoliticalBackgroundModifier {
  return Object.freeze({ target, delta });
}

function defineBackground(
  id: PoliticalBackgroundId,
  modifiers: readonly PoliticalBackgroundModifier[],
): PoliticalBackgroundDefinition {
  return Object.freeze({ id, modifiers: Object.freeze(modifiers) });
}

export const POLITICAL_BACKGROUND_DEFINITIONS = Object.freeze({
  civil_service_reformer: defineBackground("civil_service_reformer", [
    modifier("government.civilServiceEfficiency", 5),
    modifier("government.constitutionalCompliance", 3),
    modifier("factions.civic_renewal_league.trust", 5),
    modifier("factions.national_stewardship_union.trust", -2),
  ]),
  provincial_governor: defineBackground("provincial_governor", [
    modifier("regions.lydra_agricultural_plain.approval", 4),
    modifier("regions.roven_marches.approval", 4),
    modifier("regions.orsanne_metropolitan_district.governorTrust", 3),
    modifier("regions.kestrel_industrial_basin.governorTrust", 3),
    modifier("regions.lydra_agricultural_plain.governorTrust", 3),
    modifier("regions.roven_marches.governorTrust", 3),
    modifier("factions.national_stewardship_union.trust", 3),
    modifier("regions.orsanne_metropolitan_district.approval", -2),
  ]),
  labor_mediator: defineBackground("labor_mediator", [
    modifier("factions.workers_commonwealth.trust", 6),
    modifier("regions.kestrel_industrial_basin.approval", 4),
    modifier("government.cabinetUnity", 3),
    modifier("economy.investorConfidence", -3),
  ]),
  security_committee_chair: defineBackground("security_committee_chair", [
    modifier("security.armyLoyalty", 4),
    modifier("security.policeLoyalty", 3),
    modifier("security.borderSecurity", 5),
    modifier("factions.national_stewardship_union.trust", 4),
    modifier("factions.civic_renewal_league.trust", -3),
  ]),
} satisfies Record<PoliticalBackgroundId, PoliticalBackgroundDefinition>);
