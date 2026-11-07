import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../config';
import { CartItem, Product, StoreSettings } from '../models';

// v2: clave nueva para no mezclar con el formato del carrito anterior
const STORAGE_KEY = 'mitienda.carrito.v2';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);

  // ---------- Estado ----------
  readonly items = signal<CartItem[]>(this.load());
  readonly isOpen = signal(false);   // panel lateral (drawer)

  // Valores por defecto; se reemplazan con los de la API (/api/settings)
  readonly settings = signal<StoreSettings>({ free_shipping_from: 200000, shipping_cost: 12000 });

  // ---------- Derivados (se recalculan solos) ----------
  readonly count = computed(() => this.items().reduce((acc, i) => acc + i.quantity, 0));
  readonly subtotal = computed(() => this.items().reduce((acc, i) => acc + i.price * i.quantity, 0));
  readonly shipping = computed(() =>
    this.items().length === 0 || this.subtotal() >= this.settings().free_shipping_from
      ? 0
      : this.settings().shipping_cost
  );
  readonly total = computed(() => this.subtotal() + this.shipping());
  readonly freeShippingRemaining = computed(() =>
    Math.max(0, this.settings().free_shipping_from - this.subtotal())
  );
  readonly freeShippingProgress = computed(() =>
    Math.min(100, Math.round((this.subtotal() / this.settings().free_shipping_from) * 100))
  );

  constructor() {
    // Persistencia automática en localStorage
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
      } catch {
        /* navegador sin almacenamiento: el carrito vive solo en memoria */
      }
    });

    this.http.get<StoreSettings>(`${API_URL}/settings`).subscribe({
      next: s => this.settings.set(s),
      error: () => { /* se quedan los valores por defecto */ },
    });
  }

  quantityOf(productId: number): number {
    return this.items().find(i => i.productId === productId)?.quantity ?? 0;
  }

  /** Agrega unidades. Devuelve false si ya no hay más stock disponible. */
  add(p: Product, quantity = 1): boolean {
    const current = this.quantityOf(p.id);
    const allowed = Math.min(quantity, p.stock - current);
    if (allowed <= 0) return false;

    this.items.update(items => {
      if (current > 0) {
        return items.map(i =>
          i.productId === p.id ? { ...i, quantity: i.quantity + allowed, stock: p.stock } : i
        );
      }
      return [...items, {
        productId: p.id,
        slug: p.slug,
        name: p.name,
        price: Number(p.price),
        imageUrl: p.image_url,
        quantity: allowed,
        stock: p.stock,
      }];
    });
    return true;
  }

  updateQuantity(productId: number, quantity: number) {
    if (!quantity || quantity <= 0) return this.remove(productId);
    this.items.update(items =>
      items.map(i => i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i)
    );
  }

  remove(productId: number) {
    this.items.update(items => items.filter(i => i.productId !== productId));
  }

  clear() {
    this.items.set([]);
  }

  open() { this.isOpen.set(true); }
  close() { this.isOpen.set(false); }

  private load(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }
}
