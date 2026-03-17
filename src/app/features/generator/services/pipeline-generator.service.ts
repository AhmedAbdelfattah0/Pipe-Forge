import { inject, Injectable, signal } from '@angular/core';
import { GeneratorStateService } from './generator-state.service';
import { HistoryService } from '../../history/services/history.service';

type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class PipelineGeneratorService {
  private readonly state = inject(GeneratorStateService);
  private readonly historyService = inject(HistoryService);

  private readonly _isGenerating = signal<boolean>(false);
  private readonly _generationStatus = signal<GenerationStatus>('idle');

  readonly isGenerating = this._isGenerating.asReadonly();
  readonly generationStatus = this._generationStatus.asReadonly();

  async generate(): Promise<void> {
    this._isGenerating.set(true);
    this._generationStatus.set('generating');

    try {
      await this.simulateGeneration();
      this.downloadMockZip();
      this.saveToHistory();
      this._generationStatus.set('success');

      setTimeout(() => {
        this._generationStatus.set('idle');
      }, 3000);
    } catch {
      this._generationStatus.set('error');

      setTimeout(() => {
        this._generationStatus.set('idle');
      }, 3000);
    } finally {
      this._isGenerating.set(false);
    }
  }

  private simulateGeneration(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  private saveToHistory(): void {
    this.historyService.addProject({
      id: crypto.randomUUID(),
      mfeName: this.state.mfeName(),
      repositoryName: this.state.repositoryName(),
      deployTarget: this.state.deployTarget()!,
      markets: this.state.enabledMarkets().map(m => m.name),
      environments: [...this.state.environments()],
      languages: this.state.isMultiLanguage()
        ? this.state.languages().map(l => l.name)
        : ['Single'],
      outputFormats: [...this.state.outputFormats()],
      generatedAt: new Date(),
      pipelineCount: this.state.totalPipelineCount(),
    });
  }

  private downloadMockZip(): void {
    const content = [
      'PipeForge Generated Pipelines',
      `MFE: ${this.state.mfeName()}`,
      `Generated: ${new Date().toISOString()}`,
      `Pipelines: ${this.state.totalPipelineCount()}`,
      '',
      'This is a mock download.',
      'Real pipeline generation coming soon.',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.state.mfeName() || 'my-app'}-pipelines-mock.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
