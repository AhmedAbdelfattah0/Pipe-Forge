import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { HistoryService } from '../services/history.service';
import { HistoryProject } from '../models/history.model';
import { DeployTarget } from '../../generator/models/generator.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  standalone: true,
  selector: 'pf-history-page',
  templateUrl: './history.page.html',
  styleUrl: './history.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, BadgeComponent, ButtonComponent],
})
export class HistoryPage {
  protected readonly history = inject(HistoryService);
  private readonly router = inject(Router);

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.history.setSearchQuery(value);
  }

  protected deployBadgeVariant(target: DeployTarget): string {
    const map: Record<DeployTarget, string> = {
      'storage-account': 'storage',
      'static-web-app': 'swa',
      'app-service': 'app-service',
    };
    return map[target];
  }

  protected deployBadgeText(target: DeployTarget): string {
    const map: Record<DeployTarget, string> = {
      'storage-account': 'Storage',
      'static-web-app': 'SWA',
      'app-service': 'App Service',
    };
    return map[target];
  }

  protected envBadgeVariant(env: string): string {
    return env === 'QA' ? 'qa' : 'prod';
  }

  protected onRegenerate(): void {
    this.router.navigate(['/generator']);
  }

  protected onDownload(project: HistoryProject): void {
    const content = [
      'PipeForge — Re-download',
      `MFE: ${project.mfeName}`,
      `Pipelines: ${project.pipelineCount}`,
      '',
      'Mock re-download. Real implementation coming soon.',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.mfeName}-pipelines-mock.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  protected goToGenerator(): void {
    this.router.navigate(['/generator']);
  }
}
