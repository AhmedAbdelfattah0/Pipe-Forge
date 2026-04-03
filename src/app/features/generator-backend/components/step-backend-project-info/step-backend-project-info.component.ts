import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BackendGeneratorStateService } from '../../services/backend-generator-state.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import type { BackendCICDPlatform } from '../../models/backend-generator.model';

@Component({
  standalone: true,
  selector: 'pf-step-backend-project-info',
  templateUrl: './step-backend-project-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent],
})
export class StepBackendProjectInfoComponent implements OnInit {
  protected readonly state = inject(BackendGeneratorStateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = new FormGroup({
    projectName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(64)] }),
    repositoryName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(128)] }),
    adoOrg: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(128)] }),
    adoProject: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(128)] }),
    serviceConnectionId: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(256)] }),
  });

  ngOnInit(): void {
    const info = this.state.projectInfo();
    this.form.patchValue({
      projectName: info.projectName,
      repositoryName: info.repositoryName,
      adoOrg: info.adoOrg,
      adoProject: info.adoProject,
      serviceConnectionId: info.serviceConnectionId,
    }, { emitEvent: false });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        this.state.updateProjectInfo({
          projectName: v.projectName ?? '',
          repositoryName: v.repositoryName ?? '',
          adoOrg: v.adoOrg ?? '',
          adoProject: v.adoProject ?? '',
          serviceConnectionId: v.serviceConnectionId ?? '',
        });
      });
  }

  protected selectPlatform(platform: BackendCICDPlatform): void {
    this.state.updateProjectInfo({ ciPlatform: platform });
  }

  protected onNext(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.state.nextStep();
  }
}
