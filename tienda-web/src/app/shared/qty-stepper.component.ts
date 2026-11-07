import { Component, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

// Selector de cantidad −  2  +
@Component({
  selector: 'app-qty',
  imports: [IconComponent],
  template: `
    <div class="qty" [class.sm]="small()">
      <button type="button" (click)="set(value() - 1)" [disabled]="value() <= min()" aria-label="Disminuir cantidad">
        <app-icon name="minus" [size]="small() ? 14 : 16" />
      </button>
      <span aria-live="polite">{{ value() }}</span>
      <button type="button" (click)="set(value() + 1)" [disabled]="value() >= max()" aria-label="Aumentar cantidad">
        <app-icon name="plus" [size]="small() ? 14 : 16" />
      </button>
    </div>
  `,
  styles: [`
    .qty { display: inline-flex; align-items: center; border: 1.5px solid var(--border); border-radius: var(--radius-full); background: var(--surface); height: 46px; }
    .qty.sm { height: 34px; }
    button { width: 42px; height: 100%; display: grid; place-items: center; border: none; background: transparent; cursor: pointer; color: var(--ink-2); border-radius: var(--radius-full); }
    .sm button { width: 32px; }
    button:hover:not(:disabled) { color: var(--brand-700); background: var(--brand-50); }
    button:disabled { opacity: .35; cursor: not-allowed; }
    span { min-width: 28px; text-align: center; font-weight: 700; }
  `],
})
export class QtyStepperComponent {
  value = input.required<number>();
  min = input(1);
  max = input(99);
  small = input(false);
  changed = output<number>();

  set(v: number) {
    if (v < this.min() || v > this.max()) return;
    this.changed.emit(v);
  }
}
