import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { SlicePipe } from '@angular/common';
import { LucideAngularModule, ThumbsUp, ThumbsDown, Star } from 'lucide-angular';
import { AdminService } from '../services/admin.service';

type FeedbackTab = 'pending' | 'approved' | 'rejected';

@Component({
  standalone: true,
  selector: 'pf-admin-feedback',
  templateUrl: './admin-feedback.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, SlicePipe],
})
export class AdminFeedbackPage implements OnInit {
  protected readonly adminService = inject(AdminService);

  protected readonly thumbsUpIcon = ThumbsUp;
  protected readonly thumbsDownIcon = ThumbsDown;
  protected readonly starIcon = Star;

  protected readonly activeTab = signal<FeedbackTab>('pending');

  protected readonly tabs: { id: FeedbackTab; label: string }[] = [
    { id: 'pending',  label: 'Pending'  },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ];

  ngOnInit(): void {
    this.adminService.loadFeedback('pending');
  }

  protected selectTab(tab: FeedbackTab): void {
    this.activeTab.set(tab);
    this.adminService.loadFeedback(tab);
  }

  protected async approve(id: string): Promise<void> {
    await this.adminService.updateFeedback(id, 'approve');
    this.adminService.loadFeedback(this.activeTab());
  }

  protected async reject(id: string): Promise<void> {
    await this.adminService.updateFeedback(id, 'reject');
    this.adminService.loadFeedback(this.activeTab());
  }

  protected range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }
}
