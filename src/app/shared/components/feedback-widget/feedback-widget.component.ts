import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FeedbackService } from '../../../features/feedback/services/feedback.service';
import { FeedbackSubmission } from '../../../features/feedback/models/feedback.model';

@Component({
  standalone: true,
  selector: 'pf-feedback-widget',
  templateUrl: './feedback-widget.component.html',
  styleUrl: './feedback-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackWidgetComponent {
  protected readonly feedbackService = inject(FeedbackService);

  // Local UI state (presentation only, not business logic)
  protected readonly currentStep = signal(1);
  protected readonly rating = signal(0);
  protected readonly hoveredStar = signal(0);
  protected readonly pipelinesWorked = signal<'yes' | 'no' | 'partial' | null>(null);
  protected readonly whatWentWrong = signal('');
  protected readonly featureRequest = signal('');
  protected readonly isPublic = signal(false);
  protected readonly displayName = signal('');
  protected readonly company = signal('');

  protected setRating(value: number): void {
    this.rating.set(value);
    this.currentStep.set(2);
  }

  protected setPipelinesWorked(value: 'yes' | 'no' | 'partial'): void {
    this.pipelinesWorked.set(value);
    if (value === 'yes') {
      this.currentStep.set(4); // skip "what went wrong"
    } else {
      this.currentStep.set(3);
    }
  }

  protected nextStep(): void {
    this.currentStep.update(s => Math.min(s + 1, 5));
  }

  protected async onSubmit(): Promise<void> {
    const feedback: FeedbackSubmission = {
      rating: this.rating(),
      pipelinesWorked: this.pipelinesWorked(),
      whatWentWrong: this.whatWentWrong() || null,
      featureRequest: this.featureRequest() || null,
      displayName: this.displayName() || null,
      company: this.company() || null,
      isPublic: this.isPublic(),
    };
    await this.feedbackService.submit(feedback);
  }

  protected resetForm(): void {
    this.currentStep.set(1);
    this.rating.set(0);
    this.hoveredStar.set(0);
    this.pipelinesWorked.set(null);
    this.whatWentWrong.set('');
    this.featureRequest.set('');
    this.isPublic.set(false);
    this.displayName.set('');
    this.company.set('');
  }
}
