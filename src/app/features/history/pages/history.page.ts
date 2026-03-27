import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
  imports: [DatePipe, BadgeComponent, ButtonComponent, RouterLink],
})
export class HistoryPage implements OnInit {
  protected readonly history = inject(HistoryService);
  private readonly router = inject(Router);

  protected readonly skeletonItems = [1, 2, 3, 4];

  ngOnInit(): void {
    this.history.getProjects();
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.history.setSearchQuery(value);
    this.history.getProjects(1, 20, value);
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

  protected onRegenerate(project: HistoryProject): void {
    this.history.regenerate(project.id, project.mfeName);
  }

  protected onDelete(project: HistoryProject): void {
    this.history.deleteProject(project.id);
  }

  protected goToGenerator(): void {
    this.router.navigate(['/generator']);
  }
}
