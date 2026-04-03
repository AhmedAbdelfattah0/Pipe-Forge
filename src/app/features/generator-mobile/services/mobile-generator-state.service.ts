import { Injectable, computed, signal } from '@angular/core';
import type {
  MobileProjectInfo,
  MobileFrameworkConfig,
  MobilePlatformConfig,
  MobileBuildConfig,
  MobileDistributionConfig,
  MobileFramework,
} from '../models/mobile-generator.model';

export const MOBILE_TOTAL_STEPS = 6;

@Injectable({ providedIn: 'root' })
export class MobileGeneratorStateService {

  private readonly _currentStep = signal<number>(1);
  readonly currentStep = this._currentStep.asReadonly();

  private readonly _projectInfo = signal<MobileProjectInfo>({
    projectName: '',
    repositoryName: '',
    ciPlatform: 'azure-devops',
  });
  readonly projectInfo = this._projectInfo.asReadonly();

  private readonly _frameworkConfig = signal<MobileFrameworkConfig>({
    framework: 'react-native',
    nodeVersion: '20.x',
    reactNativeVersion: '0.74',
    flutterVersion: '3.19',
    dartVersion: '3.3',
    xcodeVersion: '15',
    swiftVersion: '5.9',
    gradleVersion: '8.0',
    androidSdkVersion: '34',
  });
  readonly frameworkConfig = this._frameworkConfig.asReadonly();

  private readonly _platformConfig = signal<MobilePlatformConfig>({
    targetPlatform: 'both',
    keystoreFile: '$(KEYSTORE_FILE)',
    keystorePassword: '$(KEYSTORE_PASSWORD)',
    keyAlias: '$(KEY_ALIAS)',
    keyPassword: '$(KEY_PASSWORD)',
    provisioningProfile: '$(PROVISIONING_PROFILE)',
    certificate: '$(CERTIFICATE)',
  });
  readonly platformConfig = this._platformConfig.asReadonly();

  private readonly _buildConfig = signal<MobileBuildConfig>({
    buildType: 'release',
    buildNumberStrategy: 'BuildId',
  });
  readonly buildConfig = this._buildConfig.asReadonly();

  private readonly _distributionConfig = signal<MobileDistributionConfig>({
    distribution: 'app-center',
    appCenterAndroidApp: '',
    appCenterIosApp: '',
    appCenterDistributionGroup: 'Public',
    appleId: '$(APPLE_ID)',
    appSpecificPassword: '$(APP_SPECIFIC_PASSWORD)',
    serviceAccountJson: '$(SERVICE_ACCOUNT_JSON)',
  });
  readonly distributionConfig = this._distributionConfig.asReadonly();

  readonly isFirstStep = computed(() => this._currentStep() === 1);
  readonly isLastStep  = computed(() => this._currentStep() === MOBILE_TOTAL_STEPS);

  updateProjectInfo(patch: Partial<MobileProjectInfo>): void {
    this._projectInfo.update(v => ({ ...v, ...patch }));
  }

  updateFrameworkConfig(patch: Partial<MobileFrameworkConfig>): void {
    this._frameworkConfig.update(v => ({ ...v, ...patch }));
  }

  updatePlatformConfig(patch: Partial<MobilePlatformConfig>): void {
    this._platformConfig.update(v => ({ ...v, ...patch }));
  }

  updateBuildConfig(patch: Partial<MobileBuildConfig>): void {
    this._buildConfig.update(v => ({ ...v, ...patch }));
  }

  updateDistributionConfig(patch: Partial<MobileDistributionConfig>): void {
    this._distributionConfig.update(v => ({ ...v, ...patch }));
  }

  nextStep(): void {
    this._currentStep.update(s => Math.min(s + 1, MOBILE_TOTAL_STEPS));
  }

  prevStep(): void {
    this._currentStep.update(s => Math.max(s - 1, 1));
  }

  goToStep(n: number): void {
    if (n >= 1 && n <= MOBILE_TOTAL_STEPS) {
      this._currentStep.set(n);
    }
  }
}
