import { Injectable, signal } from '@angular/core';
import { Toast } from './toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);

  readonly toasts = this._toasts.asReadonly();

  show(
    message: string,
    type: Toast['type'] = 'info',
    duration = 5000,
  ): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const toast: Toast = { id, message, type, duration };

    this._toasts.update(list => [...list, toast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  dismiss(id: string): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}
