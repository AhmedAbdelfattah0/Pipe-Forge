import { computed, Injectable, signal } from '@angular/core';
import {
  AppServiceConfig,
  BuildScriptMatrix,
  DeployTarget,
  EnvironmentType,
  GeneratedFile,
  Language,
  Market,
  OutputFormat,
  PipelineCombination,
  StaticWebAppConfig,
  StorageAccountConfig,
  TokenReplacement,
} from '../models/generator.model';

@Injectable({ providedIn: 'root' })
export class GeneratorStateService {

  // ── Step Navigation ───────────────────────────────────────────────────────
  private readonly _currentStep = signal<number>(1);
  readonly currentStep = this._currentStep.asReadonly();
  readonly totalSteps = 5;

  // ── Step 1 Signals ────────────────────────────────────────────────────────
  private readonly _mfeName = signal<string>('');
  private readonly _repositoryName = signal<string>('');
  private readonly _nodeVersion = signal<'18.x' | '20.x' | '22.x'>('20.x');
  private readonly _distFolder = signal<string>('');
  private readonly _installFlags = signal<string>('');
  private readonly _hasBrowserSubfolder = signal<boolean>(false);
  private readonly _qaBranch = signal<string>('');
  private readonly _productionBranch = signal<string>('main');
  private readonly _adoOrganization = signal<string>('');
  private readonly _adoProjectName = signal<string>('');
  private readonly _serviceConnectionId = signal<string>('');

  // ── Step 2 Signals ────────────────────────────────────────────────────────
  private readonly _markets = signal<Market[]>([
    { name: 'KSA', code: 'sa', enabled: true },
    { name: 'Bahrain', code: 'bh', enabled: true },
  ]);
  private readonly _environments = signal<EnvironmentType[]>(['QA', 'PROD']);

  // ── Step 3 Signals ────────────────────────────────────────────────────────
  private readonly _languages = signal<Language[]>([
    { name: 'EN', code: 'en' },
  ]);
  private readonly _isMultiLanguage = signal<boolean>(false);
  private readonly _buildScripts = signal<BuildScriptMatrix>({});
  private readonly _tokenReplacement = signal<TokenReplacement>({
    enabled: false,
    environmentFilePath: '',
    secretVariableNames: '',
  });

  // ── Step 4 Signals ────────────────────────────────────────────────────────
  private readonly _deployTarget = signal<DeployTarget | null>(null);
  private readonly _storageAccounts = signal<StorageAccountConfig>({});
  private readonly _swaTokens = signal<StaticWebAppConfig>({});
  private readonly _appServiceNames = signal<AppServiceConfig>({});
  private readonly _triggerPipelineAfterDeploy = signal<boolean>(false);
  private readonly _triggerPipelineId = signal<string>('');

  // ── Step 5 Signals ────────────────────────────────────────────────────────
  private readonly _outputFormats = signal<OutputFormat[]>(['yaml', 'classic-json']);

  // ── Public Readonly Signals ───────────────────────────────────────────────
  readonly mfeName = this._mfeName.asReadonly();
  readonly repositoryName = this._repositoryName.asReadonly();
  readonly nodeVersion = this._nodeVersion.asReadonly();
  readonly distFolder = this._distFolder.asReadonly();
  readonly installFlags = this._installFlags.asReadonly();
  readonly hasBrowserSubfolder = this._hasBrowserSubfolder.asReadonly();
  readonly qaBranch = this._qaBranch.asReadonly();
  readonly productionBranch = this._productionBranch.asReadonly();
  readonly adoOrganization = this._adoOrganization.asReadonly();
  readonly adoProjectName = this._adoProjectName.asReadonly();
  readonly serviceConnectionId = this._serviceConnectionId.asReadonly();
  readonly markets = this._markets.asReadonly();
  readonly environments = this._environments.asReadonly();
  readonly languages = this._languages.asReadonly();
  readonly isMultiLanguage = this._isMultiLanguage.asReadonly();
  readonly buildScripts = this._buildScripts.asReadonly();
  readonly tokenReplacement = this._tokenReplacement.asReadonly();
  readonly deployTarget = this._deployTarget.asReadonly();
  readonly storageAccounts = this._storageAccounts.asReadonly();
  readonly swaTokens = this._swaTokens.asReadonly();
  readonly appServiceNames = this._appServiceNames.asReadonly();
  readonly triggerPipelineAfterDeploy = this._triggerPipelineAfterDeploy.asReadonly();
  readonly triggerPipelineId = this._triggerPipelineId.asReadonly();
  readonly outputFormats = this._outputFormats.asReadonly();

