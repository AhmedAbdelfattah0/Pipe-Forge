import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MobileGeneratorStateService } from '../../services/mobile-generator-state.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import type { MobileBuildType, BuildNumberStrategy } from '../../models/mobile-generator.model';

@Component({
  standalone: true,
  selector: 'pf-step-mobile-build-type',
  templateUrl: './step-mobile-build-type.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CardComponent],
})
export class StepMobileBuildTypeComponent {
  protected readonly state = inject(MobileGeneratorStateService);

  protected readonly buildTypes: { id: MobileBuildType; label: string; desc: string }[] = [
    { id: 'debug',   label: 'Debug',   desc: 'For testing — no signing required' },
    { id: 'release', label: 'Release', desc: 'For distribution — signing required' },
  ];

  protected readonly numberStrategies: { id: BuildNumberStrategy; label: string }[] = [
    { id: 'BuildId', label: 'Build ID (auto)' },
    { id: 'Manual',  label: 'Manual' },
    { id: 'Semver',  label: 'Semantic Versioning' },
  ];

  protected selectBuildType(t: MobileBuildType): void {
    this.state.updateBuildConfig({ buildType: t });
  }

  protected selectStrategy(s: BuildNumberStrategy): void {
    this.state.updateBuildConfig({ buildNumberStrategy: s });
  }
}
