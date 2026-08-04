import {
  approach,
  clamp100,
  clampBigInt,
  roundNearest,
  roundNearestBigInt,
  weightedAverage,
} from "../arithmetic";
import { CANONICAL_REGION_IDS } from "../constants/canonical-ids";
import {
  factionStateSchema,
  factionsStateSchema,
  type FactionState,
  type FactionsState,
} from "../schemas/state/factions";
import { familyStateSchema, type FamilyState } from "../schemas/state/family";
import {
  governmentStateSchema,
  type GovernmentState,
} from "../schemas/state/government";
import {
  internationalStateSchema,
  type InternationalState,
} from "../schemas/state/international";
import { memoryStateSchema, type MemoryState } from "../schemas/state/memories";
import {
  regionStateSchema,
  regionsStateSchema,
  type RegionState,
  type RegionsState,
} from "../schemas/state/regions";
import {
  relationshipStateSchema,
  type RelationshipState,
} from "../schemas/state/relationships";
import {
  securityStateSchema,
  type SecurityState,
} from "../schemas/state/security";

type CanonicalFactionId = keyof FactionsState;
type CanonicalRegionId = keyof RegionsState;

function score(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value < 0 || value > 100) {
    throw new RangeError(`${name} must be an integer in 0..100.`);
  }
  return value;
}

export function calculateAverageFactionTrust(factions: FactionsState): number {
  const parsedFactions = factionsStateSchema.parse(factions);
  return roundNearest(
    parsedFactions.civic_renewal_league.trust +
      parsedFactions.national_stewardship_union.trust +
      parsedFactions.workers_commonwealth.trust,
    3,
  );
}

export function calculateGovernmentProjection(input: {
  readonly government: GovernmentState;
  readonly factions: FactionsState;
  readonly regions: RegionsState;
  readonly consumerConfidence: number;
  readonly supplyStability: number;
  readonly familyPublicReputation: number;
  readonly ministerRelationships: readonly RelationshipState[];
}): {
  readonly averageFactionTrust: number;
  readonly legitimacyTarget: number;
  readonly nextGovernmentLegitimacy: number;
  readonly averageRegionalApproval: number;
  readonly publicApprovalTarget: number;
  readonly nextPublicApproval: number;
  readonly averageMinisterTrust: number;
  readonly averageMinisterRespect: number;
  readonly cabinetUnityTarget: number;
  readonly nextCabinetUnity: number;
} {
  const government = governmentStateSchema.parse(input.government);
  const regions = regionsStateSchema.parse(input.regions);
  score(input.consumerConfidence, "consumerConfidence");
  score(input.supplyStability, "supplyStability");
  score(input.familyPublicReputation, "familyPublicReputation");
  if (input.ministerRelationships.length === 0) {
    throw new RangeError(
      "ministerRelationships must contain every currently serving minister.",
    );
  }
  const ministers = input.ministerRelationships.map((relationship) =>
    relationshipStateSchema.parse(relationship),
  );
  const averageFactionTrust = calculateAverageFactionTrust(input.factions);
  const legitimacyTarget = clamp100(
    weightedAverage([
      { value: government.publicApproval, weight: 30 },
      { value: government.constitutionalCompliance, weight: 20 },
      { value: government.cabinetUnity, weight: 15 },
      { value: government.assemblySupport, weight: 15 },
      { value: government.civilServiceEfficiency, weight: 10 },
      { value: government.electionIntegrity, weight: 10 },
    ]) - government.activeScandalPenalty,
  );
  const averageRegionalApproval = roundNearest(
    CANONICAL_REGION_IDS.reduce((sum, id) => sum + regions[id].approval, 0),
    4,
  );
  const publicApprovalTarget = clamp100(
    weightedAverage([
      { value: input.consumerConfidence, weight: 25 },
      { value: input.supplyStability, weight: 20 },
      { value: averageRegionalApproval, weight: 20 },
      { value: government.governmentLegitimacy, weight: 20 },
      { value: government.mediaClimate, weight: 10 },
      { value: input.familyPublicReputation, weight: 5 },
    ]) - government.repressionPenalty,
  );
  const averageMinisterTrust = roundNearest(
    ministers.reduce((sum, relationship) => sum + relationship.trust, 0),
    ministers.length,
  );
  const averageMinisterRespect = roundNearest(
    ministers.reduce((sum, relationship) => sum + relationship.respect, 0),
    ministers.length,
  );
  const cabinetUnityTarget = clamp100(
    weightedAverage([
      { value: averageMinisterTrust, weight: 50 },
      { value: averageMinisterRespect, weight: 25 },
      { value: government.assemblySupport, weight: 15 },
      { value: government.civilServiceEfficiency, weight: 10 },
    ]) - government.publicCabinetConflictPenalty,
  );
  return {
    averageFactionTrust,
    legitimacyTarget,
    nextGovernmentLegitimacy: approach(
      government.governmentLegitimacy,
      legitimacyTarget,
      5,
    ),
    averageRegionalApproval,
    publicApprovalTarget,
    nextPublicApproval: approach(
      government.publicApproval,
      publicApprovalTarget,
      5,
    ),
    averageMinisterTrust,
    averageMinisterRespect,
    cabinetUnityTarget,
    nextCabinetUnity: approach(government.cabinetUnity, cabinetUnityTarget, 4),
  };
}

