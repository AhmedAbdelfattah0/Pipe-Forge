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

  private compressImage(file: File): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 512;
        let { width, height } = img;
        if (width > height) {
          if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
        } else {
          if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
      };
      img.src = url;
    });
  }

  async uploadAvatar(file: File): Promise<string | null> {
    const compressed = await this.compressImage(file);
    const formData = new FormData();
    formData.append('avatar', compressed, 'avatar.jpg');
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
