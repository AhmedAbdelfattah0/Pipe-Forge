/**
 * plan-gate.service.ts
 *
 * ViewModel service that determines whether a given plan feature is available
 * to the currently authenticated user.
 *
 * Architecture:
 *   - Reads plan data from PlansService (populated from GET /api/plans)
 *   - Reads the user's current plan slug from SubscriptionService
 *   - Exposes isFeatureAvailable() and getRequiredPlan() as pure lookups
 *     so templates can gate UI without making additional HTTP calls
 *
 * IMPORTANT: Call loadGateData() once (e.g. in AppComponent or layout)
 * before using isFeatureAvailable() — otherwise signals are not yet populated.
 */

import { Injectable, inject, computed } from '@angular/core';
import { PlansService } from './plans.service';
import { SubscriptionService } from './subscription.service';

/**
 * All plan-gated features in PipeForge.
 * Add new entries here as features are added.
 */
export type PlanFeature =
  | 'swa_deploy'
  | 'multi_language'
  | 'quality_gates'
  | 'token_replacement'
  | 'ai_diagnosis'
  | 'validator'
  | 'history';

/**
 * Maps each feature to the plan field that controls it.
 * null = always available (no gate).
 */
const FEATURE_TO_PLAN_FIELD: Record<
  PlanFeature,
  keyof import('../models/plan.model').Plan | null
> = {
  swa_deploy: null,          // Not plan-gated at data level — gated by plan slug comparison
  multi_language: null,      // Same
  quality_gates: null,       // Same
  token_replacement: null,   // Same
  ai_diagnosis: 'maxAiDiagnosesPerDay',
  validator: 'maxValidatorFilesPerMonth',
  history: 'maxHistoryItems',
};

/**
 * Free-plan features that are locked by slug comparison
 * (not by a specific numeric limit column).
 */
const FREE_LOCKED_FEATURES = new Set<PlanFeature>([
  'swa_deploy',
  'multi_language',
  'quality_gates',
  'token_replacement',
]);

@Injectable({ providedIn: 'root' })
export class PlanGateService {
  private readonly plansService = inject(PlansService);
  private readonly subscriptionService = inject(SubscriptionService);

  /** The user's resolved plan slug (defaults to 'free' until loaded). */
  private readonly currentPlanSlug = computed(
    () => this.subscriptionService.planSlug() ?? 'free',
  );

  /**
   * Loads plan catalogue and subscription data.
   * Call once at app startup or in the main layout component.
   */
  async loadGateData(): Promise<void> {
    await Promise.all([
      this.plansService.loadPlans(),
      this.subscriptionService.loadSubscription(),
    ]);
  }

  /**
   * Returns true if the current user's plan allows the requested feature.
   *
   * Rules:
   * - Free-locked features (swa_deploy, multi_language, quality_gates,
   *   token_replacement) → only available on pro, team, enterprise
   * - ai_diagnosis → blocked if maxAiDiagnosesPerDay === 0 (Free has 0)
   * - validator → blocked if maxValidatorFilesPerMonth === 0 (Free has 0)
   *   Note: the monthly soft-cap (3/month) is enforced backend-side; the
   *   frontend only shows the limit warning, not a hard block.
   * - history → blocked if maxHistoryItems === 0 (not used currently;
   *   Free has 1 so it shows the upgrade prompt after 1 item)
   */
  isFeatureAvailable(feature: PlanFeature): boolean {
    const slug = this.currentPlanSlug();

    // Free-plan slug-based gates
    if (FREE_LOCKED_FEATURES.has(feature)) {
      return slug !== 'free';
    }

    // Numeric limit gates
    const plan = this.plansService.getPlanBySlug(slug);

    if (!plan) {
      // Plan not loaded yet — fail open (do not block the user)
      return true;
    }

    if (feature === 'ai_diagnosis') {
      // 0 = hard block; null = unlimited; >0 = allowed (soft cap handled by backend)
      return plan.maxAiDiagnosesPerDay === null || plan.maxAiDiagnosesPerDay > 0;
    }

    if (feature === 'validator') {
      // Free has 3/month (>0) — technically available but rate-limited.
      // We return true here; the limit warning is shown via getValidatorMonthlyLimit().
      return plan.maxValidatorFilesPerMonth === null || plan.maxValidatorFilesPerMonth > 0;
    }

    if (feature === 'history') {
      return plan.maxHistoryItems === null || plan.maxHistoryItems > 0;
    }

    return true;
  }

  /**
   * Returns the slug of the cheapest plan that unlocks the requested feature.
   * Used to populate "Upgrade to [plan]" CTAs.
   */
  getRequiredPlan(feature: PlanFeature): string {
    if (feature === 'history') {
      return 'pro';
    }
    return 'pro';
  }

  /**
   * Returns the monthly validator file limit for the current plan.
   * null = unlimited. Used to show the "X of Y files used" warning.
   */
  getValidatorMonthlyLimit(): number | null {
    const slug = this.currentPlanSlug();
    const plan = this.plansService.getPlanBySlug(slug);
    return plan?.maxValidatorFilesPerMonth ?? null;
  }

  /**
   * Returns the history item limit for the current plan.
   * null = unlimited. Used to show the "upgrade for more history" prompt.
   */
  getHistoryLimit(): number | null {
    const slug = this.currentPlanSlug();
    const plan = this.plansService.getPlanBySlug(slug);
    return plan?.maxHistoryItems ?? null;
  }

  /** Returns the user's current plan slug. */
  getCurrentPlanSlug(): string {
    return this.currentPlanSlug();
  }
}
