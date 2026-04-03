/**
 * mobile-generator.model.ts
 * Model layer — data shapes only.
 */

export type MobileCICDPlatform = 'azure-devops' | 'github-actions';
export type MobileFramework = 'react-native' | 'flutter' | 'ios-native' | 'android-native';
export type MobileTargetPlatform = 'android' | 'ios' | 'both';
export type MobileBuildType = 'debug' | 'release';
export type BuildNumberStrategy = 'BuildId' | 'Manual' | 'Semver';
export type MobileDistribution = 'app-center' | 'testflight' | 'play-store' | 'none';

export interface MobileProjectInfo {
  projectName: string;
  repositoryName: string;
  ciPlatform: MobileCICDPlatform;
}

export interface MobileFrameworkConfig {
  framework: MobileFramework;
  // React Native
  nodeVersion: string;
  reactNativeVersion: string;
  // Flutter
  flutterVersion: string;
  dartVersion: string;
  // iOS
  xcodeVersion: string;
  swiftVersion: string;
  // Android
  gradleVersion: string;
  androidSdkVersion: string;
}

export interface MobilePlatformConfig {
  targetPlatform: MobileTargetPlatform;
  // Android signing
  keystoreFile: string;
  keystorePassword: string;
  keyAlias: string;
  keyPassword: string;
  // iOS signing
  provisioningProfile: string;
  certificate: string;
}

export interface MobileBuildConfig {
  buildType: MobileBuildType;
  buildNumberStrategy: BuildNumberStrategy;
}

export interface MobileDistributionConfig {
  distribution: MobileDistribution;
  // App Center
  appCenterAndroidApp: string;
  appCenterIosApp: string;
  appCenterDistributionGroup: string;
  // TestFlight
  appleId: string;
  appSpecificPassword: string;
  // Play Store
  serviceAccountJson: string;
}

export interface MobileGeneratorConfig {
  projectInfo: MobileProjectInfo;
  frameworkConfig: MobileFrameworkConfig;
  platformConfig: MobilePlatformConfig;
  buildConfig: MobileBuildConfig;
  distributionConfig: MobileDistributionConfig;
}
