import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { BackendGeneratorStateService } from '../../services/backend-generator-state.service';
import { BackendPipelineGeneratorService } from '../../services/backend-pipeline-generator.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import type { GeneratedBackendPipeline } from '../../services/backend-pipeline-generator.service';

@Component({
  standalone: true,
  selector: 'pf-step-backend-review',
  templateUrl: './step-backend-review.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CardComponent],
})
export class StepBackendReviewComponent {
  protected readonly state = inject(BackendGeneratorStateService);
  private readonly generator = inject(BackendPipelineGeneratorService);

  protected readonly previewing = signal<GeneratedBackendPipeline | null>(null);

  protected previewFile(file: GeneratedBackendPipeline): void {
    this.previewing.set(file);
  }

  protected closePreview(): void {
    this.previewing.set(null);
  }

  protected downloadAll(): void {
    this.generator.downloadAll();
  }

  protected get files(): GeneratedBackendPipeline[] {
    return this.generator.generate();
  }
}
