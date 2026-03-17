import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  standalone: true,
  selector: 'pf-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent],
})
export class AppLayoutComponent {
  private readonly router = inject(Router);

  protected onLogout(): void {
    this.router.navigate(['/auth/login']);
  }
}
