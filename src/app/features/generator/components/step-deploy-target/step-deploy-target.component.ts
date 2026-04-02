import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { DeployTarget, ModernHostingConfig } from '../../models/generator.model';
import { GeneratorStateService } from '../../services/generator-state.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ToggleInlineComponent } from '../../../../shared/components/toggle-inline/toggle-inline.component';

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
  imports: [BadgeComponent, ButtonComponent, CardComponent, ToggleInlineComponent],
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

  protected onTriggerToggle(checked: boolean): void {
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

  protected onProtectedPathsToggle(checked: boolean): void {
    if (!checked) {
      this.state.setProtectedPaths([]);
    }
  }

  protected onProtectedPathsChange(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    const paths = value
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    this.state.setProtectedPaths(paths);
  }

  protected protectedPathsText(): string {
    return this.state.protectedPaths().join('\n');
  }

  protected onFtpRemotePathChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.state.setFtpRemotePath(value);
  }

  protected onGithubSwaSecretChange(key: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.state.setGithubSwaSecretName(key, value);
  }

  protected githubSwaSecretValue(key: string): string {
    return this.state.githubSwaSecretNames()[key] ?? '';
  }

  /** Returns true when the selected deploy target is a modern hosting platform (GHA-only). */
  protected isModernHostingTarget(): boolean {
    const modernTargets: DeployTarget[] = ['vercel', 'netlify', 'firebase', 'github-pages', 'cloudflare-pages'];
    return modernTargets.includes(this.state.deployTarget() as DeployTarget);
  }

  protected onModernHostingChange(field: keyof ModernHostingConfig, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.state.setModernHosting({ [field]: value });
  }
}
