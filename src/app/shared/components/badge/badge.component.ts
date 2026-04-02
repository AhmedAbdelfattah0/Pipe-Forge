import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'pf-badge',
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  @Input() variant = 'default';
  @Input() text = '';

  protected get classes(): string {
    const base =
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';

    const variantMap: Record<string, string> = {
      storage: 'bg-blue-100 text-blue-700',
      swa: 'bg-green-100 text-green-700',
      'app-service': 'bg-purple-100 text-purple-700',
      'ftp-cpanel': 'bg-amber-100 text-amber-700',
      optional: 'bg-gray-100 text-gray-500',
      secret: 'bg-orange-100 text-warning',
      qa: 'bg-sky-100 text-sky-700',
      prod: 'bg-emerald-100 text-success',
      market: 'bg-cyan-100 text-cyan-700',
      default: 'bg-gray-100 text-gray-500',
    };

    return `${base} ${variantMap[this.variant] ?? variantMap['default']}`;
  }
}
