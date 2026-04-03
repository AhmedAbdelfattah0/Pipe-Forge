import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MobileGeneratorStateService } from '../../services/mobile-generator-state.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import type { MobileFramework } from '../../models/mobile-generator.model';

@Component({
  standalone: true,
  selector: 'pf-step-mobile-framework',
  templateUrl: './step-mobile-framework.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CardComponent],
})
export class StepMobileFrameworkComponent {
  protected readonly state = inject(MobileGeneratorStateService);

  protected readonly frameworks: { id: MobileFramework; label: string; desc: string }[] = [
    { id: 'react-native', label: 'React Native', desc: 'JavaScript/TypeScript cross-platform' },
    { id: 'flutter',      label: 'Flutter',      desc: 'Dart cross-platform by Google' },
    { id: 'ios-native',   label: 'iOS Native',   desc: 'Swift / Objective-C + Xcode' },
    { id: 'android-native', label: 'Android Native', desc: 'Kotlin / Java + Gradle' },
  ];

  protected selectFramework(fw: MobileFramework): void {
    this.state.updateFrameworkConfig({ framework: fw });
  }
}
