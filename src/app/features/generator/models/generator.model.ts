export type DeployTarget =
  | 'storage-account'
  | 'static-web-app'
  | 'app-service'
  | 'ftp-cpanel'
  | 'vercel'
  | 'netlify'
  | 'firebase'
  | 'github-pages'
  | 'cloudflare-pages';
export type OutputFormat = 'yaml' | 'classic-json';
export type EnvironmentType = 'QA' | 'PROD';
export type CICDPlatform = 'azure-devops' | 'github-actions';

export interface GitHubConfig {
  owner: string;
  repositoryName: string;
  triggers: {
    push: boolean;
    pullRequest: boolean;
    manual: boolean;
    schedule: boolean;
  };
  cronExpression: string;
}

export interface GitHubSwaSecretNames {
  [key: string]: string;
}

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
  filePattern: string;            // e.g. "src/environments/environment.*.ts"
  tokenFormat: '#{TOKEN}#' | '__TOKEN__' | '${TOKEN}'; // token format style
  tokenMappings: TokenMapping[];  // per-token name pairs
  /** @deprecated Use filePattern + tokenMappings instead. Kept for backward compat. */
  environmentFilePath: string;
  /** @deprecated Use tokenMappings instead. */
  secretVariableNames: string; // comma separated
}

export interface TokenMapping {
  tokenName: string;         // name in file e.g. API_URL
  variableName: string;      // pipeline variable name e.g. API_URL
}

/** Modern hosting config for platforms outside Azure. */
export interface ModernHostingConfig {
  // Vercel
  vercelToken?: string;
  vercelOrgId?: string;
  vercelProjectId?: string;
  // Netlify
  netlifySiteId?: string;
  // Firebase
  firebaseProjectId?: string;
  // GitHub Pages
  ghPagesBranch?: string;  // default: 'gh-pages'
  // Cloudflare Pages
  cloudflarePagesProject?: string;
}

export interface QualityGateScript {
  enabled: boolean;
  command: string;
}

export interface QualityGates {
  enabled: boolean;
  typescript: QualityGateScript;
  lint: QualityGateScript;
  tests: QualityGateScript;
  format: QualityGateScript;
}

export interface GeneratorConfig {
  // Platform Selection
  platform: CICDPlatform;
  githubConfig: GitHubConfig;
  githubSwaSecretNames: GitHubSwaSecretNames;

  // Step 1 — Project Info
  projectName: string;
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

  // Step 1 — Adaptive wizard toggles (control step skipping)
  isMultiMarket: boolean;       // false → Step 2 is skipped
  isMultiLanguageBuild: boolean; // false → language matrix in Step 3 is hidden
  hasQualityChecks: boolean;    // false → quality gates section in Step 3 is hidden

  // Step 2 — Markets & Environments
  markets: Market[];
  environments: EnvironmentType[];

  // Step 3 — Languages & Scripts
  isMultiLanguage: boolean;
  languages: Language[];
  buildScripts: BuildScriptMatrix;
  tokenReplacement: TokenReplacement;
  qualityGates: QualityGates;

  // Step 4 — Deploy Target
  deployTarget: DeployTarget | null;
  storageAccounts: StorageAccountConfig;
  swaTokens: StaticWebAppConfig;
  appServiceNames: AppServiceConfig;
  triggerPipelineAfterDeploy: boolean;
  triggerPipelineId: string;
  ftpRemotePath: string;
  protectedPaths: string[];
  protectedPathsContainer: string;
  modernHosting: ModernHostingConfig;

  // Step 5 — Output
  outputFormats: OutputFormat[];
}

export interface GeneratedFile {
  name: string;
  path: string;
  type: 'build-yaml' | 'build-json' | 'release-json' | 'readme' | 'gha-workflow' | 'secrets-guide';
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
