import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Check, LucideAngularModule, Zap } from 'lucide-angular';

import { ButtonComponent, InputComponent } from '../../../shared/components';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'pf-auth-signup-page',
  templateUrl: './auth-signup.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, ButtonComponent, InputComponent],
})
export class AuthSignupPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly zapIcon = Zap;
  protected readonly checkIcon = Check;

  protected readonly features = [
    'Generate pipelines for any Azure deployment target',
    'Support for multiple markets and languages',
    'Both YAML and Classic JSON output formats',
  ];

  protected readonly emailControl = new FormControl('', [Validators.required, Validators.email]);
  protected readonly passwordControl = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
  ]);

  protected readonly form = new FormGroup({
    email: this.emailControl,
    password: this.passwordControl,
  });

  protected onSubmit(): void {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this.authService.signup(email!, password!);
      this.router.navigate(['/auth/login']);
    } else {
      this.form.markAllAsTouched();
      this.emailControl.updateValueAndValidity();
      this.passwordControl.updateValueAndValidity();
    }
  }

  protected onGoogleSignIn(): void {
    // TODO: implement Google OAuth
  }
}
