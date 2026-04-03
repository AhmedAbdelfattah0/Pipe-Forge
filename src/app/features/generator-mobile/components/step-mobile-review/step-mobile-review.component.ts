import {
  ChangeDetectionStrategy, Component, inject, signal,
} from '@angular/core';
import { MobileGeneratorStateService } from '../../services/mobile-generator-state.service';
import { MobilePipelineGeneratorService } from '../../services/mobile-pipeline-generator.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import type { GeneratedMobilePipeline } from '../../services/mobile-pipeline-generator.service';

@Component({
  standalone: true,
  selector: 'pf-step-mobile-review',
  templateUrl: './step-mobile-review.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CardComponent],
})
export class StepMobileReviewComponent {
  protected readonly state = inject(MobileGeneratorStateService);
  private readonly generator = inject(MobilePipelineGeneratorService);

  protected readonly previewing = signal<GeneratedMobilePipeline | null>(null);

  protected get files(): GeneratedMobilePipeline[] {
    return this.generator.generate();
  }

  protected previewFile(file: GeneratedMobilePipeline): void { this.previewing.set(file); }
  protected closePreview(): void { this.previewing.set(null); }
  protected downloadAll(): void { this.generator.downloadAll(); }
}
