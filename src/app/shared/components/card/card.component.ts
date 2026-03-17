import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'pf-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() padding: 'sm' | 'md' | 'lg' = 'md';

  protected get paddingClass(): string {
    const map: Record<string, string> = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    return map[this.padding];
  }
}
