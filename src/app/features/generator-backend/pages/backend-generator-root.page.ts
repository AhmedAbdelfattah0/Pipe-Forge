/**
 * backend-generator-root.page.ts
 * Route shell: shows the full wizard for admins, Coming Soon for everyone else.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminService } from '../../admin/services/admin.service';
import { GeneratorBackendPage } from './generator-backend.page';
import { BackendComingSoonPage } from './backend-coming-soon.page';

@Component({
  standalone: true,
  selector: 'pf-backend-generator-root-page',
  template: `
    @if (adminService.isAdmin()) {
      <pf-generator-backend-page />
    } @else {
      <pf-backend-coming-soon-page />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GeneratorBackendPage, BackendComingSoonPage],
})
export class BackendGeneratorRootPage {
  protected readonly adminService = inject(AdminService);
}
