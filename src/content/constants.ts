export const CONTENT_SCHEMA_VERSION = "schema-1.0.0" as const;
export const CONTENT_VERSION = "mvp-0.1.0" as const;

export const MVP_CHAPTER_IDS = ["prologue", "chapter_01"] as const;

export const CONTENT_OBJECT_TYPES = [
  "scenario",
  "scenario_beat",
  "choice",
  "condition",
  "effect",
  "delayed_effect",
  "character",
  "faction",
  "region",
  "institution",
  "political_background",
  "law_or_measure",
  "project",
  "intelligence_assertion",
  "media_reaction",
  "memory",
  "flag",
  "outcome",
  "epilogue",
] as const;

export const ORIGINALITY_STATUSES = [
  "unreviewed",
  "reviewed_original",
  "requires_revision",
  "blocked",
] as const;

export const SCENARIO_CATEGORIES = [
  "direct_follow_up",
  "mandatory",
  "major",
  "optional",
  "ambient_media",
  "outcome",
] as const;

export const CHOICE_VISIBILITIES = [
  "visible",
  "hidden_until_eligible",
  "visible_but_disabled",
] as const;

export const CONDITION_COMPARISON_OPERATORS = [
  "equals",
  "not_equals",
  "greater_than",
  "greater_than_or_equal",
  "less_than",
  "less_than_or_equal",
  "contains",
  "does_not_contain",
  "exists",
  "does_not_exist",
  "within_range",
] as const;

export const CONDITIONAL_EFFECT_TIMINGS = [
  "before_base_effects",
  "after_base_effects",
  "after_relationship_updates",
  "after_memory_creation",
] as const;

export const CANONICAL_INSTITUTION_IDS = [
  "presidency",
  "office_of_prime_minister",
  "council_of_ministers",
  "national_assembly",
  "constitutional_tribunal",
  "civil_service_commission",
  "armed_forces_general_staff",
  "national_security_directorate",
  "national_broadcasting_service",
  "presidential_guard",
  "national_police",
] as const;

export const CANONICAL_OUTLET_IDS = [
  "orsanne_ledger",
  "varenne_national_bulletin",
  "foundry_voice",
  "sentinel_review",
] as const;

export const CANON_REFERENCE_IDS = [
  "canon.republic_of_varenne",
  "canon.story_bible",
  ...CANONICAL_INSTITUTION_IDS.map((id) => `canon.institution.${id}` as const),
] as const;

export const SYSTEM_REFERENCE_IDS = [
  "system.content_architecture",
  "system.systems_design",
  "system.mvp_scope",
  "system.economy",
  "system.government",
  "system.security",
  "system.international",
  "system.factions",
  "system.relationships",
  "system.regions",
  "system.family",
  "system.memories",
  "system.outcomes",
] as const;

export const NORMALIZED_STATE_FIELDS = [
  "economy.currencyStability",
  "economy.foodSupply",
  "economy.fuelSupply",
  "economy.industrialOutput",
  "economy.agriculturalOutput",
  "economy.infrastructure",
  "economy.corruption",
  "economy.investorConfidence",
  "economy.consumerConfidence",
  "government.publicApproval",
  "government.governmentLegitimacy",
  "government.assemblySupport",
  "government.cabinetUnity",
  "government.civilServiceEfficiency",
  "government.constitutionalCompliance",
  "government.pressFreedom",
  "government.electionIntegrity",
  "government.emergencyAuthority",
  "government.mediaClimate",
  "security.armyLoyalty",
  "security.armyReadiness",
  "security.armyAlertLevel",
  "security.policeLoyalty",
  "security.intelligenceLoyalty",
  "security.presidentialGuardLoyalty",
  "security.borderSecurity",
  "security.foreignInfiltrationRisk",
  "security.borderTension",
  "security.publicRetaliationDemand",
  "security.intelligenceUncertainty",
  "international.caldrisRelations",
  "international.dromirRelations",
  "international.dravicaRelations",
  "international.belvarRelations",
  "international.cyraneRelations",
  "international.internationalReputation",
  "international.tradeAccess",
  "international.diplomaticLeverage",
  "international.foreignAidDependence",
  "international.sanctionsRisk",
  "family.spouseTrust",
  "family.daughterTrust",
  "family.sonTrust",
  "family.siblingTrust",
  "family.familyPublicReputation",
  "family.spousePublicReputation",
  "family.familyScandalRisk",
] as const;

export const BASIS_POINT_STATE_FIELDS = [
  "economy.inflationBps",
  "economy.unemploymentBps",
  "economy.annualGrowthBps",
] as const;

export const RELATIONSHIP_SCORE_FIELDS = [
  "trust",
  "respect",
  "fear",
  "affection",
  "ideologicalAlignment",
  "personalLeverage",
  "publicRelationship",
  "privateRelationship",
] as const;

export const FACTION_SCORE_FIELDS = [
  "support",
  "trust",
  "fear",
  "organization",
  "mobilization",
  "radicalization",
  "unity",
  "governmentAccess",
  "unmetDemandSeverity",
  "repressionMemory",
] as const;

export const REGION_SCORE_FIELDS = [
  "approval",
  "localEconomy",
  "foodSupply",
  "fuelSupply",
  "infrastructure",
  "securityTension",
  "protestIntensity",
  "militaryPresence",
  "governorTrust",
] as const;

export const MONEY_STATE_FIELDS = [
  "economy.treasuryMinor",
  "economy.monthlyRevenueMinor",
  "economy.monthlyExpenditureMinor",
  "economy.monthlyDebtServiceMinor",
  "economy.arrearsMinor",
  "economy.plannedArrearsPaymentMinor",
  "economy.periodFinancingInflowsMinor",
  "economy.periodProjectOutflowsMinor",
] as const;
