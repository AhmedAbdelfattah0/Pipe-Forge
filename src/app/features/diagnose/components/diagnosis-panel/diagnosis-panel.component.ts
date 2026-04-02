/**
 * diagnosis-panel.component.ts
 *
 * Slide-in diagnosis panel for the AI Error Diagnosis feature (Task 23).
 *
 * Receives the generation ID as an input.
 * All state is owned by DiagnoseService (ViewModel).
 * The component only delegates to the service and renders from signals.
 */

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  LucideAngularModule,
  X,
  Stethoscope,
  AlertCircle,
  Wrench,
  RefreshCw,
  Loader,
} from 'lucide-angular';
import { DiagnoseService } from '../../services/diagnose.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FeatureGateComponent } from '../../../../shared/components/feature-gate/feature-gate.component';
import { PlanGateService } from '../../../billing/services/plan-gate.service';

@Component({
  standalone: true,
  selector: 'pf-diagnosis-panel',
  templateUrl: './diagnosis-panel.component.html',
  styleUrl: './diagnosis-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ButtonComponent, FeatureGateComponent],
})
export class DiagnosisPanelComponent implements OnInit {
  /** The generation (project) ID this panel was opened for. */
  @Input({ required: true }) generationId!: string;

  protected readonly diagnose = inject(DiagnoseService);
  protected readonly planGate = inject(PlanGateService);

  // Lucide icons
  protected readonly xIcon = X;
  protected readonly stethoscopeIcon = Stethoscope;
  protected readonly alertCircleIcon = AlertCircle;
  protected readonly wrenchIcon = Wrench;
  protected readonly refreshIcon = RefreshCw;
  protected readonly loaderIcon = Loader;

  /** The error log textarea value — local signal since it is ephemeral UI state. */
  protected readonly errorLog = signal<string>('');

  ngOnInit(): void {
    this.errorLog.set('');
  }

  protected onErrorLogInput(event: Event): void {
    this.errorLog.set((event.target as HTMLTextAreaElement).value);
  }

  protected onAnalyse(): void {
    const log = this.errorLog().trim();
    if (!log) return;
    this.diagnose.diagnose(this.generationId, log);
  }

  protected onRegenerateWithFix(): void {
    const result = this.diagnose.result();
    if (!result?.updatedConfig) return;
    this.diagnose.regenerateWithFix(this.generationId, result.updatedConfig);
  }

  protected onClose(): void {
    this.diagnose.closePanel();
  }
}
