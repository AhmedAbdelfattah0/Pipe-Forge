import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule, Save, Plus, Trash2 } from 'lucide-angular';
import { PlansService } from '../../billing/services/plans.service';
import type { Plan, PlanFeature } from '../../billing/models/plan.model';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  standalone: true,
  selector: 'pf-admin-pricing',
  templateUrl: './admin-pricing.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, LucideAngularModule],
})
export class AdminPricingPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  protected readonly plansService = inject(PlansService);

  protected readonly saveIcon = Save;
  protected readonly plusIcon = Plus;
  protected readonly trashIcon = Trash2;

  protected readonly savingPlanId = signal<string | null>(null);

  // Tracks editable field values per plan id: { [planId]: { field: value } }
  protected readonly edits = signal<Record<string, Record<string, string>>>({});

  // Tracks new feature text per plan id
  protected readonly newFeatureText = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.plansService.reloadPlans();
  }

  protected getEdit(planId: string, field: string, fallback: string | number | boolean | null): string {
    return this.edits()[planId]?.[field] ?? String(fallback ?? '');
  }

  protected setEdit(planId: string, field: string, value: string): void {
    this.edits.update(prev => ({
      ...prev,
      [planId]: { ...(prev[planId] ?? {}), [field]: value },
    }));
  }

  protected async savePlan(plan: Plan): Promise<void> {
    const changes = this.edits()[plan.id] ?? {};
    if (Object.keys(changes).length === 0) {
      this.toastService.show('No changes to save', 'error');
      return;
    }

    this.savingPlanId.set(plan.id);
    try {
      const payload: Record<string, unknown> = {};
      if ('displayName'   in changes) payload['display_name']   = changes['displayName'];
      if ('priceMonthly'  in changes) payload['price_monthly']  = Number(changes['priceMonthly']);
      if ('priceAnnual'   in changes) payload['price_annual']   = Number(changes['priceAnnual']);
      if ('badgeText'     in changes) payload['badge_text']     = changes['badgeText'] || null;
      if ('ctaText'       in changes) payload['cta_text']       = changes['ctaText'];
      if ('isHighlighted' in changes) payload['is_highlighted'] = changes['isHighlighted'] === 'true';
      if ('isActive'      in changes) payload['is_active']      = changes['isActive'] === 'true';

      await firstValueFrom(
        this.http.patch(`${environment.apiUrl}/admin/plans/${plan.id}`, payload),
      );
      this.toastService.show('Plan saved', 'success');
      // Clear edits for this plan
      this.edits.update(prev => {
        const updated = { ...prev };
        delete updated[plan.id];
        return updated;
      });
      await this.plansService.reloadPlans();
    } catch {
      this.toastService.show('Failed to save plan', 'error');
    } finally {
      this.savingPlanId.set(null);
    }
  }

  protected async addFeature(plan: Plan): Promise<void> {
    const text = this.newFeatureText()[plan.id]?.trim();
    if (!text) return;

    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/admin/plans/${plan.id}/features`, {
          feature_text: text,
          display_order: (plan.features?.length ?? 0) + 1,
        }),
      );
      this.newFeatureText.update(prev => ({ ...prev, [plan.id]: '' }));
      this.toastService.show('Feature added', 'success');
      await this.plansService.reloadPlans();
    } catch {
      this.toastService.show('Failed to add feature', 'error');
    }
  }

  protected async removeFeature(planId: string, feature: PlanFeature): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(
          `${environment.apiUrl}/admin/plans/${planId}/features/${feature.id}`,
        ),
      );
      this.toastService.show('Feature removed', 'success');
      await this.plansService.reloadPlans();
    } catch {
      this.toastService.show('Failed to remove feature', 'error');
    }
  }

  protected getNewFeatureText(planId: string): string {
    return this.newFeatureText()[planId] ?? '';
  }

  protected setNewFeatureText(planId: string, value: string): void {
    this.newFeatureText.update(prev => ({ ...prev, [planId]: value }));
  }
}
