import { Component, inject } from '@angular/core';
import { CartService } from '../services/cart.service';
import { IconComponent } from '../shared/icon.component';
import { CopPipe } from '../shared/cop.pipe';

// Barra "Te faltan $X para envío gratis" → incentiva a subir el valor del pedido
@Component({
  selector: 'app-shipping-progress',
  imports: [IconComponent, CopPipe],
  template: `
    <div class="ship" [class.done]="cart.freeShippingRemaining() === 0">
      <p>
        @if (cart.freeShippingRemaining() === 0) {
          <app-icon name="check-circle" [size]="18" /> ¡Genial! Tu envío es <strong>gratis</strong>
        } @else {
          <app-icon name="truck" [size]="18" />
          Te faltan <strong>{{ cart.freeShippingRemaining() | cop }}</strong> para el envío gratis
        }
      </p>
      <div class="track" role="progressbar" aria-label="Progreso hacia envío gratis"
           [attr.aria-valuenow]="cart.freeShippingProgress()" aria-valuemin="0" aria-valuemax="100">
        <div class="fill" [style.width.%]="cart.freeShippingProgress()"></div>
      </div>
    </div>
  `,
  styles: [`
    .ship { background: var(--brand-50); border-radius: var(--radius-sm); padding: .85rem 1rem; }
    .ship.done { background: var(--success-50); }
    p { display: flex; align-items: center; gap: .45rem; font-size: .88rem; color: var(--ink-2); margin-bottom: .55rem; flex-wrap: wrap; }
    .done p { color: var(--success); }
    .track { height: 8px; background: rgba(67, 56, 202, .15); border-radius: 999px; overflow: hidden; }
    .done .track { background: rgba(21, 128, 61, .15); }
    .fill { height: 100%; background: linear-gradient(90deg, var(--brand-600), var(--brand-500)); border-radius: 999px; transition: width .5s var(--ease); }
    .done .fill { background: var(--success); }
  `],
})
export class ShippingProgressComponent {
  cart = inject(CartService);
}
