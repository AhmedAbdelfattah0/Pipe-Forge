import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  computed,
} from '@angular/core';
import { SlicePipe } from '@angular/common';
import { LucideAngularModule, GitBranch } from 'lucide-angular';
import { AdminService } from '../services/admin.service';

@Component({
  standalone: true,
  selector: 'pf-admin-generations',
  templateUrl: './admin-generations.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, SlicePipe],
})
export class AdminGenerationsPage implements OnInit {
  protected readonly adminService = inject(AdminService);
  protected readonly gitBranchIcon = GitBranch;

  /** Max value across all platforms — used to size CSS bars. */
  protected readonly maxPlatformCount = computed(() => {
    const gen = this.adminService.generations();
    if (!gen) return 1;
    return Math.max(1, ...Object.values(gen.byPlatform));
  });

  /** Max value across all deploy targets. */
  protected readonly maxTargetCount = computed(() => {
    const gen = this.adminService.generations();
    if (!gen) return 1;
    return Math.max(1, ...Object.values(gen.byDeployTarget));
  });

  ngOnInit(): void {
    this.adminService.loadGenerations();
  }

  protected barWidth(value: number, max: number): string {
    if (max === 0) return '0%';
    return `${Math.round((value / max) * 100)}%`;
  }

  protected platformEntries(): [string, number][] {
    const gen = this.adminService.generations();
    if (!gen) return [];
    return Object.entries(gen.byPlatform).sort((a, b) => b[1] - a[1]);
  }

  protected targetEntries(): [string, number][] {
    const gen = this.adminService.generations();
    if (!gen) return [];
    return Object.entries(gen.byDeployTarget).sort((a, b) => b[1] - a[1]);
  }
}
