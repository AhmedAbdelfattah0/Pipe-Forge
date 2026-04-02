/**
 * diagnose.service.ts
 *
 * ViewModel service for the AI Error Diagnosis feature (Task 23).
 * Manages panel visibility, API calls, and diagnosis result signals.
 *
 * Architecture: MVVM — all state lives here.
 */

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DiagnoseResult } from '../models/diagnose.model';

@Injectable({ providedIn: 'root' })
export class DiagnoseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // ── Panel state ────────────────────────────────────────────────────────────

  /** ID of the project whose diagnosis panel is currently open. Null = panel closed. */
  private readonly _openProjectId = signal<string | null>(null);
  readonly openProjectId = this._openProjectId.asReadonly();

  // ── Diagnosis state ────────────────────────────────────────────────────────

  private readonly _isAnalysing = signal<boolean>(false);
  private readonly _isRegenerating = signal<boolean>(false);
  private readonly _result = signal<DiagnoseResult | null>(null);
  private readonly _error = signal<string | null>(null);

  readonly isAnalysing = this._isAnalysing.asReadonly();
  readonly isRegenerating = this._isRegenerating.asReadonly();
  readonly result = this._result.asReadonly();
  readonly error = this._error.asReadonly();

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Open the diagnosis panel for a specific generation. */
  openPanel(projectId: string): void {
    this._openProjectId.set(projectId);
    this._result.set(null);
    this._error.set(null);
  }

  /** Close the panel and reset transient state. */
  closePanel(): void {
    this._openProjectId.set(null);
    this._result.set(null);
    this._error.set(null);
  }

  /**
   * Send the error log and generation ID to Claude.
   * Populates the result signal on success.
   */
  async diagnose(generationId: string, errorLog: string): Promise<void> {
    if (this._isAnalysing()) return;

    this._isAnalysing.set(true);
    this._error.set(null);
    this._result.set(null);

    try {
      const result = await firstValueFrom(
        this.http.post<DiagnoseResult>(`${this.apiUrl}/diagnose`, {
          generationId,
          errorLog,
        }),
      );
      this._result.set(result);
    } catch (err: unknown) {
      this._error.set(
        err instanceof Error ? err.message : 'Diagnosis failed. Please try again.',
      );
    } finally {
      this._isAnalysing.set(false);
    }
  }

  /**
   * Apply the suggested config changes and re-generate the pipeline ZIP.
   * Triggers a browser download on success.
   */
  async regenerateWithFix(generationId: string, updatedConfig: Record<string, unknown>): Promise<void> {
    if (this._isRegenerating()) return;

    this._isRegenerating.set(true);
    this._error.set(null);

    try {
      const blob = await firstValueFrom(
        this.http.post(
          `${this.apiUrl}/diagnose/regenerate`,
          { generationId, updatedConfig },
          { responseType: 'blob' },
        ),
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fixed-pipelines.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      this._error.set(
        err instanceof Error ? err.message : 'Regeneration failed. Please try again.',
      );
    } finally {
      this._isRegenerating.set(false);
    }
  }
}