  // ── Computed Values ───────────────────────────────────────────────────────
  readonly enabledMarkets = computed(() =>
    this._markets().filter(m => m.enabled)
  );

  readonly pipelineCombinations = computed<PipelineCombination[]>(() => {
    const combinations: PipelineCombination[] = [];
    const mfeName = this._mfeName().toUpperCase();
    const isMulti = this._isMultiLanguage();

    for (const market of this.enabledMarkets()) {
      const marketCode = market.name.toUpperCase()
        .replace('KSA', 'SAUDI')
        .replace('BAHRAIN', 'BH');

      for (const env of this._environments()) {
        const branchName = env === 'QA' ? this._qaBranch() : this._productionBranch();

        if (isMulti) {
          for (const lang of this._languages()) {
            const pipelineName = `${env}-${marketCode}-${mfeName}-${lang.name}`;
            combinations.push({
              market,
              environment: env,
              language: lang,
              pipelineName,
              artifactAlias: `_${pipelineName}`,
              deploymentPath: `${market.code}/${lang.code}/${this._mfeName().toLowerCase()}`,
              buildScript: this._buildScripts()[`${market.code}-${env}-${lang.code}`] || '',
              branchName,
            });
          }
        } else {
          const pipelineName = `${env}-${marketCode}-${mfeName}`;
          combinations.push({
            market,
            environment: env,
            pipelineName,
            artifactAlias: `_${pipelineName}`,
            deploymentPath: `${market.code}/${this._mfeName().toLowerCase()}`,
            buildScript: this._buildScripts()[`${market.code}-${env}`] || '',
            branchName,
          });
        }
      }
    }
    return combinations;
  });

  readonly totalPipelineCount = computed(() =>
    this.pipelineCombinations().length * 2 // build + release
  );

  readonly generatedFileList = computed<GeneratedFile[]>(() => {
    const files: GeneratedFile[] = [];
    const mfe = this._mfeName() || 'my-app';
    const formats = this._outputFormats();

    for (const combo of this.pipelineCombinations()) {
      if (formats.includes('yaml')) {
        files.push({
          name: `${combo.pipelineName}.yml`,
          path: `${mfe}-pipelines/build/`,
          type: 'build-yaml',
        });
      }
      if (formats.includes('classic-json')) {
        files.push({
          name: `${combo.pipelineName}.json`,
          path: `${mfe}-pipelines/build/`,
          type: 'build-json',
        });
        files.push({
          name: `${combo.pipelineName}.json`,
          path: `${mfe}-pipelines/release/`,
          type: 'release-json',
        });
      }
    }

    files.push({
      name: 'README.md',
      path: `${mfe}-pipelines/`,
      type: 'readme',
    });

    return files;
  });

  readonly isStep1Valid = computed(() =>
    this._mfeName().trim().length > 0 &&
    this._repositoryName().trim().length > 0 &&
    this._distFolder().trim().length > 0 &&
    this._adoOrganization().trim().length > 0 &&
    this._adoProjectName().trim().length > 0 &&
    this._serviceConnectionId().trim().length > 0
  );

  readonly isStep2Valid = computed(() =>
    this.enabledMarkets().length > 0 &&
    this._environments().length > 0
  );

  readonly isStep3Valid = computed(() => true);

  readonly isStep4Valid = computed(() =>
    this._deployTarget() !== null
  );

  // ── Step Navigation Methods ───────────────────────────────────────────────
  nextStep(): void {
    this._currentStep.update(s => Math.min(s + 1, this.totalSteps));
  }

  prevStep(): void {
    this._currentStep.update(s => Math.max(s - 1, 1));
  }

  goToStep(step: number): void {
    this._currentStep.set(step);
  }

  // ── Step 1 Mutations ──────────────────────────────────────────────────────
  setMfeName(v: string): void { this._mfeName.set(v); }
  setRepositoryName(v: string): void { this._repositoryName.set(v); }
  setNodeVersion(v: '18.x' | '20.x' | '22.x'): void { this._nodeVersion.set(v); }
  setDistFolder(v: string): void { this._distFolder.set(v); }
  setInstallFlags(v: string): void { this._installFlags.set(v); }
  setHasBrowserSubfolder(v: boolean): void { this._hasBrowserSubfolder.set(v); }
  setQaBranch(v: string): void { this._qaBranch.set(v); }
  setProductionBranch(v: string): void { this._productionBranch.set(v); }
  setAdoOrganization(v: string): void { this._adoOrganization.set(v); }
  setAdoProjectName(v: string): void { this._adoProjectName.set(v); }
  setServiceConnectionId(v: string): void { this._serviceConnectionId.set(v); }

