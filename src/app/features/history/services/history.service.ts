import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HistoryProject, HistoryProjectApi, mapApiToHistoryProject } from '../models/history.model';
import { ToastService } from '../../../shared/components/toast/toast.service';

interface HistoryListResponse {
  projects: HistoryProjectApi[];
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);

  private readonly _projects = signal<HistoryProject[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchQuery = signal<string>('');
  private readonly _total = signal<number>(0);

  readonly projects = this._projects.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly total = this._total.asReadonly();

  readonly hasProjects = computed(() => this._projects().length > 0);

  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  async getProjects(page = 1, limit = 20, search?: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      let params = new HttpParams()
        .set('page', String(page))
        .set('limit', String(limit));

      const q = search ?? this._searchQuery();
      if (q) {
        params = params.set('q', q);
      }

      const response = await firstValueFrom(
        this.http.get<HistoryListResponse>(`${environment.apiUrl}/history`, { params }),
      );

      this._projects.set(response.projects.map(mapApiToHistoryProject));
      this._total.set(response.projects.length);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load history';
      this._error.set(message);
    } finally {
      this._loading.set(false);
    }
  }

  async getProject(id: string): Promise<HistoryProject | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<{ project: HistoryProjectApi }>(`${environment.apiUrl}/history/${id}`),
      );
      return mapApiToHistoryProject(response.project);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load project';
      this._error.set(message);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  async deleteProject(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await firstValueFrom(
        this.http.delete<void>(`${environment.apiUrl}/history/${id}`),
      );
      this._projects.update(list => list.filter(p => p.id !== id));
      this._total.update(n => Math.max(0, n - 1));
      this.toastService.show('Project deleted successfully.', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete project';
      this._error.set(message);
      this.toastService.show(message, 'error');
    } finally {
      this._loading.set(false);
    }
  }

  async regenerate(id: string, projectName: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const blob = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/history/${id}/regenerate`, {}, {
          responseType: 'blob',
        }),
      );
      this.triggerDownload(blob, `${projectName}-pipelines.zip`);
      this.toastService.show('Pipelines re-downloaded successfully!', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to regenerate pipelines';
      this._error.set(message);
      this.toastService.show(message, 'error');
    } finally {
      this._loading.set(false);
    }
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
