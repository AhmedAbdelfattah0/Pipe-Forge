import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GeneratorConfig } from '../models/generator.model';
import { GeneratorStateService } from './generator-state.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class PipelineGeneratorService {
  private readonly http = inject(HttpClient);
  private readonly state = inject(GeneratorStateService);
  private readonly toastService = inject(ToastService);

  private readonly _isGenerating = signal<boolean>(false);
  private readonly _generationStatus = signal<GenerationStatus>('idle');
  private readonly _error = signal<string | null>(null);

  readonly isGenerating = this._isGenerating.asReadonly();
  readonly generationStatus = this._generationStatus.asReadonly();
  readonly error = this._error.asReadonly();

  async generate(): Promise<void> {
    this._isGenerating.set(true);
    this._generationStatus.set('generating');
    this._error.set(null);

    try {
      const config = this.buildConfig();
      const endpoint = config.platform === 'github-actions'
        ? `${environment.apiUrl}/pipelines/generate/github-actions`
        : `${environment.apiUrl}/pipelines/generate`;

      const blob = await firstValueFrom(
        this.http.post(endpoint, config, {
          responseType: 'blob',
        }),
      );

      this.triggerDownload(blob, `${config.projectName || 'pipelines'}-pipelines.zip`);
      this._generationStatus.set('success');
      this.toastService.show('Pipelines generated successfully! Download started.', 'success');

      setTimeout(() => {
        this._generationStatus.set('idle');
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      this._error.set(message);
      this._generationStatus.set('error');
      this.toastService.show(message, 'error');

      setTimeout(() => {
        this._generationStatus.set('idle');
      }, 3000);
    } finally {
      this._isGenerating.set(false);
    }
  }

  private buildConfig(): GeneratorConfig {
    return {
      // Platform
      platform: this.state.platform(),
      githubConfig: {
        owner: this.state.githubOwner(),
        repositoryName: this.state.githubRepo(),
        triggers: this.state.triggers(),
        cronExpression: this.state.cronExpression(),
      },
      githubSwaSecretNames: this.state.githubSwaSecretNames(),
      projectName: this.state.projectName(),
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
      markets: this.state.markets(),
      environments: this.state.environments(),
      isMultiLanguage: this.state.isMultiLanguage(),
      languages: this.state.languages(),
      buildScripts: this.state.buildScripts(),
      tokenReplacement: this.state.tokenReplacement(),
      qualityGates: this.state.qualityGates(),
      deployTarget: this.state.deployTarget(),
      storageAccounts: this.state.storageAccounts(),
      swaTokens: this.state.swaTokens(),
      appServiceNames: this.state.appServiceNames(),
      triggerPipelineAfterDeploy: this.state.triggerPipelineAfterDeploy(),
      triggerPipelineId: this.state.triggerPipelineId(),
      ftpRemotePath: this.state.ftpRemotePath(),
      protectedPaths: this.state.protectedPaths(),
      protectedPathsContainer: this.state.protectedPathsContainer(),
      isMultiMarket: this.state.isMultiMarket(),
      isMultiLanguageBuild: this.state.isMultiLanguageBuild(),
      hasQualityChecks: this.state.hasQualityChecks(),
      modernHosting: this.state.modernHosting(),
      outputFormats: this.state.outputFormats(),
    };
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
