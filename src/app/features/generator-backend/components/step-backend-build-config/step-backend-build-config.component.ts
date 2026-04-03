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

@Component({
  standalone: true,
  selector: 'pf-step-backend-build-config',
  templateUrl: './step-backend-build-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent],
})
export class StepBackendBuildConfigComponent implements OnInit {
  protected readonly state = inject(BackendGeneratorStateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = new FormGroup({
    installCommand: new FormControl('', { nonNullable: true }),
    testCommand: new FormControl('', { nonNullable: true }),
    buildCommand: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    const build = this.state.buildConfig();
    this.form.patchValue({
      installCommand: build.installCommand,
      testCommand: build.testCommand,
      buildCommand: build.buildCommand,
    }, { emitEvent: false });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        this.state.updateBuildConfig({
          installCommand: v.installCommand ?? '',
          testCommand: v.testCommand ?? '',
          buildCommand: v.buildCommand ?? '',
        });
      });
  }

  protected toggleTests(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.state.updateBuildConfig({ runTests: checked });
  }

  protected toggleBuildStep(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.state.updateBuildConfig({ hasBuildStep: checked });
  }
}