export function calculateFactionMetrics(input: FactionState): {
  readonly factionGrievance: number;
  readonly factionMobilization: number;
  readonly factionPressure: number;
} {
  const faction = factionStateSchema.parse(input);
  const factionGrievance = weightedAverage([
    { value: 100 - faction.trust, weight: 35 },
    { value: faction.unmetDemandSeverity, weight: 30 },
    { value: 100 - faction.governmentAccess, weight: 15 },
    { value: faction.repressionMemory, weight: 20 },
  ]);
  const factionMobilization = weightedAverage([
    { value: faction.organization, weight: 35 },
    { value: faction.radicalization, weight: 25 },
    { value: factionGrievance, weight: 25 },
    { value: faction.unity, weight: 15 },
  ]);
  return {
    factionGrievance,
    factionMobilization,
    factionPressure: weightedAverage([
      { value: faction.support, weight: 25 },
      { value: factionMobilization, weight: 30 },
      { value: faction.organization, weight: 25 },
      { value: faction.unity, weight: 20 },
    ]),
  };
}

export function calculateAllFactionMetrics(
  factions: FactionsState,
): Record<CanonicalFactionId, ReturnType<typeof calculateFactionMetrics>> {
  return {
    civic_renewal_league: calculateFactionMetrics(
      factions.civic_renewal_league,
    ),
    national_stewardship_union: calculateFactionMetrics(
      factions.national_stewardship_union,
    ),
    workers_commonwealth: calculateFactionMetrics(
      factions.workers_commonwealth,
    ),
  };
}

export function calculateRelationshipMetrics(input: RelationshipState): {
  readonly fearPenalty: number;
  readonly leverageBonus: number;
  readonly willingnessToCooperate: number;
  readonly candor: number;
} {
  const relationship = relationshipStateSchema.parse(input);
  const fearPenalty = Math.max(0, roundNearest(relationship.fear - 60, 2));
  const leverageBonus = Math.min(
    10,
    roundNearest(relationship.personalLeverage, 5),
  );
  return {
    fearPenalty,
    leverageBonus,
    willingnessToCooperate: clamp100(
      weightedAverage([
        { value: relationship.trust, weight: 35 },
        { value: relationship.respect, weight: 25 },
        { value: relationship.ideologicalAlignment, weight: 15 },
        { value: relationship.privateRelationship, weight: 15 },
        { value: relationship.publicRelationship, weight: 10 },
      ]) +
        leverageBonus -
        fearPenalty,
    ),
    candor: weightedAverage([
      { value: relationship.trust, weight: 45 },
      { value: relationship.respect, weight: 25 },
      { value: relationship.privateRelationship, weight: 20 },
      { value: 100 - relationship.fear, weight: 10 },
    ]),
  };
}

export function calculateMemoryWeights(
  memoryInput: MemoryState,
  currentPeriod: number,
): {
  readonly ageInPeriods: number;
  readonly remainingPercent: number;
  readonly effectiveEmotionalWeight: number;
  readonly effectivePoliticalWeight: number;
} {
  const memory = memoryStateSchema.parse(memoryInput);
  if (
    !Number.isSafeInteger(currentPeriod) ||
    currentPeriod < memory.creationPeriod
  ) {
    throw new RangeError(
      "currentPeriod must be an integer at or after memory creation.",
    );
  }
  const ageInPeriods = currentPeriod - memory.creationPeriod;
  const remainingPercent = memory.permanent
    ? 100
    : Math.max(0, 100 - memory.decayRatePerPeriod * ageInPeriods);
  return {
    ageInPeriods,
    remainingPercent,
    effectiveEmotionalWeight: roundNearest(
      memory.emotionalWeight * remainingPercent,
      100,
    ),
    effectivePoliticalWeight: roundNearest(
      memory.politicalWeight * remainingPercent,
      100,
    ),
  };
}

