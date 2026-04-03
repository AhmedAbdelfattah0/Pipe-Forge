import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Lock, Cpu, Terminal, Layers, Zap } from 'lucide-angular';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  standalone: true,
  selector: 'pf-backend-coming-soon-page',
  templateUrl: './backend-coming-soon.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, InputComponent, ButtonComponent, ReactiveFormsModule],
})
export class BackendComingSoonPage {
  protected readonly lockIcon = Lock;
  protected readonly cpuIcon = Cpu;
  protected readonly terminalIcon = Terminal;
  protected readonly layersIcon = Layers;
  protected readonly zapIcon = Zap;

  protected readonly emailControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
  protected readonly notified = signal(false);

  protected notify(): void {
    if (this.emailControl.invalid) {
      this.emailControl.markAsTouched();
      return;
    }
    // In production: POST /api/notify-me with email
    this.notified.set(true);
  }
}
