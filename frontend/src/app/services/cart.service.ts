import { Injectable, computed, effect, signal } from '@angular/core';
import { CartItem, Product } from '../models';

const STORAGE_KEY = 'carrito';

@Injectable({ providedIn: 'root' })
export class CartService {
  // Estado principal: lista de ítems
  readonly items = signal<CartItem[]>(this.load());

  // Valores derivados: se recalculan solos cuando cambia items
  readonly count = computed(() => this.items().reduce((acc, i) => acc + i.quantity, 0));
  readonly total = computed(() => this.items().reduce((acc, i) => acc + i.price * i.quantity, 0));

  constructor() {
    // Cada vez que cambia el carrito, se guarda en localStorage
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
      } catch {
        /* navegador sin almacenamiento: el carrito vive solo en memoria */
      }
    });
  }

  add(p: Product) {
    this.items.update(items => {
      const existing = items.find(i => i.productId === p.id);
      if (existing) {
        return items.map(i =>
          i.productId === p.id ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i
        );
      }
      return [...items, {
        productId: p.id,
        name: p.name,
        price: Number(p.price),
        imageUrl: p.image_url,
        quantity: 1,
        stock: p.stock,
      }];
    });
  }

  updateQuantity(productId: number, quantity: number) {
    if (!quantity || quantity <= 0) return this.remove(productId);
    this.items.update(items =>
      items.map(i => i.productId === productId
        ? { ...i, quantity: Math.min(quantity, i.stock) }
        : i)
    );
  }

  remove(productId: number) {
    this.items.update(items => items.filter(i => i.productId !== productId));
  }

  clear() {
    this.items.set([]);
  }

  private load(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];   // si el JSON está dañado, empieza vacío
    }
  }
}
