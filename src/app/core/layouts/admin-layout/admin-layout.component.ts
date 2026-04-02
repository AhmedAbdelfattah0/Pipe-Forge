import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  Users,
  Tag,
  MessageSquare,
  BarChart2,
  Settings,
  HandCoins,
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
  AlertCircle,
} from 'lucide-angular';
import { AdminService } from '../../../features/admin/services/admin.service';
import { ErrorLogService } from '../../../features/admin/services/error-log.service';

interface AdminNavItem {
  label: string;
  route: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  showBadge?: boolean;
}

@Component({
  standalone: true,
  selector: 'pf-admin-layout',
  templateUrl: './admin-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
})
export class AdminLayoutComponent implements OnInit {
  protected readonly adminService = inject(AdminService);
  protected readonly errorLogService = inject(ErrorLogService);

  protected readonly layoutDashboardIcon = LayoutDashboard;
  protected readonly usersIcon = Users;
  protected readonly tagIcon = Tag;
  protected readonly messageSquareIcon = MessageSquare;
  protected readonly barChartIcon = BarChart2;
  protected readonly settingsIcon = Settings;
  protected readonly handCoinsIcon = HandCoins;
  protected readonly arrowLeftIcon = ArrowLeft;
  protected readonly menuIcon = Menu;
  protected readonly xIcon = X;
  protected readonly shieldCheckIcon = ShieldCheck;
  protected readonly alertCircleIcon = AlertCircle;

  protected readonly sidebarOpen = signal(false);

  protected readonly navItems: AdminNavItem[] = [
    { label: 'Overview',     route: '/admin',             icon: LayoutDashboard },
    { label: 'Users',        route: '/admin/users',       icon: Users },
    { label: 'Pricing',      route: '/admin/pricing',     icon: Tag },
    { label: 'Compensation', route: '/admin/compensation',icon: HandCoins },
    { label: 'Coupons',      route: '/admin/coupons',     icon: Tag },
    { label: 'Feedback',     route: '/admin/feedback',    icon: MessageSquare, showBadge: true },
    { label: 'Errors',       route: '/admin/errors',      icon: AlertCircle, showBadge: true },
    { label: 'Generations',  route: '/admin/generations', icon: BarChart2 },
    { label: 'System',       route: '/admin/system',      icon: Settings },
  ];

  ngOnInit(): void {
    this.adminService.loadMetrics();
    this.errorLogService.loadStats();
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected get pendingFeedback(): number {
    return this.adminService.metrics()?.pendingFeedback ?? 0;
  }

  protected get unresolvedErrors(): number {
    return this.errorLogService.stats()?.unresolved ?? 0;
  }
}
