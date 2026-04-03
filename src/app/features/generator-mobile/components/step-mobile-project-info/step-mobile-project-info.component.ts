import {
  ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MobileGeneratorStateService } from '../../services/mobile-generator-state.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import type { MobileCICDPlatform } from '../../models/mobile-generator.model';

@Component({
  standalone: true,
  selector: 'pf-step-mobile-project-info',
  templateUrl: './step-mobile-project-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent],
})
export class StepMobileProjectInfoComponent implements OnInit {
  protected readonly state = inject(MobileGeneratorStateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = new FormGroup({
    projectName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    repositoryName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    const info = this.state.projectInfo();
    this.form.patchValue({ projectName: info.projectName, repositoryName: info.repositoryName }, { emitEvent: false });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => {
      this.state.updateProjectInfo({ projectName: v.projectName ?? '', repositoryName: v.repositoryName ?? '' });
    });
  }

  protected selectPlatform(platform: MobileCICDPlatform): void {
    this.state.updateProjectInfo({ ciPlatform: platform });
  }

  protected onNext(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.state.nextStep();
  }
}
