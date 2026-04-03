import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Globe, Cpu, Smartphone, Lock, ArrowRight } from 'lucide-angular';
import { AdminService } from '../../admin/services/admin.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  standalone: true,
  selector: 'pf-generator-selection-page',
  templateUrl: './generator-selection.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, ButtonComponent],
})
export class GeneratorSelectionPage {
  protected readonly adminService = inject(AdminService);
  protected readonly router = inject(Router);

  protected readonly globeIcon = Globe;
  protected readonly cpuIcon = Cpu;
  protected readonly smartphoneIcon = Smartphone;
  protected readonly lockIcon = Lock;
  protected readonly arrowRightIcon = ArrowRight;

  protected goToFrontend(): void {
    this.router.navigate(['/generator/frontend']);
  }

  protected goToBackend(): void {
    this.router.navigate(['/generator/backend']);
  }

  protected goToMobile(): void {
    this.router.navigate(['/generator/mobile']);
  }
}
