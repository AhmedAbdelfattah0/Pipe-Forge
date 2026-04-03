/**
 * backend-generator-state.service.ts
 * ViewModel — owns all wizard state via Angular Signals.
 */

import { Injectable, computed, signal } from '@angular/core';
import type {
  BackendProjectInfo,
  BackendLanguageConfig,
  BackendBuildConfig,
  BackendDeployTarget,
  BackendEnvironment,
  BackendLanguage,
} from '../models/backend-generator.model';

export const TOTAL_STEPS = 6;

/** Default install/test/build commands per language. */
const LANGUAGE_DEFAULTS: Record<
  BackendLanguage,
  { install: string; test: string; build: string; hasBuild: boolean }
> = {
  nodejs:  { install: 'npm ci', test: 'npm test', build: 'npm run build', hasBuild: true },
  java:    { install: 'mvn clean package -DskipTests', test: 'mvn test', build: '', hasBuild: false },
  python:  { install: 'pip install -r requirements.txt', test: 'pytest', build: '', hasBuild: false },
  dotnet:  { install: 'dotnet restore', test: 'dotnet test', build: 'dotnet build', hasBuild: true },
  go:      { install: 'go mod download', test: 'go test ./...', build: 'go build', hasBuild: true },
  php:     { install: 'composer install', test: 'php artisan test', build: '', hasBuild: false },
  ruby:    { install: 'bundle install', test: 'bundle exec rspec', build: '', hasBuild: false },
};

@Injectable({ providedIn: 'root' })
export class BackendGeneratorStateService {

  // ── Step cursor ─────────────────────────────────────────────────────────────
  private readonly _currentStep = signal<number>(1);
  readonly currentStep = this._currentStep.asReadonly();

  // ── Step 1 — Project Info ───────────────────────────────────────────────────
  private readonly _projectInfo = signal<BackendProjectInfo>({
    projectName: '',
    repositoryName: '',
    ciPlatform: 'azure-devops',
    adoOrg: '',
    adoProject: '',
    serviceConnectionId: '',
  });
  readonly projectInfo = this._projectInfo.asReadonly();

  // ── Step 2 — Language ───────────────────────────────────────────────────────
  private readonly _languageConfig = signal<BackendLanguageConfig>({
    language: 'nodejs',
    nodeVersion: '20.x',
    javaVersion: '17',
    javaBuildTool: 'maven',
    pythonVersion: '3.11',
    dotnetVersion: '8',
    goVersion: '1.22',
    phpVersion: '8.2',
    rubyVersion: '3.2',
  });
  readonly languageConfig = this._languageConfig.asReadonly();

  // ── Step 3 — Build Config ───────────────────────────────────────────────────
  private readonly _buildConfig = signal<BackendBuildConfig>({
    installCommand: 'npm ci',
    runTests: true,
    testCommand: 'npm test',
    buildCommand: 'npm run build',
    hasBuildStep: true,
  });
  readonly buildConfig = this._buildConfig.asReadonly();

  // ── Step 4 — Deploy Target ──────────────────────────────────────────────────
  private readonly _deployTarget = signal<BackendDeployTarget>({
    type: 'app-service',
    appService: { appServiceName: '', resourceGroup: '', slot: 'production' },
    docker: { acrName: '', imageName: '', tagStrategy: 'BuildId' },
    kubernetes: { clusterName: '', namespace: 'default', manifestPath: 'k8s/' },
  });
  readonly deployTarget = this._deployTarget.asReadonly();

  // ── Step 5 — Environments ───────────────────────────────────────────────────
  private readonly _environments = signal<BackendEnvironment>({
    scope: 'both',
    qaBranch: 'develop',
    qaAppServiceName: '',
    prodBranch: 'main',
    prodAppServiceName: '',
  });
  readonly environments = this._environments.asReadonly();

  // ── Computed ─────────────────────────────────────────────────────────────────
  readonly isFirstStep = computed(() => this._currentStep() === 1);
  readonly isLastStep  = computed(() => this._currentStep() === TOTAL_STEPS);
  readonly isAdoPlatform = computed(() => this._projectInfo().ciPlatform === 'azure-devops');

  /** True when the selected language has verified GUIDs for Classic JSON output. */
  readonly canGenerateClassicJson = computed(() => {
    const lang = this._languageConfig().language;
    return lang === 'nodejs' || lang === 'java';
  });

  // ── Mutations ─────────────────────────────────────────────────────────────────

  updateProjectInfo(patch: Partial<BackendProjectInfo>): void {
    this._projectInfo.update(v => ({ ...v, ...patch }));
  }

  updateLanguageConfig(patch: Partial<BackendLanguageConfig>): void {
    this._languageConfig.update(v => ({ ...v, ...patch }));
    // Auto-fill build config when language changes
    const lang = patch.language ?? this._languageConfig().language;
    if (patch.language) {
      const defaults = LANGUAGE_DEFAULTS[lang];
      this._buildConfig.update(v => ({
        ...v,
        installCommand: defaults.install,
        testCommand: defaults.test,
        buildCommand: defaults.build,
        hasBuildStep: defaults.hasBuild,
      }));
    }
  }

  updateBuildConfig(patch: Partial<BackendBuildConfig>): void {
    this._buildConfig.update(v => ({ ...v, ...patch }));
  }

  updateDeployTarget(patch: Partial<BackendDeployTarget>): void {
    this._deployTarget.update(v => ({ ...v, ...patch }));
  }

  updateEnvironments(patch: Partial<BackendEnvironment>): void {
    this._environments.update(v => ({ ...v, ...patch }));
  }

  // ── Navigation ────────────────────────────────────────────────────────────────

  nextStep(): void {
    this._currentStep.update(s => Math.min(s + 1, TOTAL_STEPS));
  }

  prevStep(): void {
    this._currentStep.update(s => Math.max(s - 1, 1));
  }

  goToStep(n: number): void {
    if (n >= 1 && n <= TOTAL_STEPS) {
      this._currentStep.set(n);
    }
  }

  reset(): void {
    this._currentStep.set(1);
    this._projectInfo.set({
      projectName: '',
      repositoryName: '',
      ciPlatform: 'azure-devops',
      adoOrg: '',
      adoProject: '',
      serviceConnectionId: '',
    });
    this._languageConfig.set({
      language: 'nodejs',
      nodeVersion: '20.x',
      javaVersion: '17',
      javaBuildTool: 'maven',
      pythonVersion: '3.11',
      dotnetVersion: '8',
      goVersion: '1.22',
      phpVersion: '8.2',
      rubyVersion: '3.2',
    });
    this._buildConfig.set({
      installCommand: 'npm ci',
      runTests: true,
      testCommand: 'npm test',
      buildCommand: 'npm run build',
      hasBuildStep: true,
    });
    this._deployTarget.set({
      type: 'app-service',
      appService: { appServiceName: '', resourceGroup: '', slot: 'production' },
      docker: { acrName: '', imageName: '', tagStrategy: 'BuildId' },
      kubernetes: { clusterName: '', namespace: 'default', manifestPath: 'k8s/' },
    });
    this._environments.set({
      scope: 'both',
      qaBranch: 'develop',
      qaAppServiceName: '',
      prodBranch: 'main',
      prodAppServiceName: '',
    });
  }
}
