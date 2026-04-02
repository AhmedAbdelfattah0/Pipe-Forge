/**
 * validator.page.ts
 *
 * Pipeline Validator page — /validator
 *
 * Allows users to upload a YAML or JSON pipeline file, receive a health report,
 * and download an auto-fixed version. Static analysis only — no pipeline run needed.
 *
 * Architecture: pure View layer. All state lives in ValidatorService (ViewModel).
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LucideAngularModule, ShieldCheck, Upload, X, CheckCircle, AlertTriangle, AlertCircle, Info, Download } from 'lucide-angular';
import { ValidatorService } from '../services/validator.service';
import { IssueSeverity, ValidationIssue } from '../models/validator.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';

/** Cached file content for the fix download — held in the component because
 *  it is only needed in this view and is ephemeral per upload session. */
@Component({
  standalone: true,
  selector: 'pf-validator-page',
  templateUrl: './validator.page.html',
  styleUrl: './validator.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ButtonComponent],
})
export class ValidatorPage {
  protected readonly validator = inject(ValidatorService);

  // Lucide icons
  protected readonly shieldCheckIcon = ShieldCheck;
  protected readonly uploadIcon = Upload;
  protected readonly xIcon = X;
  protected readonly checkCircleIcon = CheckCircle;
  protected readonly alertTriangleIcon = AlertTriangle;
  protected readonly alertCircleIcon = AlertCircle;
  protected readonly infoIcon = Info;
  protected readonly downloadIcon = Download;

  /** Drag-over visual state — tracks whether a valid file is being dragged over the zone. */
  protected readonly isDragOver = signal<boolean>(false);

  /** Raw file content kept for the fix download. */
  private _fileContent = '';

  /** Whether any issue in the current result is auto-fixable. */
  protected readonly hasAutoFixable = computed(() =>
    this.validator.result()?.issues.some(i => i.autoFixable) ?? false
  );

  /** Group issues by severity for the results panel. */
  protected readonly issuesBySeverity = computed(() => {
    const result = this.validator.result();
    if (!result) return null;

    const groups: Record<IssueSeverity, ValidationIssue[]> = {
      critical: [],
      warning: [],
      info: [],
      passing: [],
    };

    for (const issue of result.issues) {
      groups[issue.severity].push(issue);
    }

    return groups;
  });

  /** Score colour bucket for the badge. */
  protected readonly scoreVariant = computed<'good' | 'warn' | 'bad'>(() => {
    const score = this.validator.result()?.healthScore ?? 100;
    if (score >= 80) return 'good';
    if (score >= 50) return 'warn';
    return 'bad';
  });

  // ── Event handlers ─────────────────────────────────────────────────────────

  protected onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processFile(file);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  protected onDragLeave(): void {
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  protected onReset(): void {
    this._fileContent = '';
    this.validator.reset();
  }

  protected onDownloadFixed(): void {
    this.validator.downloadFixed(this._fileContent);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async processFile(file: File): Promise<void> {
    const allowed = ['.yml', '.yaml', '.json'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowed.includes(ext)) {
      alert('Only .yml, .yaml, and .json files are supported.');
      return;
    }

    if (file.size > 100_000) {
      alert('File exceeds the 100 KB limit.');
      return;
    }

    // Cache raw content for the fix endpoint.
    this._fileContent = await file.text();
    await this.validator.analyseFile(file);
  }

  protected severityLabel(s: IssueSeverity): string {
    const map: Record<IssueSeverity, string> = {
      critical: 'Critical',
      warning: 'Warning',
      info: 'Info',
      passing: 'Passing',
    };
    return map[s];
  }

  protected platformLabel(p: 'ado' | 'gha'): string {
    return p === 'ado' ? 'Azure DevOps' : 'GitHub Actions';
  }
}