export function calculateMemoryPressure(
  effectivePoliticalWeights: readonly number[],
): number {
  if (effectivePoliticalWeights.some((value) => !Number.isSafeInteger(value))) {
    throw new RangeError(
      "effectivePoliticalWeights must contain safe integers.",
    );
  }
  const total = effectivePoliticalWeights.reduce(
    (sum, value) => sum + BigInt(value),
    0n,
  );
  return Number(clampBigInt(roundNearestBigInt(total, 50n), -20n, 20n));
}

export function calculateRegionMetrics(
  input: RegionState,
  publicApproval: number,
  localFactionMobilization: number,
): {
  readonly regionalUnemploymentStress: number;
  readonly regionalEconomicStress: number;
  readonly regionalUnrestTarget: number;
  readonly nextProtestIntensity: number;
  readonly regionalApprovalTarget: number;
  readonly nextRegionalApproval: number;
} {
  const region = regionStateSchema.parse(input);
  score(publicApproval, "publicApproval");
  score(localFactionMobilization, "localFactionMobilization");
  const regionalUnemploymentStress = clamp100(
    roundNearest(Math.max(0, region.unemploymentBps - 400), 16),
  );
  const regionalEconomicStress = weightedAverage([
    { value: regionalUnemploymentStress, weight: 35 },
    { value: 100 - region.foodSupply, weight: 25 },
    { value: 100 - region.fuelSupply, weight: 15 },
    { value: 100 - region.infrastructure, weight: 10 },
    { value: 100 - region.localEconomy, weight: 15 },
  ]);
  const regionalUnrestTarget = weightedAverage([
    { value: regionalEconomicStress, weight: 40 },
    { value: 100 - region.approval, weight: 25 },
    { value: region.securityTension, weight: 20 },
    { value: localFactionMobilization, weight: 15 },
  ]);
  const regionalApprovalTarget = weightedAverage([
    { value: publicApproval, weight: 30 },
    { value: region.localEconomy, weight: 20 },
    { value: region.foodSupply, weight: 15 },
    { value: region.fuelSupply, weight: 10 },
    { value: region.infrastructure, weight: 10 },
    { value: region.governorTrust, weight: 5 },
    { value: 100 - region.securityTension, weight: 10 },
  ]);
  return {
    regionalUnemploymentStress,
    regionalEconomicStress,
    regionalUnrestTarget,
    nextProtestIntensity: approach(
      region.protestIntensity,
      regionalUnrestTarget,
      8,
    ),
    regionalApprovalTarget,
    nextRegionalApproval: approach(region.approval, regionalApprovalTarget, 6),
  };
}

export function calculateAverageRegionalUnrest(regions: RegionsState): number {
  const parsedRegions = regionsStateSchema.parse(regions);
  return roundNearest(
    CANONICAL_REGION_IDS.reduce(
      (sum, id) => sum + parsedRegions[id].protestIntensity,
      0,
    ),
    4,
  );
}

export function calculateSecurityMetrics(
  input: SecurityState,
  governmentLegitimacy: number,
  averageRegionalUnrest: number,
  dravicaRelations: number,
): {
  readonly securityInstability: number;
  readonly borderEscalation: number;
  readonly borderStability: number;
} {
  const security = securityStateSchema.parse(input);
  score(governmentLegitimacy, "governmentLegitimacy");
  score(averageRegionalUnrest, "averageRegionalUnrest");
  score(dravicaRelations, "dravicaRelations");
  const securityInstability = weightedAverage([
    { value: 100 - governmentLegitimacy, weight: 20 },
    { value: 100 - security.armyLoyalty, weight: 20 },
    { value: 100 - security.policeLoyalty, weight: 15 },
    { value: 100 - security.intelligenceLoyalty, weight: 15 },
    { value: averageRegionalUnrest, weight: 20 },
    { value: security.foreignInfiltrationRisk, weight: 10 },
  ]);
  const borderEscalation = weightedAverage([
    { value: security.borderTension, weight: 30 },
    { value: 100 - dravicaRelations, weight: 20 },
    { value: 100 - security.borderSecurity, weight: 15 },
    { value: security.armyAlertLevel, weight: 15 },
    { value: security.intelligenceUncertainty, weight: 10 },
    { value: security.publicRetaliationDemand, weight: 10 },
  ]);
  return {
    securityInstability,
    borderEscalation,
    borderStability: 100 - borderEscalation,
  };
}

