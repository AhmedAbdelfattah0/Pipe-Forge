/**
 * feature-gate.component.ts
 *
 * Wraps any UI that is restricted by plan.
 *
 * When the feature is AVAILABLE: renders the projected content normally.
 * When the feature is LOCKED: renders the content greyed out (opacity-50,
 * pointer-events-none) with a lock overlay showing the feature name,
 * required plan badge, and an upgrade CTA.
 *
 * CRITICAL IMPLEMENTATION NOTE:
 * <ng-content> appears exactly ONCE in the template. Angular resolves
 * ng-content projection slots at compile time — multiple ng-content tags
 * inside @if/@else branches each become distinct slots, and only the first
 * captures projected content (all others render empty).
 *
 * Lock state is applied via CSS (opacity + pointer-events), never via
 * conditional ng-content.
 *
 * Usage:
 *   <pf-feature-gate feature="ai_diagnosis" featureName="AI Diagnosis">
 *     <button>Run AI Diagnosis</button>
 *   </pf-feature-gate>
 */

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
  computed,
  HostBinding,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlanGateService, PlanFeature } from '../../../features/billing/services/plan-gate.service';

@Component({
  standalone: true,
  selector: 'pf-feature-gate',
  templateUrl: './feature-gate.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class FeatureGateComponent {
  private readonly planGate = inject(PlanGateService);

  /** The feature identifier to gate. */
  @Input({ required: true }) feature!: PlanFeature;

  /** Human-readable feature name shown in the lock overlay. */
  @Input() featureName: string = 'This feature';

  /** Whether this is an inline gate (no full overlay, just inline lock badge). */
  @Input() inline: boolean = false;

  /** Whether to show a limit warning rather than a hard lock. */
  @Input() limitWarning: boolean = false;

  /** Warning message to display (used with limitWarning=true). */
  @Input() limitWarningMessage: string = '';

  readonly isAvailable = computed(() => this.planGate.isFeatureAvailable(this.feature));

  readonly requiredPlan = computed(() => this.planGate.getRequiredPlan(this.feature));

  readonly requiredPlanLabel = computed(() => {
    const plan = this.requiredPlan();
    const labels: Record<string, string> = {
      pro: 'Pro',
      team: 'Team',
      enterprise: 'Enterprise',
    };
    return labels[plan] ?? plan;
  });

  /**
   * Inline mode needs the host element to be a flex row so the lock badge
   * renders beside the projected content without an extra wrapper div.
   */
  @HostBinding('class') get hostClasses(): string {
    const locked = !this.isAvailable() && !this.limitWarning;
    if (locked && this.inline) {
      return 'inline-flex items-center gap-2';
    }
    if (locked && !this.inline) {
      return 'relative block';
    }
    return '';
  }
}
