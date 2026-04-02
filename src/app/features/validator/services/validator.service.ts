/**
 * validator.service.ts
 *
 * ViewModel service for the Pipeline Validator feature (Task 22).
 * Manages upload state, API calls, and results signals.
 *
 * Architecture: MVVM — this service owns all state.
 * The ValidatorPage component only reads from signals and delegates actions here.
 */

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ValidationResult } from '../models/validator.model';

@Injectable({ providedIn: 'root' })
export class ValidatorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // ── State signals ──────────────────────────────────────────────────────────

  private readonly _isAnalysing = signal<boolean>(false);
  private readonly _isDownloading = signal<boolean>(false);
  private readonly _result = signal<ValidationResult | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _filename = signal<string>('');

  readonly isAnalysing = this._isAnalysing.asReadonly();
  readonly isDownloading = this._isDownloading.asReadonly();
  readonly result = this._result.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filename = this._filename.asReadonly();

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Read a file via FileReader and send it to POST /api/validator.
   * Populates the result signal on success.
   */
  async analyseFile(file: File): Promise<void> {
    this._isAnalysing.set(true);
    this._error.set(null);
    this._result.set(null);
    this._filename.set(file.name);

    try {
      const content = await this.readFileAsText(file);

      const result = await firstValueFrom(
        this.http.post<ValidationResult>(`${this.apiUrl}/validator`, {
          filename: file.name,
          content,
        }),
      );

      this._result.set(result);
    } catch (err: unknown) {
      this._error.set(
        err instanceof Error ? err.message : 'Analysis failed. Please try again.',
      );
    } finally {
      this._isAnalysing.set(false);
    }
  }

  /**
   * Send file content to POST /api/validator/fix and trigger a ZIP download.
   */
  async downloadFixed(content: string): Promise<void> {
    if (this._isDownloading()) return;

    this._isDownloading.set(true);
    try {
      const blob = await firstValueFrom(
        this.http.post(
          `${this.apiUrl}/validator/fix`,
          { filename: this._filename(), content },
          { responseType: 'blob' },
        ),
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pipeline-fix.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      this._error.set(
        err instanceof Error ? err.message : 'Download failed. Please try again.',
      );
    } finally {
      this._isDownloading.set(false);
    }
  }

  /** Reset all state so the user can upload a new file. */
  reset(): void {
    this._result.set(null);
    this._error.set(null);
    this._filename.set('');
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}
