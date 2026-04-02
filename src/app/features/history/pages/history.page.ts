import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HistoryService } from '../services/history.service';
import { HistoryProject } from '../models/history.model';
import { DeployTarget } from '../../generator/models/generator.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FeatureGateComponent } from '../../../shared/components/feature-gate/feature-gate.component';
import { DiagnoseService } from '../../diagnose/services/diagnose.service';
import { DiagnosisPanelComponent } from '../../diagnose/components/diagnosis-panel/diagnosis-panel.component';
import { PlanGateService } from '../../billing/services/plan-gate.service';
import { GeneratorStateService } from '../../generator/services/generator-state.service';

@Component({
  standalone: true,
  selector: 'pf-history-page',
  templateUrl: './history.page.html',
  styleUrl: './history.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, BadgeComponent, ButtonComponent, RouterLink, DiagnosisPanelComponent, FeatureGateComponent],
})
export class HistoryPage implements OnInit {
  protected readonly history = inject(HistoryService);
  protected readonly diagnose = inject(DiagnoseService);
  protected readonly planGate = inject(PlanGateService);
  private readonly router = inject(Router);
  private readonly generatorState = inject(GeneratorStateService);

  protected readonly skeletonItems = [1, 2, 3, 4];

  /** Tracks which project card is showing the delete confirmation inline */
  protected readonly confirmingDeleteId = signal<string | null>(null);

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
      'ftp-cpanel': 'ftp-cpanel',
      'vercel': 'vercel',
      'netlify': 'netlify',
      'firebase': 'firebase',
      'github-pages': 'github-pages',
      'cloudflare-pages': 'cloudflare-pages',
    };
    return map[target];
  }

  protected deployBadgeText(target: DeployTarget): string {
    const map: Record<DeployTarget, string> = {
      'storage-account': 'Storage',
      'static-web-app': 'SWA',
      'app-service': 'App Service',
      'ftp-cpanel': 'cPanel / FTP',
      'vercel': 'Vercel',
      'netlify': 'Netlify',
      'firebase': 'Firebase',
      'github-pages': 'GitHub Pages',
      'cloudflare-pages': 'Cloudflare Pages',
    };
    return map[target];
  }

  protected envBadgeVariant(env: string): string {
    return env === 'QA' ? 'qa' : 'prod';
  }

  protected onRegenerate(project: HistoryProject): void {
    this.history.regenerate(project.id, project.projectName);
  }

  protected onDeleteRequest(project: HistoryProject): void {
    this.confirmingDeleteId.set(project.id);
  }

  protected confirmDelete(project: HistoryProject): void {
    this.confirmingDeleteId.set(null);
    this.history.deleteProject(project.id);
  }

  protected cancelDelete(): void {
    this.confirmingDeleteId.set(null);
  }

  protected goToGenerator(): void {
    this.router.navigate(['/generator']);
  }

  protected onDiagnose(project: HistoryProject): void {
    this.diagnose.openPanel(project.id);
  }

  /**
   * Loads the saved config snapshot into the generator wizard and navigates to Step 1.
   * The user can then modify any field and regenerate.
   */
  protected onEdit(project: HistoryProject): void {
    this.generatorState.loadFromConfig(project.configSnapshot);
    this.router.navigate(['/generator']);
  }
}
