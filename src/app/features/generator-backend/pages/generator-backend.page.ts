import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BackendGeneratorStateService, TOTAL_STEPS } from '../services/backend-generator-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper.component';
import { StepConfig } from '../../../shared/models/stepper.model';
import { StepBackendProjectInfoComponent } from '../components/step-backend-project-info/step-backend-project-info.component';
import { StepBackendLanguageComponent } from '../components/step-backend-language/step-backend-language.component';
import { StepBackendBuildConfigComponent } from '../components/step-backend-build-config/step-backend-build-config.component';
import { StepBackendDeployTargetComponent } from '../components/step-backend-deploy-target/step-backend-deploy-target.component';
import { StepBackendEnvironmentsComponent } from '../components/step-backend-environments/step-backend-environments.component';
import { StepBackendReviewComponent } from '../components/step-backend-review/step-backend-review.component';

const BACKEND_STEPS: StepConfig[] = [
  { number: 1, label: 'Project Info' },
  { number: 2, label: 'Language' },
  { number: 3, label: 'Build Config' },
  { number: 4, label: 'Deploy Target' },
  { number: 5, label: 'Environments' },
  { number: 6, label: 'Review' },
];

@Component({
  standalone: true,
  selector: 'pf-generator-backend-page',
  templateUrl: './generator-backend.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StepperComponent,
    StepBackendProjectInfoComponent,
    StepBackendLanguageComponent,
    StepBackendBuildConfigComponent,
    StepBackendDeployTargetComponent,
    StepBackendEnvironmentsComponent,
    StepBackendReviewComponent,
  ],
})
export class GeneratorBackendPage {
  protected readonly state = inject(BackendGeneratorStateService);
  protected readonly steps: StepConfig[] = BACKEND_STEPS;

  protected onStepClick(stepNumber: number): void {
    // Only allow navigating to already-visited steps (up to current)
    if (stepNumber <= this.state.currentStep()) {
      this.state.goToStep(stepNumber);
    }
  }
}
