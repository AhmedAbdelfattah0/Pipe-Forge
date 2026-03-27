import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EnvironmentType } from '../../models/generator.model';
import { GeneratorStateService } from '../../services/generator-state.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ToggleInlineComponent } from '../../../../shared/components/toggle-inline/toggle-inline.component';

interface EnvConfig {
  id: EnvironmentType;
  label: string;
  branch: string;
}

@Component({
  standalone: true,
  selector: 'pf-step-markets',
  templateUrl: './step-markets.component.html',
  styleUrl: './step-markets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, ButtonComponent, BadgeComponent, CardComponent, ToggleInlineComponent],
})
export class StepMarketsComponent {
  protected readonly state = inject(GeneratorStateService);

  protected readonly envConfigs: readonly EnvConfig[] = [
    { id: 'QA', label: 'QA', branch: 'qa-*' },
    { id: 'PROD', label: 'Production', branch: 'main' },
  ];

  protected addMarket(): void {
    this.state.addMarket({ name: '', code: '', enabled: true });
  }

  protected onMarketNameChange(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const market = this.state.markets()[index];
    this.state.updateMarket(index, { ...market, name: value });
  }

  protected onMarketCodeChange(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const market = this.state.markets()[index];
    this.state.updateMarket(index, { ...market, code: value });
  }
}
