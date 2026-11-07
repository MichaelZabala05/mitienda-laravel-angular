import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, CurrencyPipe, RouterLink],
  template: `
    @if (orderId()) {
      <h2>¡Pedido #{{ orderId() }} recibido! 🎉</h2>
      <p>Te contactaremos para coordinar el pago y el envío.</p>
      <a routerLink="/">Seguir comprando</a>
    } @else {
      <h2>Datos de envío</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input formControlName="customer_name" placeholder="Nombre completo" />
        <input formControlName="customer_email" placeholder="Correo" type="email" />
        <input formControlName="customer_phone" placeholder="Celular" />
        <input formControlName="address" placeholder="Dirección" />

        <p>Total a pagar: <strong>{{ cart.total() | currency:'COP':'symbol-narrow':'1.0-0' }}</strong></p>

        @if (error()) { <p class="error">{{ error() }}</p> }

        <button type="submit" [disabled]="form.invalid || sending() || cart.count() === 0">
          {{ sending() ? 'Enviando...' : 'Confirmar pedido' }}
        </button>
      </form>
    }
  `,
  styles: [`
    form { display: flex; flex-direction: column; gap: .75rem; max-width: 420px; }
    .error { color: #c00; }
  `],
})
export class Checkout {
  private fb = inject(FormBuilder);
  private orders = inject(OrderService);
  cart = inject(CartService);

  sending = signal(false);
  error = signal('');
  orderId = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    customer_name: ['', Validators.required],
    customer_email: ['', [Validators.required, Validators.email]],
    customer_phone: ['', Validators.required],
    address: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    this.sending.set(true);
    this.error.set('');

    this.orders.create({
      ...this.form.getRawValue(),
      // Solo enviamos id y cantidad; el backend calcula los precios
      items: this.cart.items().map(i => ({ product_id: i.productId, quantity: i.quantity })),
    }).subscribe({
      next: order => {
        this.orderId.set(order.id);
        this.cart.clear();
        this.sending.set(false);
      },
      error: err => {
        // Muestra el mensaje de validación de Laravel (ej. stock insuficiente)
        this.error.set(err.error?.message ?? 'No se pudo crear el pedido');
        this.sending.set(false);
      },
    });
  }
}
