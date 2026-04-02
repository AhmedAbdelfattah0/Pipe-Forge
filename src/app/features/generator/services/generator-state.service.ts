import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AppServiceConfig,
  BuildScriptMatrix,
  CICDPlatform,
  DeployTarget,
  EnvironmentType,
  GeneratedFile,
  GitHubConfig,
  GitHubSwaSecretNames,
  Language,
  Market,
  ModernHostingConfig,
  OutputFormat,
  PipelineCombination,
  StaticWebAppConfig,
  StorageAccountConfig,
  TokenReplacement,
  QualityGates,
  QualityGateScript,
} from '../models/generator.model';
import { ProfileService } from '../../profile/services/profile.service';

@Injectable({ providedIn: 'root' })
export class GeneratorStateService {
  private readonly profileService = inject(ProfileService);

  // ── Adaptive wizard toggles (Step 1) ─────────────────────────────────────
  private readonly _isMultiMarket = signal<boolean>(false);
  private readonly _isMultiLanguageBuild = signal<boolean>(false);
  private readonly _hasQualityChecks = signal<boolean>(false);

  // ── Step Navigation ───────────────────────────────────────────────────────
  private readonly _currentStep = signal<number>(1);
  readonly currentStep = this._currentStep.asReadonly();
  readonly totalSteps = 5;

  /**
   * The ordered list of step numbers visible to the user.
   * Steps 2 and 3 are conditionally included based on wizard toggles.
   *
   *   All OFF     → [1, 4, 5]
   *   Market ON   → [1, 2, 4, 5]
   *   Language ON → [1, 3, 4, 5]
   *   Both ON     → [1, 2, 3, 4, 5]
   */
  readonly activeSteps = computed<number[]>(() => {
    const steps = [1];
    if (this._isMultiMarket()) steps.push(2);
    if (this._isMultiLanguageBuild()) steps.push(3);
    steps.push(4, 5);
    return steps;
  });

  // ── Platform Selection ──────────────────────────────────────────────────
  private readonly _platform = signal<CICDPlatform>('azure-devops');
  private readonly _githubOwner = signal<string>('');
  private readonly _githubRepo = signal<string>('');
  private readonly _triggers = signal<GitHubConfig['triggers']>({
    push: true,
    pullRequest: true,
    manual: true,
    schedule: false,
  });
  private readonly _cronExpression = signal<string>('0 2 * * 1');
  private readonly _githubSwaSecretNames = signal<GitHubSwaSecretNames>({});

