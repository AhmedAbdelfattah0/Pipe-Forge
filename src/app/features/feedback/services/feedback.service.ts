import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FeedbackSubmission, Testimonial } from '../models/feedback.model';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);

  private readonly _isOpen = signal(false);
  private readonly _isSubmitting = signal(false);
  private readonly _submitted = signal(false);

  readonly isOpen = this._isOpen.asReadonly();
  readonly isSubmitting = this._isSubmitting.asReadonly();
  readonly submitted = this._submitted.asReadonly();

  toggle(): void {
    this._isOpen.update(v => !v);
    if (!this._isOpen()) {
      this._submitted.set(false);
    }
  }

  close(): void {
    this._isOpen.set(false);
    this._submitted.set(false);
  }

  open(): void {
    this._isOpen.set(true);
    this._submitted.set(false);
  }

  async submit(feedback: FeedbackSubmission): Promise<void> {
    this._isSubmitting.set(true);
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/feedback`, feedback),
      );
      this._submitted.set(true);
      this.toastService.show('Thank you for your feedback!', 'success');
      setTimeout(() => this.close(), 3000);
    } catch {
      this.toastService.show('Failed to submit feedback. Please try again.', 'error');
    } finally {
      this._isSubmitting.set(false);
    }
  }

  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ testimonials: Testimonial[] }>(
          `${environment.apiUrl}/feedback/testimonials`,
        ),
      );
      return res.testimonials;
    } catch {
      return [];
    }
  }
}
