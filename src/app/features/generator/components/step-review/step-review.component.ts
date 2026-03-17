import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GeneratorStateService } from '../../services/generator-state.service';
import { PipelineGeneratorService } from '../../services/pipeline-generator.service';
import { OutputFormat } from '../../models/generator.model';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';

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
  imports: [BadgeComponent, ButtonComponent, CardComponent],
})
export class StepReviewComponent {
  protected readonly state = inject(GeneratorStateService);
  protected readonly generator = inject(PipelineGeneratorService);

  protected readonly summaryRows: readonly SummaryRow[] = [
    { label: 'MFE Name', value: 'mfeName' },
    { label: 'Repository', value: 'repositoryName' },
    { label: 'Node Version', value: 'nodeVersion' },
    { label: 'Dist Folder', value: 'distFolder' },
    { label: 'ADO Organization', value: 'adoOrganization' },
    { label: 'ADO Project', value: 'adoProjectName' },
  ];

  protected summaryValue(key: string): string {
    const map: Record<string, () => string> = {
      mfeName: () => this.state.mfeName(),
      repositoryName: () => this.state.repositoryName(),
      nodeVersion: () => this.state.nodeVersion(),
      distFolder: () => this.state.distFolder(),
      adoOrganization: () => this.state.adoOrganization(),
      adoProjectName: () => this.state.adoProjectName(),
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

  protected onGenerate(): void {
    this.generator.generate();
  }
}
