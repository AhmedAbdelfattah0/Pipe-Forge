import { DeployTarget, OutputFormat } from '../../generator/models/generator.model';

/** Shape returned by the API (snake_case DB columns) */
export interface HistoryProjectApi {
  id: string;
  user_id: string;
  mfe_name: string;
  repository_name: string;
  deploy_target: DeployTarget;
  markets: string[];
  environments: string[];
  languages: string[];
  output_formats: OutputFormat[];
  pipeline_count: number;
  config_snapshot: Record<string, unknown>;
  generated_at: string;
  created_at: string;
}

/** Frontend-friendly camelCase model */
export interface HistoryProject {
  id: string;
  projectName: string;
  repositoryName: string;
  deployTarget: DeployTarget;
  markets: string[];
  environments: string[];
  languages: string[];
  outputFormats: OutputFormat[];
  generatedAt: Date;
  pipelineCount: number;
}

/** Map API response to frontend model */
export function mapApiToHistoryProject(api: HistoryProjectApi): HistoryProject {
  return {
    id: api.id,
    projectName: api.mfe_name,
    repositoryName: api.repository_name,
    deployTarget: api.deploy_target,
    markets: api.markets,
    environments: api.environments,
    languages: api.languages,
    outputFormats: api.output_formats,
    generatedAt: new Date(api.generated_at),
    pipelineCount: api.pipeline_count,
  };
}
