import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { LucideAngularModule, RefreshCw, ExternalLink } from 'lucide-angular';
import { AdminService } from '../services/admin.service';
import { computed } from '@angular/core';

@Component({
  standalone: true,
  selector: 'pf-admin-system',
  templateUrl: './admin-system.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
})
export class AdminSystemPage implements OnInit {
  protected readonly adminService = inject(AdminService);

  protected readonly refreshIcon = RefreshCw;
  protected readonly externalLinkIcon = ExternalLink;

  ngOnInit(): void {
    this.adminService.loadHealth();
  }

  protected refresh(): void {
    this.adminService.loadHealth();
  }

  /** Formatted timestamp string for display (no pipe required). */
  protected readonly formattedTimestamp = computed(() => {
    const ts = this.adminService.healthStatus()?.timestamp;
    if (!ts) return '';
    return ts.slice(0, 19).replace('T', ' ');
  });
}
