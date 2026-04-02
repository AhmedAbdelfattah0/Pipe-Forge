/**
 * error-log.service.ts
 *
 * ViewModel service for the /admin/errors page.
 * Owns all error-log state via Angular Signals and all HTTP calls to /api/admin/errors/*.
 */

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  ErrorLog,
  ErrorLogStats,
  ErrorLogListResponse,
  ErrorLogFilters,
} from '../models/error-log.model';

@Injectable({ providedIn: 'root' })
export class ErrorLogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/errors`;

  // ── State ──────────────────────────────────────────────────────────────────

  private readonly _errors = signal<ErrorLog[]>([]);
  private readonly _total = signal<number>(0);
  private readonly _stats = signal<ErrorLogStats | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _page = signal<number>(1);

  readonly errors = this._errors.asReadonly();
  readonly total = this._total.asReadonly();
  readonly stats = this._stats.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly page = this._page.asReadonly();

  // ── HTTP methods (return Observables for direct use) ──────────────────────

  getErrors(params: ErrorLogFilters): Observable<ErrorLogListResponse> {
    const queryParams: Record<string, string> = {};
    if (params.page   !== undefined) queryParams['page']      = String(params.page);
    if (params.limit  !== undefined) queryParams['limit']     = String(params.limit);
    if (params.resolved !== undefined) queryParams['resolved'] = String(params.resolved);
    if (params.errorType)              queryParams['errorType'] = params.errorType;
    if (params.platform)               queryParams['platform']  = params.platform;
    return this.http.get<ErrorLogListResponse>(this.apiUrl, { params: queryParams });
  }

  getStats(): Observable<ErrorLogStats> {
    return this.http.get<ErrorLogStats>(`${this.apiUrl}/stats`);
  }

  resolveError(id: string, resolvedNote?: string): Observable<{ error: ErrorLog }> {
    return this.http.patch<{ error: ErrorLog }>(`${this.apiUrl}/${id}`, {
      resolved: true,
      resolvedNote: resolvedNote ?? null,
    });
  }

  // ── Signal-based state management (for the page component) ────────────────

  async loadErrors(params: ErrorLogFilters = {}): Promise<void> {
    this._isLoading.set(true);
    try {
      const res = await this.getErrors({ limit: 20, ...params }).toPromise();
      if (res) {
        this._errors.set(res.errors);
        this._total.set(res.total);
        this._page.set(res.page);
      }
    } catch {
      // Errors surfaced by the HTTP interceptor
    } finally {
      this._isLoading.set(false);
    }
  }

  async loadStats(): Promise<void> {
    try {
      const res = await this.getStats().toPromise();
      if (res) this._stats.set(res);
    } catch {
      // Non-critical
    }
  }

  async markResolved(id: string, note?: string): Promise<void> {
    await this.resolveError(id, note).toPromise();
    // Refresh in-place: mark the resolved row without a full reload
    this._errors.update(list =>
      list.map(e => e.id === id ? { ...e, resolved: true, resolvedNote: note ?? null } : e),
    );
    // Decrement unresolved count in stats
    this._stats.update(s =>
      s ? { ...s, unresolved: Math.max(0, s.unresolved - 1) } : s,
    );
  }
}
