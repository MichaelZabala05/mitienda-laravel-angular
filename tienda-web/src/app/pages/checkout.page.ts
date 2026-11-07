import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { ToastService } from '../services/toast.service';
import { IconComponent } from '../shared/icon.component';
import { CopPipe } from '../shared/cop.pipe';
import { ProductImageComponent } from '../shared/product-image.component';
import { PaymentMethod } from '../models';

type CheckoutField =
  | 'customer_name' | 'customer_email' | 'customer_phone'
  | 'city' | 'address' | 'notes' | 'payment_method';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink, IconComponent, CopPipe, ProductImageComponent],
  template: `
    <div class="container page">
      <nav class="crumbs" aria-label="Ruta de navegación">
        <a routerLink="/carrito">Carrito</a><app-icon name="chevron-right" [size]="14" /><span>Finalizar compra</span>
      </nav>
      <h1>Finalizar compra</h1>

      @if (cart.items().length === 0) {
        <div class="empty panel">
          <div class="empty-icon"><app-icon name="cart" [size]="36" /></div>
          <h2>No hay productos para pagar</h2>
          <p>Agrega productos a tu carrito para continuar.</p>
          <a routerLink="/tienda" class="btn btn-primary btn-lg">Ir a la tienda</a>
        </div>
      } @else {
        <form class="layout" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="steps">
            <!-- Paso 1: contacto -->
            <section class="panel">
              <h2><span class="num">1</span> Tus datos</h2>
              <div class="fields">
                <div class="field full">
                  <label for="name">Nombre completo</label>
                  <input id="name" class="input" formControlName="customer_name" autocomplete="name"
                         [class.invalid]="error('customer_name')" placeholder="Ej. Laura Gómez" />
                  @if (error('customer_name'); as e) { <span class="field-error">{{ e }}</span> }
                </div>
                <div class="field">
                  <label for="email">Correo electrónico</label>
                  <input id="email" type="email" class="input" formControlName="customer_email" autocomplete="email"
                         [class.invalid]="error('customer_email')" placeholder="tucorreo@ejemplo.com" />
                  @if (error('customer_email'); as e) { <span class="field-error">{{ e }}</span> }
                </div>
                <div class="field">
                  <label for="phone">Celular</label>
                  <input id="phone" type="tel" class="input" formControlName="customer_phone" autocomplete="tel"
                         [class.invalid]="error('customer_phone')" placeholder="300 123 4567" />
                  @if (error('customer_phone'); as e) { <span class="field-error">{{ e }}</span> }
                </div>
              </div>
            </section>

            <!-- Paso 2: envío -->
            <section class="panel">
              <h2><span class="num">2</span> Dirección de envío</h2>
              <div class="fields">
                <div class="field">
                  <label for="city">Ciudad</label>
                  <select id="city" class="input" formControlName="city" [class.invalid]="error('city')">
                    <option value="" disabled>Selecciona tu ciudad</option>
                    @for (c of cities; track c) { <option [value]="c">{{ c }}</option> }
                  </select>
                  @if (error('city'); as e) { <span class="field-error">{{ e }}</span> }
                </div>
                <div class="field">
                  <label for="address">Dirección</label>
                  <input id="address" class="input" formControlName="address" autocomplete="street-address"
                         [class.invalid]="error('address')" placeholder="Calle 123 # 45-67, apto 301" />
                  @if (error('address'); as e) { <span class="field-error">{{ e }}</span> }
                </div>
                <div class="field full">
                  <label for="notes">Indicaciones para la entrega <span class="muted">(opcional)</span></label>
                  <textarea id="notes" class="input" formControlName="notes" rows="2"
                            placeholder="Ej. Dejar en portería, torre 2"></textarea>
                </div>
              </div>
            </section>

            <!-- Paso 3: pago -->
            <section class="panel">
              <h2><span class="num">3</span> Método de pago</h2>
              <div class="pay-options">
                @for (m of paymentMethods; track m.value) {
                  <label class="pay" [class.selected]="form.controls.payment_method.value === m.value">
                    <input type="radio" formControlName="payment_method" [value]="m.value" />
                    <span class="pay-icon"><app-icon [name]="m.icon" /></span>
                    <span class="pay-text"><strong>{{ m.label }}</strong><span>{{ m.help }}</span></span>
                    <span class="radio" aria-hidden="true"></span>
                  </label>
                }
              </div>
            </section>
          </div>

          <!-- Resumen -->
          <aside class="summary panel">
            <h2>Tu pedido</h2>
            <ul class="mini">
              @for (i of cart.items(); track i.productId) {
                <li>
                  <span class="mini-img">
                    <app-product-image [src]="i.imageUrl" [alt]="i.name" />
                    <span class="mini-qty">{{ i.quantity }}</span>
                  </span>
                  <span class="mini-name">{{ i.name }}</span>
                  <span>{{ i.price * i.quantity | cop }}</span>
                </li>
              }
            </ul>
            <div>
              <div class="summary-row"><span>Subtotal</span><span>{{ cart.subtotal() | cop }}</span></div>
              <div class="summary-row">
                <span>Envío</span>
                @if (cart.shipping() === 0) { <span class="free">Gratis</span> } @else { <span>{{ cart.shipping() | cop }}</span> }
              </div>
              <div class="summary-row total"><span>Total</span><span>{{ cart.total() | cop }}</span></div>
            </div>

            @if (serverError()) {
              <div class="alert" role="alert"><app-icon name="alert" [size]="18" /> {{ serverError() }}</div>
            }

            <button type="submit" class="btn btn-primary btn-lg btn-block" [disabled]="sending()">
              @if (sending()) { <span class="spinner"></span> Procesando… }
              @else { <app-icon name="check" [size]="18" /> Confirmar pedido }
            </button>
            <p class="secure"><app-icon name="shield" [size]="16" /> Tus datos solo se usan para tu envío</p>
          </aside>
        </form>
      }
    </div>
  `,
  styles: [`
    .page { padding-top: 1.5rem; }
    h1 { font-size: clamp(1.7rem, 3.5vw, 2.4rem); font-weight: 800; margin: .5rem 0 1.5rem; }
    .layout { display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem; align-items: start; }
    .steps { display: flex; flex-direction: column; gap: 1.25rem; }
    .panel h2 { font-size: 1.15rem; display: flex; align-items: center; gap: .65rem; margin-bottom: 1.25rem; }
    .num { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: var(--brand-700); color: #fff; font-size: .9rem; }

    .fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .full { grid-column: 1 / -1; }

    .pay-options { display: grid; gap: .75rem; }
    .pay { display: flex; align-items: center; gap: .9rem; padding: 1rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; transition: border-color .2s, background .2s; }
    .pay:hover { border-color: var(--brand-200); }
    .pay.selected { border-color: var(--brand-600); background: var(--brand-50); }
    .pay input { position: absolute; opacity: 0; width: 1px; height: 1px; }
    .pay:focus-within { outline: 3px solid var(--brand-500); outline-offset: 2px; }
    .pay-icon { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; background: #fff; color: var(--brand-700); border: 1px solid var(--border); }
    .pay-text { flex: 1; display: flex; flex-direction: column; }
    .pay-text span { font-size: .85rem; color: var(--muted); }
    .radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--border); position: relative; }
    .pay.selected .radio { border-color: var(--brand-600); }
    .pay.selected .radio::after { content: ''; position: absolute; inset: 3px; border-radius: 50%; background: var(--brand-600); }

    .summary { position: sticky; top: 96px; display: flex; flex-direction: column; gap: 1rem; }
    .summary h2 { margin-bottom: 0; }
    .mini { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .85rem; max-height: 260px; overflow-y: auto; }
    .mini li { display: grid; grid-template-columns: 54px 1fr auto; gap: .75rem; align-items: center; font-size: .9rem; }
    .mini-img { position: relative; width: 54px; height: 54px; border-radius: 10px; overflow: visible; display: block; }
    .mini-img app-product-image { border-radius: 10px; }
    .mini-qty { position: absolute; top: -7px; right: -7px; min-width: 22px; height: 22px; padding: 0 5px; border-radius: 999px; background: var(--ink); color: #fff; font-size: .72rem; font-weight: 800; display: grid; place-items: center; }
    .mini-name { font-weight: 600; line-height: 1.3; }

    .alert { display: flex; gap: .5rem; align-items: flex-start; padding: .8rem 1rem; border-radius: var(--radius-sm); background: var(--danger-50); color: var(--danger); font-size: .9rem; font-weight: 600; }
    .secure { display: flex; align-items: center; justify-content: center; gap: .4rem; font-size: .82rem; color: var(--muted); }
    .spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255, 255, 255, .4); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 960px) {
      .layout { grid-template-columns: 1fr; }
      .summary { position: static; }
    }
    @media (max-width: 560px) { .fields { grid-template-columns: 1fr; } }
  `],
})
export class CheckoutPage {
  private fb = inject(FormBuilder);
  private orders = inject(OrderService);
  private router = inject(Router);
  private toast = inject(ToastService);
  cart = inject(CartService);

