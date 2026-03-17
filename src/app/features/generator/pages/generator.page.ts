import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GeneratorStateService } from '../services/generator-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper.component';
import { StepConfig } from '../../../shared/models/stepper.model';
import { StepProjectInfoComponent } from '../components/step-project-info/step-project-info.component';
import { StepMarketsComponent } from '../components/step-markets/step-markets.component';
import { StepLanguagesComponent } from '../components/step-languages/step-languages.component';
import { StepDeployTargetComponent } from '../components/step-deploy-target/step-deploy-target.component';
import { StepReviewComponent } from '../components/step-review/step-review.component';

@Component({
  standalone: true,
  selector: 'pf-generator-page',
  templateUrl: './generator.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepperComponent, StepProjectInfoComponent, StepMarketsComponent, StepLanguagesComponent, StepDeployTargetComponent, StepReviewComponent],
})
export class GeneratorPage {
  protected readonly state = inject(GeneratorStateService);

  protected readonly steps: StepConfig[] = [
    { number: 1, label: 'Project Info' },
    { number: 2, label: 'Markets & Environments' },
    { number: 3, label: 'Languages & Scripts' },
    { number: 4, label: 'Deploy Target' },
    { number: 5, label: 'Review & Generate' },
  ];
}
