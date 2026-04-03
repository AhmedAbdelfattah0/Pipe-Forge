import {
  ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MobileGeneratorStateService } from '../../services/mobile-generator-state.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import type { MobileDistribution } from '../../models/mobile-generator.model';

@Component({
  standalone: true,
  selector: 'pf-step-mobile-distribution',
  templateUrl: './step-mobile-distribution.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, CardComponent],
})
export class StepMobileDistributionComponent implements OnInit {
  protected readonly state = inject(MobileGeneratorStateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly distributionOptions: { id: MobileDistribution; label: string; desc: string }[] = [
    { id: 'app-center',  label: 'App Center',  desc: 'Microsoft Visual Studio App Center (Android + iOS)' },
    { id: 'testflight',  label: 'TestFlight',  desc: 'Apple TestFlight (iOS only)' },
    { id: 'play-store',  label: 'Play Store',  desc: 'Google Play Store (Android only)' },
    { id: 'none',        label: 'None',        desc: 'Just build the artifact, no distribution' },
  ];

  protected readonly appCenterForm = new FormGroup({
    appCenterAndroidApp: new FormControl('', { nonNullable: true }),
    appCenterIosApp: new FormControl('', { nonNullable: true }),
    appCenterDistributionGroup: new FormControl('Public', { nonNullable: true }),
  });

  ngOnInit(): void {
    const d = this.state.distributionConfig();
    this.appCenterForm.patchValue({
      appCenterAndroidApp: d.appCenterAndroidApp,
      appCenterIosApp: d.appCenterIosApp,
      appCenterDistributionGroup: d.appCenterDistributionGroup,
    }, { emitEvent: false });

    this.appCenterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => {
      this.state.updateDistributionConfig({
        appCenterAndroidApp: v.appCenterAndroidApp ?? '',
        appCenterIosApp: v.appCenterIosApp ?? '',
        appCenterDistributionGroup: v.appCenterDistributionGroup ?? 'Public',
      });
    });
  }

  protected selectDistribution(d: MobileDistribution): void {
    this.state.updateDistributionConfig({ distribution: d });
  }
}
