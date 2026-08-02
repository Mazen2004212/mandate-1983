export const STATE_VISIBILITIES = [
  "public",
  "player_visible_exact",
  "player_visible_qualitative",
  "report_dependent",
  "hidden",
  "developer_only",
  "administrative",
] as const;

export const POLITICAL_BACKGROUND_IDS = [
  "civil_service_reformer",
  "provincial_governor",
  "labor_mediator",
  "security_committee_chair",
] as const;

export const CONTENT_LIFECYCLE_STATUSES = [
  "draft",
  "review",
  "approved",
  "published",
  "deprecated",
  "withdrawn",
] as const;

export const DELAYED_EFFECT_STATUSES = [
  "pending",
  "executed",
  "cancelled",
  "expired",
  "failed",
] as const;

export const CHARACTER_AVAILABILITIES = [
  "active",
  "resigned",
  "dismissed",
  "unavailable",
  "imprisoned",
  "exiled",
  "deceased",
] as const;

export const SUPPORTED_DIFFICULTIES = ["standard"] as const;

export const RESERVED_UNSUPPORTED_DIFFICULTIES = [
  "story",
  "statesman",
  "iron_mandate",
] as const;

export const INITIAL_CONTENT_VERSION = "mvp-0.1.0" as const;
