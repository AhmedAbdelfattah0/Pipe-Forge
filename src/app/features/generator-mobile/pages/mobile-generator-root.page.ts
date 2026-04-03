import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminService } from '../../admin/services/admin.service';
import { GeneratorMobilePage } from './generator-mobile.page';
import { MobileComingSoonPage } from './mobile-coming-soon.page';

@Component({
  standalone: true,
  selector: 'pf-mobile-generator-root-page',
  template: `
    @if (adminService.isAdmin()) {
      <pf-generator-mobile-page />
    } @else {
      <pf-mobile-coming-soon-page />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GeneratorMobilePage, MobileComingSoonPage],
})
export class MobileGeneratorRootPage {
  protected readonly adminService = inject(AdminService);
}
