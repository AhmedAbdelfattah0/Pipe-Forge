import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  CheckCircle,
} from 'lucide-angular';
import { ErrorLogService } from '../../services/error-log.service';
import type { ErrorLog } from '../../models/error-log.model';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

type ActiveTab = 'request' | 'error' | 'user';

@Component({
  standalone: true,
  selector: 'pf-admin-errors',
  templateUrl: './admin-errors.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, DatePipe, FormsModule, ButtonComponent],
})
export class AdminErrorsPage implements OnInit {
  protected readonly errorLogService = inject(ErrorLogService);

  protected readonly alertCircleIcon = AlertCircle;
  protected readonly refreshIcon = RefreshCw;
  protected readonly chevronDownIcon = ChevronDown;
  protected readonly chevronUpIcon = ChevronUp;
  protected readonly copyIcon = Copy;
  protected readonly checkIcon = Check;
  protected readonly checkCircleIcon = CheckCircle;

  // ── Filters ────────────────────────────────────────────────────────────────

  protected readonly filterErrorType = signal<string>('');
  protected readonly filterPlatform = signal<string>('');
  protected readonly filterUnresolvedOnly = signal<boolean>(false);

  protected readonly errorTypes = [
    'TEMPLATE_ERROR',
    'ZIP_ERROR',
    'VALIDATION_ERROR',
    'DB_ERROR',
    'AUTH_ERROR',
    'CONFIG_ERROR',
    'UNKNOWN_ERROR',
  ];

  protected readonly platforms = ['azure-devops', 'github-actions'];

  // ── Row expansion ──────────────────────────────────────────────────────────

  protected readonly expandedRowId = signal<string | null>(null);
  protected readonly activeTab = signal<ActiveTab>('request');
  protected readonly stackExpanded = signal<boolean>(false);

  // ── Resolution state ───────────────────────────────────────────────────────

  protected readonly resolvingId = signal<string | null>(null);
  protected readonly resolveNote = signal<string>('');

  // ── Copy state ─────────────────────────────────────────────────────────────

  protected readonly copiedId = signal<string | null>(null);

  // ── Computed helpers ───────────────────────────────────────────────────────

  protected readonly unresolvedCount = computed(
    () => this.errorLogService.stats()?.unresolved ?? 0,
  );

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    const params: Record<string, unknown> = {
      page: 1,
      limit: 20,
    };
    if (this.filterErrorType()) params['errorType'] = this.filterErrorType();
    if (this.filterPlatform())  params['platform']  = this.filterPlatform();
    if (this.filterUnresolvedOnly()) params['resolved'] = false;

    this.errorLogService.loadErrors(params);
    this.errorLogService.loadStats();
  }

  protected toggleRow(id: string): void {
    if (this.expandedRowId() === id) {
      this.expandedRowId.set(null);
    } else {
      this.expandedRowId.set(id);
      this.activeTab.set('request');
      this.stackExpanded.set(false);
      this.resolvingId.set(null);
      this.resolveNote.set('');
    }
  }

  protected setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
  }

  protected toggleStack(): void {
    this.stackExpanded.update(v => !v);
  }

  protected formatJson(payload: Record<string, unknown> | null): string {
    if (!payload) return 'No payload recorded.';
    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return String(payload);
    }
  }

  protected copyConfig(error: ErrorLog): void {
    const text = this.formatJson(error.requestPayload);
    navigator.clipboard.writeText(text).then(() => {
      this.copiedId.set(error.id);
      setTimeout(() => this.copiedId.set(null), 2000);
    });
  }

  protected startResolve(id: string): void {
    this.resolvingId.set(id);
    this.resolveNote.set('');
  }

  protected cancelResolve(): void {
    this.resolvingId.set(null);
    this.resolveNote.set('');
  }

  protected async confirmResolve(id: string): Promise<void> {
    await this.errorLogService.markResolved(id, this.resolveNote() || undefined);
    this.resolvingId.set(null);
    this.resolveNote.set('');
  }

  protected errorTypeBadgeClass(type: string): string {
    const map: Record<string, string> = {
      TEMPLATE_ERROR:   'bg-purple-100 text-purple-700',
      ZIP_ERROR:        'bg-blue-100 text-blue-700',
      VALIDATION_ERROR: 'bg-amber-100 text-amber-700',
      DB_ERROR:         'bg-red-100 text-red-700',
      AUTH_ERROR:       'bg-orange-100 text-orange-700',
      CONFIG_ERROR:     'bg-cyan-100 text-cyan-700',
      UNKNOWN_ERROR:    'bg-surface text-text-dark/60',
    };
    return map[type] ?? map['UNKNOWN_ERROR'];
  }

  protected onFilterErrorTypeChange(value: string): void {
    this.filterErrorType.set(value);
  }

  protected onFilterPlatformChange(value: string): void {
    this.filterPlatform.set(value);
  }

  protected onUnresolvedOnlyChange(value: boolean): void {
    this.filterUnresolvedOnly.set(value);
  }
}
