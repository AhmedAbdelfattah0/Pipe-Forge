import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Users, Activity, GitBranch, MessageSquare, AlertCircle } from 'lucide-angular';
import { AdminService } from '../services/admin.service';
import { ErrorLogService } from '../services/error-log.service';

@Component({
  standalone: true,
  selector: 'pf-admin-overview',
  templateUrl: './admin-overview.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule],
})
export class AdminOverviewPage implements OnInit {
  protected readonly adminService = inject(AdminService);
  protected readonly errorLogService = inject(ErrorLogService);

  protected readonly usersIcon = Users;
  protected readonly activityIcon = Activity;
  protected readonly gitBranchIcon = GitBranch;
  protected readonly messageSquareIcon = MessageSquare;
  protected readonly alertCircleIcon = AlertCircle;

  ngOnInit(): void {
    this.adminService.loadMetrics();
    this.errorLogService.loadStats();
  }
}
