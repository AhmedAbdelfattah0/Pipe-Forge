import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { GeneratorStateService } from '../services/generator-state.service';
import { HistoryService } from '../../history/services/history.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper.component';
import { StepConfig } from '../../../shared/models/stepper.model';
import { StepProjectInfoComponent } from '../components/step-project-info/step-project-info.component';
import { StepMarketsComponent } from '../components/step-markets/step-markets.component';
import { StepLanguagesComponent } from '../components/step-languages/step-languages.component';
import { StepDeployTargetComponent } from '../components/step-deploy-target/step-deploy-target.component';
import { StepReviewComponent } from '../components/step-review/step-review.component';

/** All five step configs with static labels. */
const ALL_STEPS: StepConfig[] = [
  { number: 1, label: 'Project Info' },
  { number: 2, label: 'Markets & Environments' },
  { number: 3, label: 'Languages & Scripts' },
  { number: 4, label: 'Deploy Target' },
  { number: 5, label: 'Review & Generate' },
];

@Component({
  standalone: true,
  selector: 'pf-generator-page',
  templateUrl: './generator.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepperComponent, StepProjectInfoComponent, StepMarketsComponent, StepLanguagesComponent, StepDeployTargetComponent, StepReviewComponent],
})
export class GeneratorPage {
  protected readonly state = inject(GeneratorStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly historyService = inject(HistoryService);
  private readonly toastService = inject(ToastService);

  /**
   * Reactive signal from the route's query params — updates automatically
   * even on same-path navigation (e.g. /generator/frontend → /generator/frontend?edit=id).
   */
  private readonly editId = toSignal(
    this.route.queryParamMap.pipe(map(p => p.get('edit'))),
    { initialValue: this.route.snapshot.queryParamMap.get('edit') },
  );

  /**
   * Computed step config array for the stepper.
   * Steps 2 and 3 are marked as skipped when their respective toggles are OFF.
   */
  protected readonly steps = computed<StepConfig[]>(() => {
    const active = this.state.activeSteps();
    return ALL_STEPS.map(s => ({
      ...s,
      skipped: !active.includes(s.number),
    }));
  });

  /** Message to show when the user clicks a skipped step. */
  protected readonly skippedStepMessage = computed<string | null>(() => {
    const step = this.state.currentStep();
    const active = this.state.activeSteps();
    if (!active.includes(step)) {
      return 'Enable this option in Step 1 to configure it.';
    }
    return null;
  });

  constructor() {
    effect(() => {
      const editId = this.editId();
      void this.handleEditParam(editId);
    });
  }

  private async handleEditParam(editId: string | null): Promise<void> {
    if (editId) {
      // Edit mode: fetch the project from the API and load its config into the wizard.
      const project = await this.historyService.getProject(editId);

      if (!project) {
        // Project not found or fetch failed — show an error and keep URL intact.
        this.toastService.show('Could not load project for editing. Please try again.', 'error');
        return;
      }

      this.state.loadFromConfig(project.configSnapshot);
      this.state.setEditingId(editId);
    } else if (this.state.editingId()) {
      // No ?edit= param but a stale editingId was left in memory — clear it.
      this.state.clearEditingId();
    }
  }

  protected onStepClick(stepNumber: number): void {
    const active = this.state.activeSteps();
    if (!active.includes(stepNumber)) {
      // Skipped — redirect back to Step 1 with a notification
      this.state.goToStep(1);
      return;
    }
    this.state.goToStep(stepNumber);
  }
}
