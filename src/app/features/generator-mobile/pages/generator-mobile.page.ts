import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MobileGeneratorStateService, MOBILE_TOTAL_STEPS } from '../services/mobile-generator-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper.component';
import { StepConfig } from '../../../shared/models/stepper.model';
import { StepMobileProjectInfoComponent } from '../components/step-mobile-project-info/step-mobile-project-info.component';
import { StepMobileFrameworkComponent } from '../components/step-mobile-framework/step-mobile-framework.component';
import { StepMobilePlatformsComponent } from '../components/step-mobile-platforms/step-mobile-platforms.component';
import { StepMobileBuildTypeComponent } from '../components/step-mobile-build-type/step-mobile-build-type.component';
import { StepMobileDistributionComponent } from '../components/step-mobile-distribution/step-mobile-distribution.component';
import { StepMobileReviewComponent } from '../components/step-mobile-review/step-mobile-review.component';

const MOBILE_STEPS: StepConfig[] = [
  { number: 1, label: 'Project Info' },
  { number: 2, label: 'Framework' },
  { number: 3, label: 'Platforms' },
  { number: 4, label: 'Build Type' },
  { number: 5, label: 'Distribution' },
  { number: 6, label: 'Review' },
];

@Component({
  standalone: true,
  selector: 'pf-generator-mobile-page',
  templateUrl: './generator-mobile.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StepperComponent,
    StepMobileProjectInfoComponent,
    StepMobileFrameworkComponent,
    StepMobilePlatformsComponent,
    StepMobileBuildTypeComponent,
    StepMobileDistributionComponent,
    StepMobileReviewComponent,
  ],
})
export class GeneratorMobilePage {
  protected readonly state = inject(MobileGeneratorStateService);
  protected readonly steps: StepConfig[] = MOBILE_STEPS;
}
