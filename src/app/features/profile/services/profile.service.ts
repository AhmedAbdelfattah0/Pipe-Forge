import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../shared/components/toast/toast.service';
import type { UserProfile } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);

  private readonly _profile = signal<UserProfile | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _isSaving = signal<boolean>(false);

  readonly profile = this._profile.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isSaving = this._isSaving.asReadonly();

  async loadProfile(): Promise<void> {
    this._isLoading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<{ profile: UserProfile }>(`${environment.apiUrl}/profile`),
      );
      this._profile.set(res.profile);
    } catch {
      this.toastService.show('Failed to load profile', 'error');
    } finally {
      this._isLoading.set(false);
    }
  }

  async updateProfile(data: Partial<UserProfile>): Promise<void> {
    this._isSaving.set(true);
    try {
      const res = await firstValueFrom(
        this.http.patch<{ profile: UserProfile }>(`${environment.apiUrl}/profile`, data),
      );
      this._profile.set(res.profile);
      this.toastService.show('Profile saved successfully', 'success');
    } catch {
      this.toastService.show('Failed to save profile', 'error');
    } finally {
      this._isSaving.set(false);
    }
  }

  async uploadAvatar(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await firstValueFrom(
        this.http.post<{ profile: UserProfile; avatarUrl: string }>(
          `${environment.apiUrl}/profile/avatar`,
          formData,
        ),
      );
      this._profile.set(res.profile);
      this.toastService.show('Avatar uploaded', 'success');
      return res.avatarUrl;
    } catch {
      this.toastService.show('Failed to upload avatar', 'error');
      return null;
    }
  }

  getInitials(): string {
    const p = this._profile();
    if (!p) return '?';
    const name = p.full_name || p.display_name || p.email;
    return name
      .split(/[\s@]+/)
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');
  }
}
