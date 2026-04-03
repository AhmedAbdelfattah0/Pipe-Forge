import {
  ChangeDetectionStrategy, Component, inject, signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Lock, Smartphone, Layers, Zap, Globe } from 'lucide-angular';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  standalone: true,
  selector: 'pf-mobile-coming-soon-page',
  templateUrl: './mobile-coming-soon.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, InputComponent, ButtonComponent, ReactiveFormsModule],
})
export class MobileComingSoonPage {
  protected readonly lockIcon = Lock;
  protected readonly smartphoneIcon = Smartphone;
  protected readonly layersIcon = Layers;
  protected readonly zapIcon = Zap;
  protected readonly globeIcon = Globe;

  protected readonly emailControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
  protected readonly notified = signal(false);

  protected notify(): void {
    if (this.emailControl.invalid) { this.emailControl.markAsTouched(); return; }
    this.notified.set(true);
  }
}
