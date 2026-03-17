import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import { LucideAngularModule, Zap, WandSparkles, History, LogOut } from 'lucide-angular';

interface NavItem {
  label: string;
  route: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

@Component({
  standalone: true,
  selector: 'pf-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule],
})
export class SidebarComponent {
  @Output() logoutClicked = new EventEmitter<void>();

  private readonly router = inject(Router);

  // Icon data for the template
  protected readonly zapIcon = Zap;
  protected readonly logOutIcon = LogOut;

  protected readonly navItems: NavItem[] = [
    { label: 'Generator', route: '/generator', icon: WandSparkles },
    { label: 'History', route: '/history', icon: History },
  ];

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