  // ── Step 2 Mutations ──────────────────────────────────────────────────────
  addMarket(market: Market): void {
    this._markets.update(m => [...m, market]);
  }

  removeMarket(index: number): void {
    this._markets.update(m => m.filter((_, i) => i !== index));
  }

  toggleMarket(index: number): void {
    this._markets.update(m =>
      m.map((market, i) =>
        i === index ? { ...market, enabled: !market.enabled } : market
      )
    );
  }

  updateMarket(index: number, market: Market): void {
    this._markets.update(m =>
      m.map((item, i) => i === index ? market : item)
    );
  }

  toggleEnvironment(env: EnvironmentType): void {
    this._environments.update(envs =>
      envs.includes(env)
        ? envs.filter(e => e !== env)
        : [...envs, env]
    );
  }

  // ── Step 3 Mutations ──────────────────────────────────────────────────────
  setIsMultiLanguage(v: boolean): void {
    this._isMultiLanguage.set(v);
    if (!v) {
      // Reset to single default language and clear scripts when disabling multi-language
      this._languages.set([{ name: 'EN', code: 'en' }]);
      this._buildScripts.set({});
    }
  }

  addLanguage(lang: Language): void {
    this._languages.update(l => [...l, lang]);
  }

  removeLanguage(index: number): void {
    this._languages.update(l => l.filter((_, i) => i !== index));
  }

  updateLanguage(index: number, lang: Language): void {
    this._languages.update(l =>
      l.map((item, i) => i === index ? lang : item)
    );
  }

  setBuildScript(key: string, value: string): void {
    this._buildScripts.update(s => ({ ...s, [key]: value }));
  }

  setTokenReplacement(config: TokenReplacement): void {
    this._tokenReplacement.set(config);
  }

  // ── Step 4 Mutations ──────────────────────────────────────────────────────
  setDeployTarget(target: DeployTarget): void {
    this._deployTarget.set(target);
  }

  setStorageAccount(key: string, value: string): void {
    this._storageAccounts.update(s => ({ ...s, [key]: value }));
  }

  setSwaToken(key: string, value: string): void {
    this._swaTokens.update(s => ({ ...s, [key]: value }));
  }

  setAppServiceName(key: string, value: string): void {
    this._appServiceNames.update(s => ({ ...s, [key]: value }));
  }

  setTriggerPipelineAfterDeploy(v: boolean): void {
    this._triggerPipelineAfterDeploy.set(v);
  }

  setTriggerPipelineId(v: string): void {
    this._triggerPipelineId.set(v);
  }

  // ── Step 5 Mutations ──────────────────────────────────────────────────────
  toggleOutputFormat(format: OutputFormat): void {
    this._outputFormats.update(formats =>
      formats.includes(format)
        ? formats.filter(f => f !== format)
        : [...formats, format]
    );
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  reset(): void {
    this._currentStep.set(1);
    this._mfeName.set('');
    this._repositoryName.set('');
    this._nodeVersion.set('20.x');
    this._distFolder.set('');
    this._installFlags.set('');
    this._hasBrowserSubfolder.set(false);
    this._qaBranch.set('');
    this._productionBranch.set('main');
    this._adoOrganization.set('');
    this._adoProjectName.set('');
    this._serviceConnectionId.set('');
    this._markets.set([
      { name: 'KSA', code: 'sa', enabled: true },
      { name: 'Bahrain', code: 'bh', enabled: true },
    ]);
    this._environments.set(['QA', 'PROD']);
    this._isMultiLanguage.set(false);
    this._languages.set([{ name: 'EN', code: 'en' }]);
    this._buildScripts.set({});
    this._tokenReplacement.set({
      enabled: false,
      environmentFilePath: '',
      secretVariableNames: '',
    });
    this._deployTarget.set(null);
    this._storageAccounts.set({});
    this._swaTokens.set({});
    this._appServiceNames.set({});
    this._triggerPipelineAfterDeploy.set(false);
    this._triggerPipelineId.set('');
    this._outputFormats.set(['yaml', 'classic-json']);
  }
}
