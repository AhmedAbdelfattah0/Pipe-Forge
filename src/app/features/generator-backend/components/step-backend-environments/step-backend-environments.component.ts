import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BackendGeneratorStateService } from '../../services/backend-generator-state.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import type { BackendEnvironmentScope } from '../../models/backend-generator.model';

@Component({
  standalone: true,
  selector: 'pf-step-backend-environments',
  templateUrl: './step-backend-environments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent],
})
export class StepBackendEnvironmentsComponent implements OnInit {
  protected readonly state = inject(BackendGeneratorStateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly scopes: { id: BackendEnvironmentScope; label: string }[] = [
    { id: 'qa',   label: 'QA Only' },
    { id: 'prod', label: 'Production Only' },
    { id: 'both', label: 'QA + Production' },
  ];

  protected readonly form = new FormGroup({
    qaBranch: new FormControl('develop', { nonNullable: true }),
    qaAppServiceName: new FormControl('', { nonNullable: true }),
    prodBranch: new FormControl('main', { nonNullable: true }),
    prodAppServiceName: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    const envs = this.state.environments();
    this.form.patchValue({
      qaBranch: envs.qaBranch,
      qaAppServiceName: envs.qaAppServiceName,
      prodBranch: envs.prodBranch,
      prodAppServiceName: envs.prodAppServiceName,
    }, { emitEvent: false });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        this.state.updateEnvironments({
          qaBranch: v.qaBranch ?? 'develop',
          qaAppServiceName: v.qaAppServiceName ?? '',
          prodBranch: v.prodBranch ?? 'main',
          prodAppServiceName: v.prodAppServiceName ?? '',
        });
      });
  }

  protected selectScope(scope: BackendEnvironmentScope): void {
    this.state.updateEnvironments({ scope });
  }
}
