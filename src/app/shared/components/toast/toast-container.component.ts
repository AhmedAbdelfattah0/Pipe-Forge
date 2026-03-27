import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { ToastService } from './toast.service';
import { Toast } from './toast.model';

@Component({
  standalone: true,
  selector: 'pf-toast-container',
  templateUrl: './toast-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);

  protected iconPath(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-2.99';
      case 'error':
        return 'M10 14l2-2m0 0 2-2m-2 2-2-2m2 2 2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z';
      case 'warning':
        return 'M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z';
      case 'info':
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z';
    }
  }

  protected containerClass(type: Toast['type']): string {
    const base =
      'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg min-w-72 max-w-sm pointer-events-auto';
    switch (type) {
      case 'success':
        return `${base} bg-green-50 border-green-200`;
      case 'error':
        return `${base} bg-red-50 border-red-200`;
      case 'warning':
        return `${base} bg-amber-50 border-amber-200`;
      case 'info':
      default:
        return `${base} bg-blue-50 border-blue-200`;
    }
  }

  protected iconClass(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'shrink-0 text-success';
      case 'error':
        return 'shrink-0 text-red-600';
      case 'warning':
        return 'shrink-0 text-warning';
      case 'info':
      default:
        return 'shrink-0 text-blue-600';
    }
  }

  protected messageClass(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'text-sm font-medium text-success';
      case 'error':
        return 'text-sm font-medium text-red-700';
      case 'warning':
        return 'text-sm font-medium text-warning';
      case 'info':
      default:
        return 'text-sm font-medium text-blue-700';
    }
  }

  protected dismissClass(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'ml-auto shrink-0 rounded p-0.5 transition-colors hover:bg-green-100 text-green-600';
      case 'error':
        return 'ml-auto shrink-0 rounded p-0.5 transition-colors hover:bg-red-100 text-red-500';
      case 'warning':
        return 'ml-auto shrink-0 rounded p-0.5 transition-colors hover:bg-amber-100 text-amber-600';
      case 'info':
      default:
        return 'ml-auto shrink-0 rounded p-0.5 transition-colors hover:bg-blue-100 text-blue-500';
    }
  }
}
