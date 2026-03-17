import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { DeployTarget } from '../../models/generator.model';
import { GeneratorStateService } from '../../services/generator-state.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';

interface MarketEnvCombo {
  label: string;
  key: string;
}

@Component({
  standalone: true,
  selector: 'pf-step-deploy-target',
  templateUrl: './step-deploy-target.component.html',
  styleUrl: './step-deploy-target.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CardComponent],
})
export class StepDeployTargetComponent {
  protected readonly state = inject(GeneratorStateService);

  // Display-only computed — market×env label/key pairs are a pure presentation concern.
  protected readonly marketEnvCombinations = computed<MarketEnvCombo[]>(() => {
    const combos: MarketEnvCombo[] = [];
    for (const market of this.state.enabledMarkets()) {
      for (const env of this.state.environments()) {
        combos.push({
          label: `${market.name} \u2014 ${env}`,
          key: `${market.code}-${env}`,
        });
      }
    }
    return combos;
  });

  protected selectTarget(target: DeployTarget): void {
    this.state.setDeployTarget(target);
  }

  protected onConfigChange(key: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const target = this.state.deployTarget();

    if (target === 'storage-account') {
      this.state.setStorageAccount(key, value);
    } else if (target === 'static-web-app') {
      this.state.setSwaToken(key, value);
    } else if (target === 'app-service') {
      this.state.setAppServiceName(key, value);
    }
  }

  protected onTriggerToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.state.setTriggerPipelineAfterDeploy(checked);
  }

  protected onTriggerPipelineIdChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.state.setTriggerPipelineId(value);
  }

  protected configValue(key: string): string {
    const target = this.state.deployTarget();
    if (target === 'storage-account') {
      return this.state.storageAccounts()[key] ?? '';
    } else if (target === 'static-web-app') {
      return this.state.swaTokens()[key] ?? '';
    } else if (target === 'app-service') {
      return this.state.appServiceNames()[key] ?? '';
    }
    return '';
  }
}
