import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { SlicePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { LucideAngularModule, Copy, Pause, Play } from 'lucide-angular';
import { AdminService } from '../services/admin.service';

@Component({
  standalone: true,
  selector: 'pf-admin-coupons',
  templateUrl: './admin-coupons.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, LucideAngularModule, SlicePipe],
})
export class AdminCouponsPage implements OnInit {
  protected readonly adminService = inject(AdminService);

  protected readonly copyIcon = Copy;
  protected readonly pauseIcon = Pause;
  protected readonly playIcon = Play;

  readonly couponForm = new FormGroup({
    code:          new FormControl('', [Validators.required, Validators.minLength(3)]),
    type:          new FormControl<'percent' | 'fixed'>('percent', Validators.required),
    value:         new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    appliesTo:     new FormControl('all'),
    billingCycle:  new FormControl('both'),
    maxUses:       new FormControl<number | null>(null),
    expiresAt:     new FormControl(''),
    description:   new FormControl(''),
  });

  ngOnInit(): void {
    this.adminService.loadCoupons();
  }

  protected async submitCoupon(): Promise<void> {
    if (this.couponForm.invalid) return;
    const raw = this.couponForm.getRawValue();
    await this.adminService.createCoupon({
      code: raw.code ?? '',
      type: raw.type ?? 'percent',
      value: raw.value,
      applies_to: raw.appliesTo ?? 'all',
      billing_cycle: raw.billingCycle ?? 'both',
      max_uses: raw.maxUses ?? null,
      expires_at: raw.expiresAt || null,
      description: raw.description || null,
    });
    // Form stays visible; coupon creation will fail with 501 (Stripe not integrated)
  }

  protected async toggleCoupon(id: string, isActive: boolean): Promise<void> {
    await this.adminService.toggleCoupon(id, isActive);
  }

  protected copyLink(code: string): void {
    const url = `${window.location.origin}/pricing?coupon=${code}`;
    navigator.clipboard.writeText(url);
  }
}
