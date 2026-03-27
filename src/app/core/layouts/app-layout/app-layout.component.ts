import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LucideAngularModule, Menu, X, Zap } from 'lucide-angular';

import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  standalone: true,
  selector: 'pf-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, LucideAngularModule],
})
export class AppLayoutComponent {
  private readonly router = inject(Router);

  protected readonly menuIcon = Menu;
  protected readonly xIcon = X;
  protected readonly zapIcon = Zap;

  protected readonly sidebarOpen = signal(false);

  protected toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected onLogout(): void {
    this.closeSidebar();
    this.router.navigate(['/auth/login']);
  }
}
