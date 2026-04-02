/**
 * plans.service.ts
 *
 * ViewModel service for the subscription plans catalogue.
 *
 * Fetches plans from GET /api/plans and exposes them via Angular Signals
 * so components can render pricing without hardcoded values.
 */

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Plan,
  PlansApiResponse,
  mapApiItemToPlan,
} from '../models/plan.model';

@Injectable({ providedIn: 'root' })
export class PlansService {
  private readonly http = inject(HttpClient);

  private readonly _plans = signal<Plan[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  /** Read-only signal exposing the loaded plans. */
  readonly plans = this._plans.asReadonly();

  /** True while the API request is in flight. */
  readonly isLoading = this._isLoading.asReadonly();

  /** Non-null when the last load attempt failed. */
  readonly error = this._error.asReadonly();

  /**
   * Fetches all active plans from the backend and populates the plans signal.
   * Safe to call multiple times — skips the request if plans are already loaded.
   */
  async loadPlans(): Promise<void> {
    if (this._plans().length > 0) {
      return; // Already loaded — avoid redundant network calls.
    }

    this._isLoading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<PlansApiResponse>(`${environment.apiUrl}/plans`),
      );

      this._plans.set(response.plans.map(mapApiItemToPlan));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load plans';
      this._error.set(message);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Forces a fresh fetch from the backend, ignoring any cached data.
   * Use when plans may have been updated by an admin.
   */
  async reloadPlans(): Promise<void> {
    this._plans.set([]);
    await this.loadPlans();
  }

  /**
   * Returns the Plan with the given slug, or undefined if not found.
   * Call loadPlans() first to ensure data is available.
   */
  getPlanBySlug(slug: string): Plan | undefined {
    return this._plans().find(p => p.slug === slug);
  }
}
