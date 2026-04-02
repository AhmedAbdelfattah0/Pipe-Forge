import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import { LucideAngularModule, Zap, WandSparkles, History, LogOut, User, ShieldCheck, ShieldAlert } from 'lucide-angular';
import { ProfileService } from '../../../features/profile/services/profile.service';
import { AdminService } from '../../../features/admin/services/admin.service';

interface NavItem {
  label: string;
  route: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  adminOnly?: boolean;
}

@Component({
  standalone: true,
  selector: 'pf-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule],
})
export class SidebarComponent implements OnInit {
  @Output() logoutClicked = new EventEmitter<void>();
  @Output() linkClicked = new EventEmitter<void>();

  private readonly router = inject(Router);
  protected readonly profileService = inject(ProfileService);
  protected readonly adminService = inject(AdminService);

  // Icon data for the template
  protected readonly zapIcon = Zap;
  protected readonly logOutIcon = LogOut;
  protected readonly userIcon = User;
  protected readonly shieldCheckIcon = ShieldCheck;
  protected readonly shieldAlertIcon = ShieldAlert;

  protected readonly allNavItems: NavItem[] = [
    { label: 'Generator', route: '/generator', icon: WandSparkles },
    { label: 'History', route: '/history', icon: History },
    { label: 'Validator', route: '/validator', icon: ShieldAlert },
    { label: 'Profile', route: '/profile', icon: User },
    { label: 'Admin', route: '/admin', icon: ShieldCheck, adminOnly: true },
  ];

  ngOnInit(): void {
    this.adminService.checkAdminAccess();
  }

  protected get navItems(): NavItem[] {
    return this.allNavItems.filter(
      item => !item.adminOnly || this.adminService.isAdmin(),
    );
  }

  protected get pendingFeedback(): number {
    return this.adminService.metrics()?.pendingFeedback ?? 0;
  }

  // Signal tracking the current URL — drives active state without RouterLinkActive.
  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).url),
    ),
    { initialValue: this.router.url },
  );

  protected isActive(route: string): boolean {
    return this.currentUrl().startsWith(route);
  }

  // Tailwind class strings defined here so the v4 scanner picks them up
  // even when applied conditionally at runtime.
  protected readonly activeItemClass =
    'flex items-center gap-3 rounded-lg border-l-4 border-primary bg-primary/20 px-3 py-2.5 text-sm font-medium text-white transition-colors';
  protected readonly inactiveItemClass =
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white';
}
