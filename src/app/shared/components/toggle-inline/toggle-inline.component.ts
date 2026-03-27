import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  standalone: true,
  selector: 'pf-toggle-inline',
  templateUrl: './toggle-inline.component.html',
  styleUrl: './toggle-inline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleInlineComponent {
  @Input() checked = false;
  @Input() disabled = false;
  @Input() ariaLabel = '';

  @Output() toggled = new EventEmitter<boolean>();

  protected onToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.toggled.emit(target.checked);
  }
}
