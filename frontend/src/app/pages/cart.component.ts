import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, RouterLink],
  template: `
    <h2>Tu carrito</h2>

    @if (cart.items().length === 0) {
      <p>El carrito está vacío. <a routerLink="/">Ver productos</a></p>
    } @else {
      @for (i of cart.items(); track i.productId) {
        <div class="fila">
          <img [src]="i.imageUrl" [alt]="i.name" />
          <span class="nombre">{{ i.name }}</span>
          <input type="number" min="1" [max]="i.stock" [value]="i.quantity"
                 (change)="cart.updateQuantity(i.productId, +$any($event.target).value)" />
          <span class="subtotal">{{ i.price * i.quantity | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
          <button class="quitar" (click)="cart.remove(i.productId)" aria-label="Quitar">✕</button>
        </div>
      }
      <h3>Total: {{ cart.total() | currency:'COP':'symbol-narrow':'1.0-0' }}</h3>
      <a routerLink="/checkout"><button>Finalizar compra</button></a>
    }
  `,
  styles: [`
    .fila { display: flex; align-items: center; gap: 1rem; background: #fff; border-bottom: 1px solid #eee; padding: .75rem; }
    .fila img { width: 64px; height: 48px; object-fit: cover; border-radius: 4px; }
    .nombre { flex: 1; }
    .subtotal { min-width: 100px; text-align: right; }
    input { width: 70px; }
    .quitar { background: transparent; color: #c00; border-color: transparent; }
  `],
})
export class Cart {
  cart = inject(CartService);
}
