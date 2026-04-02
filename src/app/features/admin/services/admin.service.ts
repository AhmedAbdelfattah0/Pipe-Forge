/**
 * admin.service.ts
 *
 * ViewModel service for the admin dashboard.
 * Owns all admin state via Angular Signals and all HTTP calls to /api/admin/*.
 */

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../shared/components/toast/toast.service';
import type {
  AdminMetrics,
  AdminUserOverview,
  AdminFeedback,
  Coupon,
  AdminGenerations,
  Compensation,
  AdminHealthStatus,
} from '../models/admin.model';

// ── Internal API response shapes ───────────────────────────────────────────────

interface MetricsResponse {
  totalUsers: number;
  activeSubscriptions: number;
  totalGenerations: number;
  pendingFeedback: number;
}

interface UsersResponse {
  users: AdminUserOverview[];
  total: number;
  page: number;
  limit: number;
}

interface FeedbackResponse {
  feedback: AdminFeedback[];
  total: number;
  page: number;
  limit: number;
}

interface CouponsResponse {
  coupons: {
    id: string;
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    applies_to: string;
    billing_cycle: string;
    max_uses: number | null;
    uses_count: number;
    expires_at: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
  }[];
}

interface GenerationsResponse extends AdminGenerations {}

interface CompensationsResponse {
  compensations: {
    id: string;
    user_id: string;
    admin_id: string;
    type: 'free_month' | 'plan_upgrade';
    value: string;
    reason: string | null;
    applied_at: string;
  }[];
}

