/**
 * plan.model.ts
 *
 * Frontend model for subscription plans served from the /api/plans endpoint.
 * These are data shapes only — no logic, no methods.
 */

/** A single plan feature row returned by the API. */
export interface PlanFeature {
  id: string;
  planId: string;
  featureText: string;
  displayOrder: number;
  isActive: boolean;
}

/** A subscription plan with computed pricing fields. */
export interface Plan {
  id: string;
  slug: string;
  displayName: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  isHighlighted: boolean;
  badgeText: string | null;
  ctaText: string;
  ctaUrl: string | null;
  priceMonthly: number;
  priceAnnual: number;
  /** Computed by backend: Math.round(priceAnnual / 12 * 100) / 100 */
  annualMonthlyEquivalent: number;
  maxProjectsPerMonth: number | null;
  maxTeamMembers: number | null;
  /** null = unlimited, 0 = feature blocked on this plan */
  maxAiDiagnosesPerDay: number | null;
  /** null = unlimited, 0 = feature blocked on this plan */
  maxValidatorFilesPerMonth: number | null;
  /** null = unlimited */
  maxHistoryItems: number | null;
  stripePriceIdMonthly: string | null;
  stripePriceIdAnnual: string | null;
  features: PlanFeature[];
}

/** API response shape from GET /api/plans */
export interface PlansApiResponse {
  plans: PlanApiItem[];
}

/** Raw snake_case shape from the API before mapping */
export interface PlanApiItem {
  id: string;
  slug: string;
  display_name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  is_highlighted: boolean;
  badge_text: string | null;
  cta_text: string;
  cta_url: string | null;
  price_monthly: number;
  price_annual: number;
  annual_monthly_equivalent: number;
  max_projects_per_month: number | null;
  max_team_members: number | null;
  max_ai_diagnoses_per_day: number | null;
  max_validator_files_per_month: number | null;
  max_history_items: number | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_annual: string | null;
  features: PlanFeatureApiItem[];
}

export interface PlanFeatureApiItem {
  id: string;
  plan_id: string;
  feature_text: string;
  display_order: number;
  is_active: boolean;
}

/** Maps the raw API item to the frontend camelCase Plan model. */
export function mapApiItemToPlan(api: PlanApiItem): Plan {
  return {
    id: api.id,
    slug: api.slug,
    displayName: api.display_name,
    description: api.description,
    displayOrder: api.display_order,
    isActive: api.is_active,
    isHighlighted: api.is_highlighted,
    badgeText: api.badge_text,
    ctaText: api.cta_text,
    ctaUrl: api.cta_url,
    priceMonthly: api.price_monthly,
    priceAnnual: api.price_annual,
    annualMonthlyEquivalent: api.annual_monthly_equivalent,
    maxProjectsPerMonth: api.max_projects_per_month,
    maxTeamMembers: api.max_team_members,
    maxAiDiagnosesPerDay: api.max_ai_diagnoses_per_day ?? null,
    maxValidatorFilesPerMonth: api.max_validator_files_per_month ?? null,
    maxHistoryItems: api.max_history_items ?? null,
    stripePriceIdMonthly: api.stripe_price_id_monthly,
    stripePriceIdAnnual: api.stripe_price_id_annual,
    features: (api.features ?? []).map(f => ({
      id: f.id,
      planId: f.plan_id,
      featureText: f.feature_text,
      displayOrder: f.display_order,
      isActive: f.is_active,
    })),
  };
}
