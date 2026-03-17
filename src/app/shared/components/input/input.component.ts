import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'pf-input',
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class InputComponent implements OnInit {
  @Input({ required: true }) control!: FormControl;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() helperText = '';
  @Input() badge: 'optional' | 'secret' | null = null;
  @Input() type: 'text' | 'password' | 'email' = 'text';

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // Mirror FormControl status changes into OnPush + zoneless change detection.
    this.control.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
  }

  protected onBlur(): void {
    // Angular's FormControlDirective marks the control as touched on blur,
    // but in zoneless mode we must trigger CD manually to show error state.
    this.cdr.markForCheck();
  }

  protected get isInvalid(): boolean {
    return this.control.invalid && this.control.touched;
  }

  protected get errorMessage(): string {
    const errors = this.control.errors;
    if (!errors) return '';
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Enter a valid email address';
    if (errors['minlength']) {
      return `Minimum ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `Maximum ${errors['maxlength'].requiredLength} characters`;
    }
    return 'Invalid value';
  }
}