// ── Service ────────────────────────────────────────────────────────────────────

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  plan?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly apiUrl = environment.apiUrl;

  // ── State signals ────────────────────────────────────────────────────────────

  private readonly _isAdmin = signal<boolean>(false);
  private readonly _metrics = signal<AdminMetrics | null>(null);
  private readonly _users = signal<AdminUserOverview[]>([]);
  private readonly _userTotal = signal<number>(0);
  private readonly _feedback = signal<AdminFeedback[]>([]);
  private readonly _feedbackTotal = signal<number>(0);
  private readonly _coupons = signal<Coupon[]>([]);
  private readonly _generations = signal<AdminGenerations | null>(null);
  private readonly _compensations = signal<Compensation[]>([]);
  private readonly _healthStatus = signal<AdminHealthStatus | null>(null);
  private readonly _isLoading = signal<boolean>(false);

  // ── Public read-only signals ─────────────────────────────────────────────────

  readonly isAdmin = this._isAdmin.asReadonly();
  readonly metrics = this._metrics.asReadonly();
  readonly users = this._users.asReadonly();
  readonly userTotal = this._userTotal.asReadonly();
  readonly feedback = this._feedback.asReadonly();
  readonly feedbackTotal = this._feedbackTotal.asReadonly();
  readonly coupons = this._coupons.asReadonly();
  readonly generations = this._generations.asReadonly();
  readonly compensations = this._compensations.asReadonly();
  readonly healthStatus = this._healthStatus.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // ── Admin check (used by guard) ───────────────────────────────────────────────

  async checkAdminAccess(): Promise<boolean> {
    // Return cached result — avoids a DB round-trip on every admin navigation.
    if (this._isAdmin()) return true;

    try {
      await firstValueFrom(
        this.http.get<{ isAdmin: boolean }>(`${this.apiUrl}/admin/me`),
      );
      this._isAdmin.set(true);
      return true;
    } catch {
      this._isAdmin.set(false);
      return false;
    }
  }

  // ── Guard helper — all load methods call this before touching the API ─────────

  private assertAdmin(): boolean {
    if (!this._isAdmin()) {
      console.warn('[AdminService] API call blocked — admin status not confirmed.');
      return false;
    }
    return true;
  }

  // ── Metrics ───────────────────────────────────────────────────────────────────

  async loadMetrics(): Promise<void> {
    if (!this.assertAdmin()) return;
    this._isLoading.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<MetricsResponse>(`${this.apiUrl}/admin/metrics`),
      );
      this._metrics.set(data);
    } catch {
      this.toastService.show('Failed to load metrics', 'error');
    } finally {
      this._isLoading.set(false);
    }
  }

  // ── Users ─────────────────────────────────────────────────────────────────────

  async loadUsers(params: UserListParams = {}): Promise<void> {
    if (!this.assertAdmin()) return;
    this._isLoading.set(true);
    try {
      const query = new URLSearchParams();
      if (params.page)   query.set('page',   String(params.page));
      if (params.limit)  query.set('limit',  String(params.limit));
      if (params.search) query.set('search', params.search);
      if (params.plan)   query.set('plan',   params.plan);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const data = await firstValueFrom(
        this.http.get<UsersResponse>(`${this.apiUrl}/admin/users${qs}`),
      );
      this._users.set(data.users);
      this._userTotal.set(data.total);
    } catch {
      this.toastService.show('Failed to load users', 'error');
    } finally {
      this._isLoading.set(false);
    }
  }

  async updateUserPlan(userId: string, plan: string): Promise<void> {
    if (!this.assertAdmin()) return;
    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/admin/users/${userId}/plan`, { plan }),
      );
      this.toastService.show('Plan updated successfully', 'success');
      // Refresh user list to reflect change
      await this.loadUsers();
    } catch {
      this.toastService.show('Failed to update plan', 'error');
    }
  }

  async compensateUser(
    userId: string,
    payload: { type: string; value: string; reason?: string },
  ): Promise<void> {
    if (!this.assertAdmin()) return;
    try {
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/admin/users/${userId}/compensate`, payload),
      );
      this.toastService.show('Compensation recorded', 'success');
    } catch {
      this.toastService.show('Failed to record compensation', 'error');
    }
  }

  // ── Feedback ──────────────────────────────────────────────────────────────────

  async loadFeedback(status: 'pending' | 'approved' | 'rejected' = 'pending', page = 1): Promise<void> {
    if (!this.assertAdmin()) return;
    this._isLoading.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<FeedbackResponse>(
          `${this.apiUrl}/admin/feedback?status=${status}&page=${page}&limit=20`,
        ),
      );
      this._feedback.set(data.feedback);
      this._feedbackTotal.set(data.total);
    } catch {
      this.toastService.show('Failed to load feedback', 'error');
    } finally {
      this._isLoading.set(false);
    }
  }

  async updateFeedback(id: string, action: 'approve' | 'reject'): Promise<void> {
    if (!this.assertAdmin()) return;
    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/admin/feedback/${id}`, { action }),
      );
      this.toastService.show(
        action === 'approve' ? 'Feedback approved' : 'Feedback rejected',
        'success',
      );
    } catch {
      this.toastService.show('Failed to update feedback', 'error');
    }
  }

  // ── Coupons ───────────────────────────────────────────────────────────────────

  async loadCoupons(): Promise<void> {
    if (!this.assertAdmin()) return;
    this._isLoading.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<CouponsResponse>(`${this.apiUrl}/admin/coupons`),
      );
      this._coupons.set(
        data.coupons.map((c) => ({
          id: c.id,
          code: c.code,
          type: c.type,
          value: c.value,
          appliesTo: c.applies_to,
          billingCycle: c.billing_cycle,
          maxUses: c.max_uses,
          usesCount: c.uses_count,
          expiresAt: c.expires_at,
          description: c.description,
          isActive: c.is_active,
          createdAt: c.created_at,
        })),
      );
    } catch {
      this.toastService.show('Failed to load coupons', 'error');
    } finally {
      this._isLoading.set(false);
    }
  }

  async createCoupon(payload: Record<string, unknown>): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/admin/coupons`, payload),
      );
      this.toastService.show('Coupon created', 'success');
    } catch (err: unknown) {
      // Handle 501 gracefully
      if (
        err &&
        typeof err === 'object' &&
        'status' in err &&
        (err as { status: number }).status === 501
      ) {
        this.toastService.show('Stripe integration required to create coupons', 'error');
      } else {
        this.toastService.show('Failed to create coupon', 'error');
      }
    }
  }

  async toggleCoupon(id: string, isActive: boolean): Promise<void> {
    if (!this.assertAdmin()) return;
    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/admin/coupons/${id}`, { is_active: isActive }),
      );
      this.toastService.show(isActive ? 'Coupon resumed' : 'Coupon paused', 'success');
      await this.loadCoupons();
    } catch {
      this.toastService.show('Failed to update coupon', 'error');
    }
  }

  // ── Generations ───────────────────────────────────────────────────────────────

  async loadGenerations(): Promise<void> {
    if (!this.assertAdmin()) return;
    this._isLoading.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<GenerationsResponse>(`${this.apiUrl}/admin/generations`),
      );
      this._generations.set(data);
    } catch {
      this.toastService.show('Failed to load generation stats', 'error');
    } finally {
      this._isLoading.set(false);
    }
  }

  // ── Compensations history ─────────────────────────────────────────────────────

  async loadCompensations(): Promise<void> {
    if (!this.assertAdmin()) return;
    this._isLoading.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<CompensationsResponse>(`${this.apiUrl}/admin/compensations`),
      );
      this._compensations.set(
        data.compensations.map((c) => ({
          id: c.id,
          userId: c.user_id,
          adminId: c.admin_id,
          type: c.type,
          value: c.value,
          reason: c.reason,
          appliedAt: c.applied_at,
        })),
      );
    } catch {
      this.toastService.show('Failed to load compensation history', 'error');
    } finally {
      this._isLoading.set(false);
    }
  }

  // ── System health ─────────────────────────────────────────────────────────────

  async loadHealth(): Promise<void> {
    if (!this.assertAdmin()) return;
    this._isLoading.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<AdminHealthStatus>(`${this.apiUrl}/admin/health`),
      );
      this._healthStatus.set(data);
    } catch {
      this._healthStatus.set({
        status: 'error',
        supabase: 'unreachable',
        timestamp: new Date().toISOString(),
        environment: 'unknown',
      });
      this.toastService.show('Failed to fetch system health', 'error');
    } finally {
      this._isLoading.set(false);
    }
  }
}
