import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StepConfig } from '../../models/stepper.model';

@Component({
  standalone: true,
  selector: 'pf-stepper',
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperComponent {
  @Input() currentStep = 1;
  @Input() totalSteps = 5;
  @Input() steps: StepConfig[] = [];

  protected get currentStepLabel(): string {
    return this.steps.find(s => s.number === this.currentStep)?.label ?? '';
  }

  protected isCompleted(stepNumber: number): boolean {
    return stepNumber < this.currentStep;
  }

  protected isActive(stepNumber: number): boolean {
    return stepNumber === this.currentStep;
  }
}
