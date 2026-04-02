import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  standalone: true,
  selector: 'pf-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'ghost' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() fullWidth = false;
  @Output() clicked = new EventEmitter<void>();

  protected get classes(): string {
    const base =
      'cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-medium transition-all duration-150 outline-none hover:-translate-y-px active:translate-y-0 focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0';

    const variantMap: Record<string, string> = {
      primary:
        'bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary/50',
      ghost:
        'border border-border text-text-dark bg-transparent hover:bg-surface focus-visible:ring-primary/50',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/50',
    };

    const sizeMap: Record<string, string> = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 text-sm',
      lg: 'h-10 px-6 text-base',
    };

    const widthClass = this.fullWidth ? 'w-full' : '';

    return `${base} ${variantMap[this.variant]} ${sizeMap[this.size]}${widthClass ? ' ' + widthClass : ''}`;
  }
}
