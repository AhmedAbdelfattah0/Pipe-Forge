import { DeployTarget, OutputFormat } from '../../generator/models/generator.model';

export interface HistoryProject {
  id: string;
  mfeName: string;
  repositoryName: string;
  deployTarget: DeployTarget;
  markets: string[];
  environments: string[];
  languages: string[];
  outputFormats: OutputFormat[];
  generatedAt: Date;
  pipelineCount: number;
}
