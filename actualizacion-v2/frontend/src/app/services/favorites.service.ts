import { Injectable, computed, effect, signal } from '@angular/core';
import { Product } from '../models';

const STORAGE_KEY = 'mitienda.favoritos';

// Lista de deseos guardada en el navegador (no requiere login)
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  readonly items = signal<Product[]>(this.load());
  readonly count = computed(() => this.items().length);
  private ids = computed(() => new Set(this.items().map(p => p.id)));

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
      } catch { /* sin almacenamiento */ }
    });
  }

  has(id: number): boolean {
    return this.ids().has(id);
  }

  /** Agrega o quita. Devuelve true si quedó agregado. */
  toggle(p: Product): boolean {
    if (this.has(p.id)) {
      this.items.update(items => items.filter(i => i.id !== p.id));
      return false;
    }
    this.items.update(items => [p, ...items]);
    return true;
  }

  private load(): Product[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }
}