export function calculateForeignLeverage(
  input: InternationalState,
  borderStability: number,
): number {
  const international = internationalStateSchema.parse(input);
  score(borderStability, "borderStability");
  return weightedAverage([
    { value: international.internationalReputation, weight: 25 },
    { value: international.tradeAccess, weight: 20 },
    { value: international.diplomaticLeverage, weight: 25 },
    { value: borderStability, weight: 15 },
    { value: 100 - international.foreignAidDependence, weight: 10 },
    { value: 100 - international.sanctionsRisk, weight: 5 },
  ]);
}

export function calculateFamilyUnity(input: FamilyState): number {
  const family = familyStateSchema.parse(input);
  return weightedAverage([
    { value: family.spouseTrust, weight: 30 },
    { value: family.daughterTrust, weight: 20 },
    { value: family.sonTrust, weight: 20 },
    { value: family.siblingTrust, weight: 15 },
    { value: family.familyPublicReputation, weight: 15 },
  ]);
}

export interface MediaReactionMetric {
  readonly sentiment: number;
  readonly reach: number;
  readonly credibility: number;
}

export function calculateMediaClimate(
  mediaClimate: number,
  reactions: readonly MediaReactionMetric[],
): null | {
  readonly weightedMediaSentiment: number;
  readonly mediaClimateTarget: number;
  readonly nextMediaClimate: number;
} {
  score(mediaClimate, "mediaClimate");
  if (reactions.length === 0) return null;
  let numerator = 0n;
  let denominator = 0n;
  reactions.forEach((reaction, index) => {
    if (
      !Number.isSafeInteger(reaction.sentiment) ||
      reaction.sentiment < -100 ||
      reaction.sentiment > 100
    )
      throw new RangeError(
        `reactions[${index}].sentiment must be an integer in -100..100.`,
      );
    score(reaction.reach, `reactions[${index}].reach`);
    score(reaction.credibility, `reactions[${index}].credibility`);
    numerator +=
      BigInt(reaction.sentiment) *
      BigInt(reaction.reach) *
      BigInt(reaction.credibility);
    denominator += BigInt(reaction.reach) * BigInt(reaction.credibility);
  });
  if (denominator === 0n)
    throw new RangeError(
      "Qualifying media reactions must have positive combined reach and credibility.",
    );
  const weightedMediaSentiment = Number(
    roundNearestBigInt(numerator, denominator),
  );
  const mediaClimateTarget = clamp100(
    50 + roundNearest(weightedMediaSentiment, 2),
  );
  return {
    weightedMediaSentiment,
    mediaClimateTarget,
    nextMediaClimate: approach(mediaClimate, mediaClimateTarget, 8),
  };
}

export function calculateRegionalMetrics(
  input: RegionsState,
  publicApproval: number,
  localFactionMobilization: Readonly<Record<CanonicalRegionId, number>>,
): Record<CanonicalRegionId, ReturnType<typeof calculateRegionMetrics>> {
  return {
    orsanne_metropolitan_district: calculateRegionMetrics(
      input.orsanne_metropolitan_district,
      publicApproval,
      localFactionMobilization.orsanne_metropolitan_district,
    ),
    kestrel_industrial_basin: calculateRegionMetrics(
      input.kestrel_industrial_basin,
      publicApproval,
      localFactionMobilization.kestrel_industrial_basin,
    ),
    lydra_agricultural_plain: calculateRegionMetrics(
      input.lydra_agricultural_plain,
      publicApproval,
      localFactionMobilization.lydra_agricultural_plain,
    ),
    roven_marches: calculateRegionMetrics(
      input.roven_marches,
      publicApproval,
      localFactionMobilization.roven_marches,
    ),
  };
}
