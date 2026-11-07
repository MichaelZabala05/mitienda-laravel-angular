import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Order } from '../models';
import { OrderService } from '../services/order.service';
import { IconComponent } from '../shared/icon.component';
import { CopPipe } from '../shared/cop.pipe';
import { ProductImageComponent } from '../shared/product-image.component';

@Component({
  selector: 'app-order-success',
  imports: [DatePipe, RouterLink, IconComponent, CopPipe, ProductImageComponent],
  template: `
    <div class="container page">
      @if (loading()) {
        <div class="card"><div class="skeleton" style="height: 320px"></div></div>
      } @else {
        @if (order(); as o) {
        <div class="card">
          <div class="hero">
            <div class="check"><app-icon name="check" [size]="40" /></div>
            <h1>¡Gracias por tu compra, {{ firstName(o.customer_name) }}!</h1>
            <p>Recibimos tu pedido y ya lo estamos preparando.</p>
            <div class="code">Pedido <strong>{{ o.code }}</strong></div>
          </div>

          <div class="meta">
            <div><span>Fecha</span><strong>{{ o.created_at | date: 'd MMM y, h:mm a' }}</strong></div>
            <div><span>Envío a</span><strong>{{ o.city }}</strong></div>
            <div><span>Pago</span><strong>{{ o.payment_method === 'transferencia' ? 'Transferencia' : 'Contra entrega' }}</strong></div>
            <div><span>Total</span><strong>{{ o.total | cop }}</strong></div>
          </div>

          <ul class="items">
            @for (i of o.items; track i.id) {
              <li>
                <span class="thumb"><app-product-image [src]="i.product.image_url" [alt]="i.product.name" /></span>
                <span class="name">{{ i.product.name }} <span class="muted">× {{ i.quantity }}</span></span>
                <span>{{ i.subtotal | cop }}</span>
              </li>
            }
          </ul>

          <div class="totals">
            <div class="summary-row"><span>Subtotal</span><span>{{ o.subtotal | cop }}</span></div>
            <div class="summary-row">
              <span>Envío</span>
              @if (isZero(o.shipping)) { <span class="free">Gratis</span> } @else { <span>{{ o.shipping | cop }}</span> }
            </div>
            <div class="summary-row total"><span>Total</span><span>{{ o.total | cop }}</span></div>
          </div>

          <div class="next">
            <h2>¿Qué sigue?</h2>
            <ol>
              <li><app-icon name="mail" [size]="18" /> Te contactaremos para confirmar los detalles del envío.</li>
              @if (o.payment_method === 'transferencia') {
                <li><app-icon name="card" [size]="18" /> Te enviaremos los datos bancarios para realizar la transferencia.</li>
              } @else {
                <li><app-icon name="cash" [size]="18" /> Ten listo el pago en efectivo al recibir tu pedido.</li>
              }
              <li><app-icon name="package" [size]="18" /> Guarda tu código <strong>{{ o.code }}</strong> para cualquier consulta.</li>
            </ol>
          </div>

          <a routerLink="/tienda" class="btn btn-primary btn-lg btn-block">Seguir comprando</a>
        </div>
        } @else {
          <div class="empty">
            <div class="empty-icon"><app-icon name="search" [size]="36" /></div>
            <h2>No encontramos este pedido</h2>
            <p>Revisa el código o vuelve a la tienda.</p>
            <a routerLink="/" class="btn btn-primary">Ir al inicio</a>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page { padding-top: 2.5rem; }
    .card { max-width: 680px; margin: 0 auto; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 1.5rem; }
    .hero { text-align: center; display: flex; flex-direction: column; align-items: center; gap: .6rem; }
    .check { width: 84px; height: 84px; border-radius: 50%; display: grid; place-items: center; background: var(--success-50); color: var(--success); animation: pop .5s var(--ease); box-shadow: 0 0 0 10px rgba(21, 128, 61, .06); }
    @keyframes pop { from { transform: scale(.3); opacity: 0; } }
    h1 { font-size: clamp(1.5rem, 3.5vw, 2rem); font-weight: 800; }
    .hero p { color: var(--muted); }
    .code { margin-top: .4rem; padding: .5rem 1rem; border-radius: 999px; background: var(--brand-50); color: var(--brand-800); font-size: .95rem; }

    .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: .75rem; }
    .meta div { background: var(--bg); border-radius: var(--radius-sm); padding: .75rem; display: flex; flex-direction: column; gap: .15rem; }
    .meta span { font-size: .78rem; color: var(--muted); }
    .meta strong { font-size: .92rem; }

    .items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .75rem; }
    .items li { display: grid; grid-template-columns: 52px 1fr auto; gap: .85rem; align-items: center; }
    .thumb { width: 52px; height: 52px; border-radius: 10px; overflow: hidden; display: block; }
    .name { font-weight: 600; }

    .next { background: var(--brand-50); border-radius: var(--radius); padding: 1.25rem; }
    .next h2 { font-size: 1.05rem; margin-bottom: .75rem; }
    .next ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .6rem; }
    .next li { display: flex; gap: .6rem; align-items: flex-start; font-size: .92rem; color: var(--ink-2); }
    .next app-icon { color: var(--brand-700); margin-top: 2px; }

    @media (max-width: 600px) {
      .card { padding: 1.25rem; }
      .meta { grid-template-columns: 1fr 1fr; }
    }
  `],
})
export class OrderSuccessPage {
  code = input.required<string>();  // /pedido/:code

  private orders = inject(OrderService);
  order = signal<Order | null>(null);
  loading = signal(true);

  constructor() {
    effect(() => {
      const code = this.code();
      untracked(() => {
        this.loading.set(true);
        this.orders.get(code).subscribe({
          next: o => { this.order.set(o); this.loading.set(false); },
          error: () => { this.order.set(null); this.loading.set(false); },
        });
      });
    });
  }

  isZero(value: string) {
    return Number(value) === 0;
  }

  firstName(full: string) {
    return full.trim().split(/\s+/)[0];
  }
}
