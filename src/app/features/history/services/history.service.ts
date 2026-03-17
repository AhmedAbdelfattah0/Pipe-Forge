import { computed, Injectable, signal } from '@angular/core';
import { HistoryProject } from '../models/history.model';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly _projects = signal<HistoryProject[]>(
    this.loadFromStorage(),
  );
  private readonly _searchQuery = signal<string>('');

  readonly projects = this._projects.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();

  readonly filteredProjects = computed<HistoryProject[]>(() => {
    const query = this._searchQuery().toLowerCase().trim();
    if (!query) return this._projects();
    return this._projects().filter(
      p =>
        p.mfeName.toLowerCase().includes(query) ||
        p.repositoryName.toLowerCase().includes(query) ||
        p.markets.some(m => m.toLowerCase().includes(query)),
    );
  });

  readonly hasProjects = computed(() => this._projects().length > 0);

  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  addProject(project: HistoryProject): void {
    this._projects.update(p => [project, ...p]);
    this.saveToStorage();
  }

  removeProject(id: string): void {
    this._projects.update(p => p.filter(proj => proj.id !== id));
    this.saveToStorage();
  }

  private saveToStorage(): void {
    localStorage.setItem(
      'pipeforge-history',
      JSON.stringify(this._projects()),
    );
  }

  private loadFromStorage(): HistoryProject[] {
    try {
      const stored = localStorage.getItem('pipeforge-history');
      if (!stored) return this.getMockProjects();
      const parsed = JSON.parse(stored) as HistoryProject[];
      return parsed.map(p => ({ ...p, generatedAt: new Date(p.generatedAt) }));
    } catch {
      return this.getMockProjects();
    }
  }

  private getMockProjects(): HistoryProject[] {
    return [
      {
        id: '1',
        mfeName: 'shoppingbag',
        repositoryName: 'Webapp-ShoppingBagV2',
        deployTarget: 'storage-account',
        markets: ['KSA', 'Bahrain'],
        environments: ['QA', 'PROD'],
        languages: ['EN', 'AR'],
        outputFormats: ['yaml', 'classic-json'],
        generatedAt: new Date('2024-03-10'),
        pipelineCount: 16,
      },
      {
        id: '2',
        mfeName: 'checkout',
        repositoryName: 'Webapp-newCheckout',
        deployTarget: 'static-web-app',
        markets: ['KSA', 'UAE'],
        environments: ['QA', 'PROD'],
        languages: ['EN'],
        outputFormats: ['yaml', 'classic-json'],
        generatedAt: new Date('2024-03-08'),
        pipelineCount: 8,
      },
      {
        id: '3',
        mfeName: 'homepage',
        repositoryName: 'Webapp-Homepage',
        deployTarget: 'app-service',
        markets: ['KSA'],
        environments: ['QA'],
        languages: ['EN', 'AR'],
        outputFormats: ['yaml'],
        generatedAt: new Date('2024-03-05'),
        pipelineCount: 4,
      },
    ];
  }
}
