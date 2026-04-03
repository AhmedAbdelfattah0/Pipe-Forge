import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MobileGeneratorStateService } from '../../services/mobile-generator-state.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import type { MobileTargetPlatform } from '../../models/mobile-generator.model';

@Component({
  standalone: true,
  selector: 'pf-step-mobile-platforms',
  templateUrl: './step-mobile-platforms.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CardComponent],
})
export class StepMobilePlatformsComponent {
  protected readonly state = inject(MobileGeneratorStateService);

  protected readonly options: { id: MobileTargetPlatform; label: string }[] = [
    { id: 'android', label: 'Android Only' },
    { id: 'ios',     label: 'iOS Only' },
    { id: 'both',    label: 'Android + iOS' },
  ];

  protected selectPlatform(p: MobileTargetPlatform): void {
    this.state.updatePlatformConfig({ targetPlatform: p });
  }
}