  sending = signal(false);
  submitted = signal(false);
  serverError = signal('');

  cities = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales', 'Santa Marta', 'Otra ciudad'];

  paymentMethods: { value: PaymentMethod; label: string; help: string; icon: 'cash' | 'card' }[] = [
    { value: 'contraentrega', label: 'Pago contra entrega', help: 'Pagas en efectivo cuando recibes tu pedido', icon: 'cash' },
    { value: 'transferencia', label: 'Transferencia bancaria', help: 'Te enviamos los datos por correo al confirmar', icon: 'card' },
  ];

  form = this.fb.nonNullable.group({
    customer_name: ['', [Validators.required, Validators.minLength(3)]],
    customer_email: ['', [Validators.required, Validators.email]],
    customer_phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]{7,20}$/)]],
    city: ['', Validators.required],
    address: ['', [Validators.required, Validators.minLength(5)]],
    notes: [''],
    payment_method: ['contraentrega' as PaymentMethod, Validators.required],
  });

  /** Mensaje de error del campo, solo si el usuario ya lo tocó o intentó enviar. */
  error(name: CheckoutField): string | null {
    const c = this.form.controls[name];
    if (!c.invalid || !(c.touched || this.submitted())) return null;
    if (c.hasError('required')) return 'Este campo es obligatorio';
    if (c.hasError('email')) return 'Escribe un correo válido';
    if (c.hasError('pattern')) return 'Escribe un número válido (solo dígitos)';
    if (c.hasError('minlength')) return 'Es demasiado corto';
    return 'Revisa este campo';
  }

  submit() {
    this.submitted.set(true);
    this.serverError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.show('Revisa los campos marcados en rojo', 'error');
      return;
    }

    this.sending.set(true);
    this.orders.create({
      ...this.form.getRawValue(),
      // Solo id y cantidad; el backend calcula precios y envío
      items: this.cart.items().map(i => ({ product_id: i.productId, quantity: i.quantity })),
    }).subscribe({
      next: order => {
        this.cart.clear();
        this.router.navigate(['/pedido', order.code]);
      },
      error: (err: HttpErrorResponse) => {
        this.serverError.set(this.describe(err));
        this.sending.set(false);
      },
    });
  }

  private describe(err: HttpErrorResponse): string {
    if (err.status === 0) return 'No hay conexión con el servidor. Inténtalo de nuevo.';
    if (err.status === 429) return 'Demasiados intentos. Espera un minuto y vuelve a intentarlo.';
    if (err.status === 422) {
      // Laravel devuelve { errors: { campo: ['mensaje'] } }
      const errors = err.error?.errors as Record<string, string[]> | undefined;
      const first = errors ? Object.values(errors)[0]?.[0] : null;
      return first ?? err.error?.message ?? 'Revisa los datos del pedido.';
    }
    return 'No pudimos crear tu pedido. Inténtalo de nuevo en unos minutos.';
  }
}
