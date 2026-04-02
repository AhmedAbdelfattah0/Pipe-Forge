import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { SlicePipe } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LucideAngularModule, Search, CheckCircle } from 'lucide-angular';
import { AdminService } from '../services/admin.service';
import type { AdminUserOverview } from '../models/admin.model';

@Component({
  standalone: true,
  selector: 'pf-admin-compensation',
  templateUrl: './admin-compensation.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, LucideAngularModule, SlicePipe],
})
export class AdminCompensationPage implements OnInit {
  protected readonly adminService = inject(AdminService);

  protected readonly searchIcon = Search;
  protected readonly checkCircleIcon = CheckCircle;

  protected readonly selectedUser = signal<AdminUserOverview | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly submitted = signal(false);

  readonly userSearchControl = new FormControl('');

  readonly compensationForm = new FormGroup({
    type:   new FormControl<'free_month' | 'plan_upgrade'>('free_month', Validators.required),
    value:  new FormControl('30days', Validators.required),
    reason: new FormControl(''),
  });

  ngOnInit(): void {
    this.adminService.loadCompensations();

    this.userSearchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((search) => {
        if (search && search.length >= 2) {
          this.adminService.loadUsers({ search, limit: 5 });
        }
      });
  }

  protected selectUser(user: AdminUserOverview): void {
    this.selectedUser.set(user);
    this.userSearchControl.setValue(user.email);
    this.submitted.set(false);
  }

  protected async submitCompensation(): Promise<void> {
    if (this.compensationForm.invalid || !this.selectedUser()) return;

    this.isSubmitting.set(true);
    const { type, value, reason } = this.compensationForm.getRawValue();
    await this.adminService.compensateUser(this.selectedUser()!.userId, {
      type: type ?? 'free_month',
      value: value ?? '30days',
      reason: reason ?? '',
    });
    this.isSubmitting.set(false);
    this.submitted.set(true);
    this.compensationForm.reset({ type: 'free_month', value: '30days', reason: '' });
    this.selectedUser.set(null);
    this.userSearchControl.reset('');
    await this.adminService.loadCompensations();
  }
}
