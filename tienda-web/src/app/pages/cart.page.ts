import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { IconComponent } from '../shared/icon.component';
import { CopPipe } from '../shared/cop.pipe';
import { ProductImageComponent } from '../shared/product-image.component';
import { QtyStepperComponent } from '../shared/qty-stepper.component';
import { ShippingProgressComponent } from '../components/shipping-progress.component';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, IconComponent, CopPipe, ProductImageComponent, QtyStepperComponent, ShippingProgressComponent],
  template: `
    <div class="container page">
      <h1>Tu carrito</h1>

      @if (cart.items().length === 0) {
        <div class="empty panel">
          <div class="empty-icon"><app-icon name="cart" [size]="36" /></div>
          <h2>Tu carrito está vacío</h2>
          <p>Cuando agregues productos, aparecerán aquí.</p>
          <a routerLink="/tienda" class="btn btn-primary btn-lg">Ir a la tienda</a>
        </div>
      } @else {
        <div class="layout">
          <section class="items panel">
            @for (i of cart.items(); track i.productId) {
              <div class="row">
                <a class="thumb" [routerLink]="['/producto', i.slug]">
                  <app-product-image [src]="i.imageUrl" [alt]="i.name" />
                </a>
                <div class="info">
                  <a class="name" [routerLink]="['/producto', i.slug]">{{ i.name }}</a>
                  <span class="muted unit">{{ i.price | cop }} c/u</span>
                  @if (i.quantity >= i.stock) { <span class="badge badge-warn">Máximo disponible</span> }
                </div>
                <app-qty [value]="i.quantity" [max]="i.stock" (changed)="cart.updateQuantity(i.productId, $event)" />
                <strong class="line">{{ i.price * i.quantity | cop }}</strong>
                <button class="icon-btn remove" (click)="cart.remove(i.productId)" [attr.aria-label]="'Quitar ' + i.name">
                  <app-icon name="trash" [size]="18" />
                </button>
              </div>
            }
            <a routerLink="/tienda" class="link back"><app-icon name="arrow-left" [size]="16" /> Seguir comprando</a>
          </section>

          <aside class="summary panel">
            <h2>Resumen</h2>
            <app-shipping-progress />
            <div class="rows">
              <div class="summary-row"><span>Productos ({{ cart.count() }})</span><span>{{ cart.subtotal() | cop }}</span></div>
              <div class="summary-row">
                <span>Envío</span>
                @if (cart.shipping() === 0) { <span class="free">Gratis</span> } @else { <span>{{ cart.shipping() | cop }}</span> }
              </div>
              <div class="summary-row total"><span>Total</span><span>{{ cart.total() | cop }}</span></div>
            </div>
            <a routerLink="/checkout" class="btn btn-primary btn-lg btn-block">
              Continuar al pago <app-icon name="arrow-right" [size]="18" />
            </a>
            <p class="secure"><app-icon name="shield" [size]="16" /> Compra segura · Paga al recibir</p>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding-top: 2rem; }
    h1 { font-size: clamp(1.7rem, 3.5vw, 2.4rem); font-weight: 800; margin-bottom: 1.5rem; }
    .layout { display: grid; grid-template-columns: 1fr 360px; gap: 1.5rem; align-items: start; }

    .items { padding: .5rem 1.5rem 1.5rem; }
    .row { display: grid; grid-template-columns: 88px 1fr auto 110px 44px; gap: 1rem; align-items: center; padding: 1.1rem 0; border-bottom: 1px solid var(--border); }
    .thumb { width: 88px; height: 88px; border-radius: var(--radius-sm); overflow: hidden; display: block; }
    .info { display: flex; flex-direction: column; gap: .25rem; align-items: flex-start; min-width: 0; }
    .name { font-weight: 700; }
    .name:hover { color: var(--brand-700); }
    .unit { font-size: .85rem; }
    .line { text-align: right; font-size: 1.05rem; }
    .remove:hover { color: var(--danger); background: var(--danger-50); }
    .back { margin-top: 1.25rem; }

    .summary { position: sticky; top: 96px; display: flex; flex-direction: column; gap: 1rem; }
    .summary h2 { font-size: 1.2rem; }
    .secure { display: flex; align-items: center; justify-content: center; gap: .4rem; font-size: .82rem; color: var(--muted); }

    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .summary { position: static; }
    }
    @media (max-width: 600px) {
      .items { padding: .25rem 1rem 1rem; }
      .row { grid-template-columns: 72px 1fr auto; grid-template-areas: "img info remove" "img qty line"; gap: .5rem .85rem; }
      .thumb { grid-area: img; width: 72px; height: 72px; }
      .info { grid-area: info; }
      app-qty { grid-area: qty; }
      .line { grid-area: line; }
      .remove { grid-area: remove; }
    }
  `],
})
export class CartPage {
  cart = inject(CartService);
}
