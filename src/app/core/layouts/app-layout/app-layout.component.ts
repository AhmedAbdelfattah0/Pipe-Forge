import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LucideAngularModule, Menu, X } from 'lucide-angular';

import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FeedbackWidgetComponent } from '../../../shared/components/feedback-widget/feedback-widget.component';
import { ProfileService } from '../../../features/profile/services/profile.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { PlanGateService } from '../../../features/billing/services/plan-gate.service';

@Component({
  standalone: true,
  selector: 'pf-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, SidebarComponent, LucideAngularModule, FeedbackWidgetComponent],
})
export class AppLayoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private readonly planGate = inject(PlanGateService);

  protected readonly menuIcon = Menu;
  protected readonly xIcon = X;

  protected readonly sidebarOpen = signal(false);

  ngOnInit(): void {
    this.profileService.loadProfile();
    this.planGate.loadGateData();
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected async onLogout(): Promise<void> {
    this.closeSidebar();
    await this.authService.logout();
    await this.router.navigate(['/']);
  }
}
