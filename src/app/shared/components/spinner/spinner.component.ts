import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'pf-spinner',
  templateUrl: './spinner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  protected get classes(): string {
    const sizeMap: Record<string, string> = {
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-[3px]',
    };
    return `animate-spin rounded-full border-primary/30 border-t-primary ${sizeMap[this.size]}`;
  }
}
