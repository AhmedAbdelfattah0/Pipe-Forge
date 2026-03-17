export type DeployTarget = 'storage-account' | 'static-web-app' | 'app-service';
export type OutputFormat = 'yaml' | 'classic-json';
export type EnvironmentType = 'QA' | 'PROD';

export interface Market {
  name: string;     // e.g. "KSA"
  code: string;     // e.g. "sa"
  enabled: boolean;
}

export interface Language {
  name: string;     // e.g. "EN"
  code: string;     // e.g. "en"
}

export interface BuildScriptMatrix {
  // Multi-language key: "{marketCode}-{env}-{langCode}" e.g. "sa-QA-en": "ksaqa"
  // Single-language key: "{marketCode}-{env}"           e.g. "sa-QA":    "ksaqa"
  [key: string]: string;
}

export interface StorageAccountConfig {
  // key format: "{marketCode}-{env}"
  // e.g. "sa-QA": "jedazup2qaswa"
  [key: string]: string;
}

export interface StaticWebAppConfig {
  // key format: "{marketCode}-{env}"
  [key: string]: string; // SWA deployment token
}

export interface AppServiceConfig {
  // key format: "{marketCode}-{env}"
  [key: string]: string; // app service name
}

export interface TokenReplacement {
  enabled: boolean;
  environmentFilePath: string;
  secretVariableNames: string; // comma separated
}

export interface GeneratorConfig {
  // Step 1 — Project Info
  mfeName: string;
  repositoryName: string;
  nodeVersion: '18.x' | '20.x' | '22.x';
  distFolder: string;
  installFlags: string;
  hasBrowserSubfolder: boolean;
  qaBranch: string;
  productionBranch: string;
  adoOrganization: string;
  adoProjectName: string;
  serviceConnectionId: string;

  // Step 2 — Markets & Environments
  markets: Market[];
  environments: EnvironmentType[];

  // Step 3 — Languages & Scripts
  isMultiLanguage: boolean;
  languages: Language[];
  buildScripts: BuildScriptMatrix;
  tokenReplacement: TokenReplacement;

  // Step 4 — Deploy Target
  deployTarget: DeployTarget | null;
  storageAccounts: StorageAccountConfig;
  swaTokens: StaticWebAppConfig;
  appServiceNames: AppServiceConfig;
  triggerPipelineAfterDeploy: boolean;
  triggerPipelineId: string;

  // Step 5 — Output
  outputFormats: OutputFormat[];
}

export interface GeneratedFile {
  name: string;
  path: string;
  type: 'build-yaml' | 'build-json' | 'release-json' | 'readme';
}

export interface PipelineCombination {
  market: Market;
  environment: EnvironmentType;
  language?: Language;      // undefined in single-language mode
  pipelineName: string;    // e.g. QA-SAUDI-SHOPPINGBAG-EN (multi) / QA-SAUDI-SHOPPINGBAG (single)
  artifactAlias: string;   // e.g. _QA-SAUDI-SHOPPINGBAG-EN
  deploymentPath: string;  // e.g. sa/en/shoppingbag (multi) / sa/shoppingbag (single)
  buildScript: string;     // e.g. ksaqa
  branchName: string;      // e.g. qa-feature-shoppingbag
}
