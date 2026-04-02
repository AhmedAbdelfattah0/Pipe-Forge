import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LucideAngularModule, Menu, X, Zap } from 'lucide-angular';

import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FeedbackWidgetComponent } from '../../../shared/components/feedback-widget/feedback-widget.component';
import { ProfileService } from '../../../features/profile/services/profile.service';

@Component({
  standalone: true,
  selector: 'pf-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, LucideAngularModule, FeedbackWidgetComponent],
})
export class AppLayoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly profileService = inject(ProfileService);

  protected readonly menuIcon = Menu;
  protected readonly xIcon = X;
  protected readonly zapIcon = Zap;

  protected readonly sidebarOpen = signal(false);

  ngOnInit(): void {
    this.profileService.loadProfile();
  }

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
