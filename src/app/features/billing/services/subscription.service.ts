/**
 * subscription.service.ts
 *
 * ViewModel service that fetches the authenticated user's subscription record
 * and resolves their current plan slug via GET /api/billing/subscription.
 *
 * Used by PlanGateService to determine which features are available.
 * State lives here; components bind to the exposed signals.
 */

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

/** Raw subscription object returned by GET /api/billing/subscription */
export interface SubscriptionApiResponse {
  subscription: {
    plan: string;
    mfe_used_this_month: number;
    mfe_monthly_limit: number;
    market_limit: number;
    billing_cycle_start: string;
  };
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly http = inject(HttpClient);

  private readonly _planSlug = signal<string | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  /** The user's current plan slug (e.g. 'free', 'pro', 'team', 'enterprise'). null while loading. */
  readonly planSlug = this._planSlug.asReadonly();

  /** True while the API request is in flight. */
  readonly isLoading = this._isLoading.asReadonly();

  /** Non-null when the last load attempt failed. */
  readonly error = this._error.asReadonly();

  /**
   * Fetches the user's subscription from the backend.
   * Safe to call multiple times — skips if already loaded.
   */
  async loadSubscription(): Promise<void> {
    if (this._planSlug() !== null) {
      return;
    }

    this._isLoading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<SubscriptionApiResponse>(
          `${environment.apiUrl}/billing/subscription`,
        ),
      );
      this._planSlug.set(response.subscription.plan);
    } catch {
      // Default to 'free' on error so gate always fails open safely.
      this._planSlug.set('free');
      this._error.set('Could not load subscription. Defaulting to Free plan limits.');
    } finally {
      this._isLoading.set(false);
    }
  }

  /** Forces a fresh fetch, ignoring cached data. */
  async reloadSubscription(): Promise<void> {
    this._planSlug.set(null);
    await this.loadSubscription();
  }
}
