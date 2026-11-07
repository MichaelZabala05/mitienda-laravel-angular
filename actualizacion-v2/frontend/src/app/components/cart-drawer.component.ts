import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { IconComponent } from '../shared/icon.component';
import { CopPipe } from '../shared/cop.pipe';
import { ProductImageComponent } from '../shared/product-image.component';
import { QtyStepperComponent } from '../shared/qty-stepper.component';
import { ShippingProgressComponent } from './shipping-progress.component';

// Mini carrito lateral: se abre al agregar productos sin sacar al usuario de la página
@Component({
  selector: 'app-cart-drawer',
  imports: [RouterLink, IconComponent, CopPipe, ProductImageComponent, QtyStepperComponent, ShippingProgressComponent],
  template: `
    @if (cart.isOpen()) {
      <div class="overlay" (click)="cart.close()"></div>

      <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <header class="d-head">
          <h2 id="drawer-title">Tu carrito <span class="muted">({{ cart.count() }})</span></h2>
          <button class="icon-btn" (click)="cart.close()" aria-label="Cerrar carrito"><app-icon name="x" /></button>
        </header>

        @if (cart.items().length === 0) {
          <div class="empty">
            <div class="empty-icon"><app-icon name="cart" [size]="36" /></div>
            <h2>Tu carrito está vacío</h2>
            <p>Explora la tienda y agrega lo que te guste.</p>
            <a routerLink="/tienda" class="btn btn-primary" (click)="cart.close()">Explorar tienda</a>
          </div>
        } @else {
          <div class="d-body">
            <app-shipping-progress />

            <ul class="items">
              @for (i of cart.items(); track i.productId) {
                <li class="item">
                  <a class="thumb" [routerLink]="['/producto', i.slug]" (click)="cart.close()">
                    <app-product-image [src]="i.imageUrl" [alt]="i.name" />
                  </a>
                  <div class="info">
                    <a class="name" [routerLink]="['/producto', i.slug]" (click)="cart.close()">{{ i.name }}</a>
                    <span class="price">{{ i.price | cop }}</span>
                    <app-qty [value]="i.quantity" [max]="i.stock" [small]="true"
                             (changed)="cart.updateQuantity(i.productId, $event)" />
                  </div>
                  <div class="side">
                    <strong>{{ i.price * i.quantity | cop }}</strong>
                    <button class="remove" (click)="cart.remove(i.productId)" [attr.aria-label]="'Quitar ' + i.name">
                      <app-icon name="trash" [size]="16" />
                    </button>
                  </div>
                </li>
              }
            </ul>
          </div>

          <footer class="d-foot">
            <div class="summary-row"><span>Subtotal</span><span>{{ cart.subtotal() | cop }}</span></div>
            <div class="summary-row">
              <span>Envío</span>
              @if (cart.shipping() === 0) { <span class="free">Gratis</span> } @else { <span>{{ cart.shipping() | cop }}</span> }
            </div>
            <div class="summary-row total"><span>Total</span><span>{{ cart.total() | cop }}</span></div>
            <button class="btn btn-primary btn-lg btn-block" (click)="go('/checkout')">
              Finalizar compra <app-icon name="arrow-right" [size]="18" />
            </button>
            <button class="btn btn-outline btn-block" (click)="go('/carrito')">Ver carrito completo</button>
          </footer>
        }
      </aside>
    }
  `,
  styles: [`
    .overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, .45); backdrop-filter: blur(2px); z-index: 60; animation: fade .2s ease; }
    .drawer {
      position: fixed; top: 0; right: 0; bottom: 0; width: min(430px, 100%); z-index: 61;
      background: var(--surface); display: flex; flex-direction: column; box-shadow: var(--shadow-lg);
      animation: slide .32s var(--ease);
    }
    @keyframes fade { from { opacity: 0; } }
    @keyframes slide { from { transform: translateX(100%); } }

    .d-head { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid var(--border); }
    .d-head h2 { font-size: 1.15rem; }
    .d-body { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; }

    .items { list-style: none; margin: 1rem 0 0; padding: 0; display: flex; flex-direction: column; gap: 1rem; }
    .item { display: grid; grid-template-columns: 76px 1fr auto; gap: .85rem; align-items: start; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
    .thumb { width: 76px; height: 76px; border-radius: var(--radius-sm); overflow: hidden; display: block; }
    .info { display: flex; flex-direction: column; gap: .3rem; align-items: flex-start; min-width: 0; }
    .name { font-weight: 700; font-size: .92rem; line-height: 1.3; }
    .name:hover { color: var(--brand-700); }
    .price { font-size: .82rem; color: var(--muted); }
    .side { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; height: 100%; gap: .5rem; }
    .remove { border: none; background: transparent; color: var(--muted); cursor: pointer; padding: .35rem; border-radius: 8px; }
    .remove:hover { color: var(--danger); background: var(--danger-50); }

    .d-foot { border-top: 1px solid var(--border); padding: 1rem 1.25rem 1.25rem; display: flex; flex-direction: column; gap: .55rem; background: var(--bg); }
    .d-foot .summary-row.total { margin-bottom: .4rem; }
    .empty { flex: 1; justify-content: center; }
  `],
})
export class CartDrawerComponent {
  cart = inject(CartService);
  private router = inject(Router);

  // Esc cierra el panel (accesibilidad)
  @HostListener('document:keydown.escape')
  onEscape() {
    this.cart.close();
  }

  go(path: string) {
    this.cart.close();
    this.router.navigate([path]);
  }
}
