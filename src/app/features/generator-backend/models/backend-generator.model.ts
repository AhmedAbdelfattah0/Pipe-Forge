/**
 * backend-generator.model.ts
 * Model layer — data shapes only, no logic.
 */

export type BackendCICDPlatform = 'azure-devops' | 'github-actions';

export type BackendLanguage =
  | 'nodejs'
  | 'java'
  | 'python'
  | 'dotnet'
  | 'go'
  | 'php'
  | 'ruby';

export type JavaBuildTool = 'maven' | 'gradle';

export type BackendDeployTargetType = 'app-service' | 'docker-acr' | 'kubernetes';

export type BackendEnvironmentScope = 'qa' | 'prod' | 'both';

export interface BackendProjectInfo {
  projectName: string;
  repositoryName: string;
  ciPlatform: BackendCICDPlatform;
  adoOrg: string;
  adoProject: string;
  serviceConnectionId: string;
}

export interface BackendLanguageConfig {
  language: BackendLanguage;
  nodeVersion: string;         // Node.js
  javaVersion: string;         // Java
  javaBuildTool: JavaBuildTool; // Java
  pythonVersion: string;       // Python
  dotnetVersion: string;       // .NET
  goVersion: string;           // Go
  phpVersion: string;          // PHP
  rubyVersion: string;         // Ruby
}

export interface BackendBuildConfig {
  installCommand: string;
  runTests: boolean;
  testCommand: string;
  buildCommand: string;
  hasBuildStep: boolean;
}

export interface AppServiceDeployConfig {
  appServiceName: string;
  resourceGroup: string;
  slot: 'production' | 'staging';
}

export interface DockerAcrConfig {
  acrName: string;
  imageName: string;
  tagStrategy: 'BuildId' | 'latest' | 'semver';
}

export interface KubernetesConfig {
  clusterName: string;
  namespace: string;
  manifestPath: string;
}

export interface BackendDeployTarget {
  type: BackendDeployTargetType;
  appService: AppServiceDeployConfig;
  docker: DockerAcrConfig;
  kubernetes: KubernetesConfig;
}

export interface BackendEnvironment {
  scope: BackendEnvironmentScope;
  qaBranch: string;
  qaAppServiceName: string;
  prodBranch: string;
  prodAppServiceName: string;
}

/** Full backend generator form state — aggregates all 6 steps. */
export interface BackendGeneratorConfig {
  projectInfo: BackendProjectInfo;
  languageConfig: BackendLanguageConfig;
  buildConfig: BackendBuildConfig;
  deployTarget: BackendDeployTarget;
  environments: BackendEnvironment;
}

/** Verified ADO task GUIDs for backend pipelines. */
export const BACKEND_ADO_GUIDS = {
  NodeTool: '31c75bbb-bcdf-4706-8d7c-4da6a1959bc2',
  Npm: 'fe47e961-9fa8-4106-8639-368c022d43ad',
  CopyFiles: '5bfb729a-a7c8-4a78-a7c3-8d717bb7c13c',
  PublishBuildArtifacts: '2ff763a7-ce83-4e1f-bc89-0ae63477cebe',
  JavaToolInstaller: 'c0e0b74f-0931-47c7-ac27-7c5a19456a36',
  Maven: 'ac4ee482-65da-4485-a532-7b085873e532',
  Docker: 'e28912f1-0114-4464-802a-a3a35437fd16',
} as const;