  // ── Step 1 Signals ────────────────────────────────────────────────────────
  private readonly _projectName = signal<string>('');
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
    filePattern: 'src/environments/environment.*.ts',
    tokenFormat: '#{TOKEN}#',
    tokenMappings: [],
    environmentFilePath: '',
    secretVariableNames: '',
  });
  private readonly _qualityGates = signal<QualityGates>({
    enabled: false,
    typescript: { enabled: false, command: '' },
    lint: { enabled: false, command: '' },
    tests: { enabled: false, command: '' },
    format: { enabled: false, command: '' },
  });

  // ── Step 4 Signals ────────────────────────────────────────────────────────
  private readonly _deployTarget = signal<DeployTarget | null>(null);
  private readonly _storageAccounts = signal<StorageAccountConfig>({});
  private readonly _swaTokens = signal<StaticWebAppConfig>({});
  private readonly _appServiceNames = signal<AppServiceConfig>({});
  private readonly _triggerPipelineAfterDeploy = signal<boolean>(false);
  private readonly _triggerPipelineId = signal<string>('');
  private readonly _ftpRemotePath = signal<string>('/public_html/');
  private readonly _protectedPaths = signal<string[]>([]);
  private readonly _modernHosting = signal<ModernHostingConfig>({
    ghPagesBranch: 'gh-pages',
  });

  // ── Step 5 Signals ────────────────────────────────────────────────────────
  private readonly _outputFormats = signal<OutputFormat[]>(['yaml', 'classic-json']);

  // ── Public Readonly Signals ───────────────────────────────────────────────
  readonly isMultiMarket = this._isMultiMarket.asReadonly();
  readonly isMultiLanguageBuild = this._isMultiLanguageBuild.asReadonly();
  readonly hasQualityChecks = this._hasQualityChecks.asReadonly();
  readonly modernHosting = this._modernHosting.asReadonly();
  readonly platform = this._platform.asReadonly();
  readonly githubOwner = this._githubOwner.asReadonly();
  readonly githubRepo = this._githubRepo.asReadonly();
  readonly triggers = this._triggers.asReadonly();
  readonly cronExpression = this._cronExpression.asReadonly();
  readonly githubSwaSecretNames = this._githubSwaSecretNames.asReadonly();
  readonly projectName = this._projectName.asReadonly();
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
  readonly qualityGates = this._qualityGates.asReadonly();
  readonly deployTarget = this._deployTarget.asReadonly();
  readonly storageAccounts = this._storageAccounts.asReadonly();
  readonly swaTokens = this._swaTokens.asReadonly();
  readonly appServiceNames = this._appServiceNames.asReadonly();
  readonly triggerPipelineAfterDeploy = this._triggerPipelineAfterDeploy.asReadonly();
  readonly triggerPipelineId = this._triggerPipelineId.asReadonly();
  readonly ftpRemotePath = this._ftpRemotePath.asReadonly();
  readonly protectedPaths = this._protectedPaths.asReadonly();
  readonly protectedPathsContainer = computed(() => {
    const project = this._projectName().toLowerCase().replace(/[^a-z0-9-]/g, '') || 'my-app';
    return `${project}-protected`;
  });
  readonly outputFormats = this._outputFormats.asReadonly();

  // ── Computed Values ───────────────────────────────────────────────────────
  readonly enabledMarkets = computed(() =>
    this._markets().filter(m => m.enabled)
  );

  readonly pipelineCombinations = computed<PipelineCombination[]>(() => {
    const combinations: PipelineCombination[] = [];
    const projectName = this._projectName().toUpperCase();
    const isMulti = this._isMultiLanguage();
    const isGHA = this._platform() === 'github-actions';

    for (const market of this.enabledMarkets()) {
      const marketCode = isGHA
        ? market.code  // GHA uses lowercase code: sa, bh
        : market.name.toUpperCase()
            .replace('KSA', 'SAUDI')
            .replace('BAHRAIN', 'BH');

      for (const env of this._environments()) {
        const branchName = env === 'QA' ? this._qaBranch() : this._productionBranch();

        if (isMulti) {
          for (const lang of this._languages()) {
            const pipelineName = isGHA
              ? `deploy-${market.code}-${env.toLowerCase()}-${lang.code}`
              : `${env}-${marketCode}-${projectName}-${lang.name}`;
            combinations.push({
              market,
              environment: env,
              language: lang,
              pipelineName,
              artifactAlias: `_${pipelineName}`,
              deploymentPath: `${market.code}/${lang.code}/${this._projectName().toLowerCase()}`,
              buildScript: this._buildScripts()[`${market.code}-${env}-${lang.code}`] || '',
              branchName,
            });
          }
        } else {
          const pipelineName = isGHA
            ? `deploy-${market.code}-${env.toLowerCase()}`
            : `${env}-${marketCode}-${projectName}`;
          combinations.push({
            market,
            environment: env,
            pipelineName,
            artifactAlias: `_${pipelineName}`,
            deploymentPath: `${market.code}/${this._projectName().toLowerCase()}`,
            buildScript: this._buildScripts()[`${market.code}-${env}`] || '',
            branchName,
          });
        }
      }
    }
    return combinations;
  });

  readonly totalPipelineCount = computed(() => {
    if (this._platform() === 'github-actions') {
      return this.pipelineCombinations().length; // one combined workflow per combination
    }
    return this.pipelineCombinations().length * 2; // build + release for ADO
  });

  readonly generatedFileList = computed<GeneratedFile[]>(() => {
    const files: GeneratedFile[] = [];
    const mfe = this._projectName() || 'my-app';
    const isGHA = this._platform() === 'github-actions';

    if (isGHA) {
      // GitHub Actions: one workflow file per combination
      for (const combo of this.pipelineCombinations()) {
        files.push({
          name: `${combo.pipelineName}.yml`,
          path: `${mfe}-pipelines/.github/workflows/`,
          type: 'gha-workflow',
        });
      }
      files.push({
        name: 'SECRETS_GUIDE.md',
        path: `${mfe}-pipelines/`,
        type: 'secrets-guide',
      });
    } else {
      // Azure DevOps: existing logic
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
    }

    files.push({
      name: 'README.md',
      path: `${mfe}-pipelines/`,
      type: 'readme',
    });

    return files;
  });

  readonly isStep1Valid = computed(() => {
    const baseValid =
      this._projectName().trim().length > 0 &&
      this._repositoryName().trim().length > 0 &&
      this._distFolder().trim().length > 0;

    if (this._platform() === 'github-actions') {
      return baseValid &&
        this._githubOwner().trim().length > 0 &&
        this._githubRepo().trim().length > 0;
    }

    // Azure DevOps
    return baseValid &&
      this._adoOrganization().trim().length > 0 &&
      this._adoProjectName().trim().length > 0 &&
      this._serviceConnectionId().trim().length > 0;
  });

  readonly isStep2Valid = computed(() =>
    this.enabledMarkets().length > 0 &&
    this._environments().length > 0
  );

  readonly isStep3Valid = computed(() => true);

  readonly isStep4Valid = computed(() =>
    this._deployTarget() !== null
  );

  // ── Step Navigation Methods ───────────────────────────────────────────────

  /** Advances to the next active step (skips inactive steps). */
  nextStep(): void {
    const active = this.activeSteps();
    const idx = active.indexOf(this._currentStep());
    if (idx !== -1 && idx < active.length - 1) {
      this._currentStep.set(active[idx + 1]);
    }
  }

  /** Goes back to the previous active step (skips inactive steps). */
  prevStep(): void {
    const active = this.activeSteps();
    const idx = active.indexOf(this._currentStep());
    if (idx > 0) {
      this._currentStep.set(active[idx - 1]);
    }
  }

  goToStep(step: number): void {
    this._currentStep.set(step);
  }

  // ── Wizard Toggle Mutations ───────────────────────────────────────────────
  setIsMultiMarket(v: boolean): void {
    this._isMultiMarket.set(v);
    // When disabling multi-market, reset to the first active step if current step is 2
    if (!v && this._currentStep() === 2) {
      this._currentStep.set(1);
    }
  }

  setIsMultiLanguageBuild(v: boolean): void {
    this._isMultiLanguageBuild.set(v);
    // Sync isMultiLanguage state to keep them aligned
    this._isMultiLanguage.set(v);
    if (!v) {
      this._languages.set([{ name: 'EN', code: 'en' }]);
      this._buildScripts.set({});
      if (this._currentStep() === 3) {
        this._currentStep.set(1);
      }
    }
  }

  setHasQualityChecks(v: boolean): void {
    this._hasQualityChecks.set(v);
    this._qualityGates.update(q => ({ ...q, enabled: v }));
  }

  // ── Step 1 Mutations ──────────────────────────────────────────────────────
  setProjectName(v: string): void { this._projectName.set(v); }
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

  // ── Platform Mutations ──────────────────────────────────────────────────
  setPlatform(v: CICDPlatform): void { this._platform.set(v); }
  setGithubOwner(v: string): void { this._githubOwner.set(v); }
  setGithubRepo(v: string): void { this._githubRepo.set(v); }
  setTriggers(v: GitHubConfig['triggers']): void { this._triggers.set(v); }
  setTrigger(key: keyof GitHubConfig['triggers'], value: boolean): void {
    this._triggers.update(t => ({ ...t, [key]: value }));
  }
  setCronExpression(v: string): void { this._cronExpression.set(v); }
  setGithubSwaSecretName(key: string, value: string): void {
    this._githubSwaSecretNames.update(s => ({ ...s, [key]: value }));
  }

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

  setQualityGatesEnabled(v: boolean): void {
    this._qualityGates.update(q => ({ ...q, enabled: v }));
  }

  setQualityGate(gate: 'typescript' | 'lint' | 'tests' | 'format', updates: Partial<QualityGateScript>): void {
    this._qualityGates.update(q => ({
      ...q,
      [gate]: { ...q[gate], ...updates },
    }));
  }

  // ── Step 4 Mutations ──────────────────────────────────────────────────────
  setDeployTarget(target: DeployTarget): void {
    this._deployTarget.set(target);
    // Modern hosting targets and cPanel/FTP are GitHub Actions only — auto-switch platform.
    const ghaOnlyTargets: DeployTarget[] = [
      'ftp-cpanel', 'vercel', 'netlify', 'firebase', 'github-pages', 'cloudflare-pages',
    ];
    if (ghaOnlyTargets.includes(target)) {
      this._platform.set('github-actions');
    }
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

  setFtpRemotePath(v: string): void {
    this._ftpRemotePath.set(v);
  }

  setProtectedPaths(v: string[]): void {
    this._protectedPaths.set(v);
  }

  setModernHosting(updates: Partial<ModernHostingConfig>): void {
    this._modernHosting.update(h => ({ ...h, ...updates }));
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
    this._isMultiMarket.set(false);
    this._isMultiLanguageBuild.set(false);
    this._hasQualityChecks.set(false);
    this._currentStep.set(1);
    this._projectName.set('');
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
    this._platform.set('azure-devops');
    this._githubOwner.set('');
    this._githubRepo.set('');
    this._triggers.set({ push: true, pullRequest: true, manual: true, schedule: false });
    this._cronExpression.set('0 2 * * 1');
    this._githubSwaSecretNames.set({});
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
      filePattern: 'src/environments/environment.*.ts',
      tokenFormat: '#{TOKEN}#',
      tokenMappings: [],
      environmentFilePath: '',
      secretVariableNames: '',
    });
    this._qualityGates.set({
      enabled: false,
      typescript: { enabled: false, command: '' },
      lint: { enabled: false, command: '' },
      tests: { enabled: false, command: '' },
      format: { enabled: false, command: '' },
    });
    this._deployTarget.set(null);
    this._storageAccounts.set({});
    this._swaTokens.set({});
    this._appServiceNames.set({});
    this._triggerPipelineAfterDeploy.set(false);
    this._triggerPipelineId.set('');
    this._ftpRemotePath.set('/public_html/');
    this._protectedPaths.set([]);
    this._modernHosting.set({ ghPagesBranch: 'gh-pages' });
    this._outputFormats.set(['yaml', 'classic-json']);

    // Apply profile defaults if available.
    this.applyProfileDefaults();
  }

  /** Pre-fills wizard fields from the user's saved profile defaults. */
  applyProfileDefaults(): void {
    const p = this.profileService.profile();
    if (!p) return;

    if (p.ado_organization) this._adoOrganization.set(p.ado_organization);
    if (p.ado_project) this._adoProjectName.set(p.ado_project);
    if (p.default_platform) this._platform.set(p.default_platform as CICDPlatform);
    if (p.github_username) this._githubOwner.set(p.github_username);
  }
}
