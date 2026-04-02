import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GeneratorStateService } from '../../services/generator-state.service';
import { PipelineGeneratorService } from '../../services/pipeline-generator.service';
import { OutputFormat } from '../../models/generator.model';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

interface SummaryRow {
  label: string;
  value: string;
}

@Component({
  standalone: true,
  selector: 'pf-step-review',
  templateUrl: './step-review.component.html',
  styleUrl: './step-review.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, ButtonComponent, CardComponent, SpinnerComponent],
})
export class StepReviewComponent {
  protected readonly state = inject(GeneratorStateService);
  protected readonly generator = inject(PipelineGeneratorService);

  protected summaryRows(): SummaryRow[] {
    const isGHA = this.state.platform() === 'github-actions';
    const rows: SummaryRow[] = [
      { label: 'Platform', value: 'platform' },
      { label: 'Project Name', value: 'projectName' },
      { label: 'Repository', value: 'repositoryName' },
      { label: 'Node Version', value: 'nodeVersion' },
      { label: 'Dist Folder', value: 'distFolder' },
    ];
    if (isGHA) {
      rows.push(
        { label: 'GitHub Owner', value: 'githubOwner' },
        { label: 'GitHub Repo', value: 'githubRepo' },
      );
    } else {
      rows.push(
        { label: 'ADO Organization', value: 'adoOrganization' },
        { label: 'ADO Project', value: 'adoProjectName' },
      );
    }
    return rows;
  }

  protected summaryValue(key: string): string {
    const map: Record<string, () => string> = {
      platform: () => this.state.platform() === 'github-actions' ? 'GitHub Actions' : 'Azure DevOps',
      projectName: () => this.state.projectName(),
      repositoryName: () => this.state.repositoryName(),
      nodeVersion: () => this.state.nodeVersion(),
      distFolder: () => this.state.distFolder(),
      adoOrganization: () => this.state.adoOrganization(),
      adoProjectName: () => this.state.adoProjectName(),
      githubOwner: () => this.state.githubOwner(),
      githubRepo: () => this.state.githubRepo(),
    };
    return map[key]?.() || '';
  }

  protected toggleFormat(format: OutputFormat): void {
    // Prevent deselecting the last format
    if (
      this.state.outputFormats().includes(format) &&
      this.state.outputFormats().length === 1
    ) {
      return;
    }
    this.state.toggleOutputFormat(format);
  }

  protected buildFiles(): { name: string; type: string }[] {
    return this.state
      .generatedFileList()
      .filter(f => f.type === 'build-yaml' || f.type === 'build-json');
  }

  protected releaseFiles(): { name: string; type: string }[] {
    return this.state
      .generatedFileList()
      .filter(f => f.type === 'release-json');
  }

  protected workflowFiles(): { name: string; type: string }[] {
    return this.state
      .generatedFileList()
      .filter(f => f.type === 'gha-workflow');
  }

  protected onGenerate(): void {
    this.generator.generate();
  }
}
