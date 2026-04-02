/**
 * pricing.page.ts
 *
 * Standalone /pricing route page.
 *
 * Renders the full pricing section — plan cards with monthly/annual toggle —
 * using data from PlansService. No values are hardcoded; everything is read
 * from the plans signal populated via GET /api/plans.
 */

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Check,
  LucideAngularModule,
  Zap,
} from 'lucide-angular';

import { ButtonComponent } from '../../../shared/components';
import { PlansService } from '../services/plans.service';

@Component({
  standalone: true,
  selector: 'pf-pricing-page',
  templateUrl: './pricing.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, ButtonComponent],
})
export class PricingPage implements OnInit {
  protected readonly plansService = inject(PlansService);

  /** Billing cycle toggle — false = monthly, true = annual. */
  private readonly _isAnnual = signal<boolean>(false);
  readonly isAnnual = this._isAnnual.asReadonly();

  setBilling(annual: boolean): void {
    this._isAnnual.set(annual);
  }

  ngOnInit(): void {
    this.plansService.loadPlans();
  }

  // Lucide icons
  protected readonly zapIcon = Zap;
  protected readonly checkIcon = Check;
}
