import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GeneratorStateService } from '../../services/generator-state.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ToggleComponent } from '../../../../shared/components/toggle/toggle.component';

@Component({
  standalone: true,
  selector: 'pf-step-project-info',
  templateUrl: './step-project-info.component.html',
  styleUrl: './step-project-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, InputComponent, ToggleComponent, ButtonComponent],
})
export class StepProjectInfoComponent implements OnInit {
  protected readonly state = inject(GeneratorStateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = new FormGroup({
    mfeName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    repositoryName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    nodeVersion: new FormControl<'18.x' | '20.x' | '22.x'>('20.x', { nonNullable: true }),
    distFolder: new FormControl('', { nonNullable: true, validators: Validators.required }),
    installFlags: new FormControl('', { nonNullable: true }),
    hasBrowserSubfolder: new FormControl(false, { nonNullable: true }),
    qaBranch: new FormControl('', { nonNullable: true, validators: Validators.required }),
    productionBranch: new FormControl('main', { nonNullable: true, validators: Validators.required }),
    adoOrganization: new FormControl('', { nonNullable: true, validators: Validators.required }),
    adoProjectName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    serviceConnectionId: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  ngOnInit(): void {
    // Restore values from service when navigating back to step 1
    this.form.patchValue({
      mfeName: this.state.mfeName(),
      repositoryName: this.state.repositoryName(),
      nodeVersion: this.state.nodeVersion(),
      distFolder: this.state.distFolder(),
      installFlags: this.state.installFlags(),
      hasBrowserSubfolder: this.state.hasBrowserSubfolder(),
      qaBranch: this.state.qaBranch(),
      productionBranch: this.state.productionBranch(),
      adoOrganization: this.state.adoOrganization(),
      adoProjectName: this.state.adoProjectName(),
      serviceConnectionId: this.state.serviceConnectionId(),
    }, { emitEvent: false });

    // One-way sync: form → service
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        this.state.setMfeName(v.mfeName ?? '');
        this.state.setRepositoryName(v.repositoryName ?? '');
        this.state.setNodeVersion(v.nodeVersion ?? '20.x');
        this.state.setDistFolder(v.distFolder ?? '');
        this.state.setInstallFlags(v.installFlags ?? '');
        this.state.setHasBrowserSubfolder(v.hasBrowserSubfolder ?? false);
        this.state.setQaBranch(v.qaBranch ?? '');
        this.state.setProductionBranch(v.productionBranch ?? '');
        this.state.setAdoOrganization(v.adoOrganization ?? '');
        this.state.setAdoProjectName(v.adoProjectName ?? '');
        this.state.setServiceConnectionId(v.serviceConnectionId ?? '');
      });
  }
}
