import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { SlicePipe } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Search, ChevronDown } from 'lucide-angular';
import { AdminService } from '../services/admin.service';
import type { AdminUserOverview } from '../models/admin.model';

@Component({
  standalone: true,
  selector: 'pf-admin-users',
  templateUrl: './admin-users.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, LucideAngularModule, SlicePipe],
})
export class AdminUsersPage implements OnInit {
  protected readonly adminService = inject(AdminService);

  protected readonly searchIcon = Search;
  protected readonly chevronDownIcon = ChevronDown;

  readonly searchControl = new FormControl('');
  readonly planFilterControl = new FormControl('');

  protected readonly currentPage = signal(1);
  protected readonly activeChangePlanUserId = signal<string | null>(null);
  protected readonly activeCompensateUserId = signal<string | null>(null);

  protected readonly compensateTypeControl = new FormControl('free_month');
  protected readonly compensateValueControl = new FormControl('30days');
  protected readonly compensateReasonControl = new FormControl('');

  protected readonly plans = ['free', 'pro', 'team', 'enterprise'];

  readonly searchValue = toSignal(
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );

  ngOnInit(): void {
    this.loadUsers();
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadUsers();
      });
    this.planFilterControl.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.loadUsers();
    });
  }

  private loadUsers(): void {
    this.adminService.loadUsers({
      page: this.currentPage(),
      limit: 20,
      search: this.searchControl.value ?? '',
      plan: this.planFilterControl.value ?? '',
    });
  }

  protected goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadUsers();
  }

  protected get totalPages(): number {
    return Math.ceil(this.adminService.userTotal() / 20);
  }

  protected toggleChangePlan(userId: string): void {
    this.activeChangePlanUserId.update(id => (id === userId ? null : userId));
  }

  protected toggleCompensate(userId: string): void {
    this.activeCompensateUserId.update(id => (id === userId ? null : userId));
  }

  protected async changePlan(user: AdminUserOverview, plan: string): Promise<void> {
    await this.adminService.updateUserPlan(user.userId, plan);
    this.activeChangePlanUserId.set(null);
    this.loadUsers();
  }

  protected async submitCompensation(user: AdminUserOverview): Promise<void> {
    await this.adminService.compensateUser(user.userId, {
      type: this.compensateTypeControl.value ?? 'free_month',
      value: this.compensateValueControl.value ?? '30days',
      reason: this.compensateReasonControl.value ?? '',
    });
    this.activeCompensateUserId.set(null);
    this.compensateReasonControl.reset('');
  }
}
