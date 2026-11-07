import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { Category, Product } from '../models';

@Component({
  selector: 'app-product-list',
  imports: [CurrencyPipe, FormsModule],
  template: `
    <div class="filtros">
      <input placeholder="Buscar producto..." [(ngModel)]="search" (keyup.enter)="load(1)" />
      <button (click)="load(1)">Buscar</button>
    </div>

    <div class="categorias">
      <button [class.activa]="!category()" (click)="selectCategory('')">Todas</button>
      @for (c of categories(); track c.id) {
        <button [class.activa]="category() === c.slug" (click)="selectCategory(c.slug)">{{ c.name }}</button>
      }
    </div>

    @if (error()) {
      <p class="error">{{ error() }}</p>
    }

    @if (loading()) {
      <p>Cargando productos...</p>
    } @else {
      <div class="grid">
        @for (p of products(); track p.id) {
          <article class="card">
            <img [src]="p.image_url" [alt]="p.name" loading="lazy" />
            <h3>{{ p.name }}</h3>
            <small>{{ p.category.name }}</small>
            <p class="precio">{{ +p.price | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
            @if (p.stock > 0) {
              <button (click)="cart.add(p)">Agregar al carrito</button>
            } @else {
              <button disabled>Agotado</button>
            }
          </article>
        } @empty {
          <p>No hay productos con esos filtros.</p>
        }
      </div>

      @if (lastPage() > 1) {
        <div class="paginacion">
          <button [disabled]="page() === 1" (click)="load(page() - 1)">← Anterior</button>
          <span>Página {{ page() }} de {{ lastPage() }}</span>
          <button [disabled]="page() === lastPage()" (click)="load(page() + 1)">Siguiente →</button>
        </div>
      }
    }
  `,
  styles: [`
    .filtros, .categorias { display: flex; gap: .5rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .filtros input { flex: 1; min-width: 200px; }
    .categorias button { background: #fff; color: #222; }
    .categorias button.activa { background: #222; color: #fff; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .card { background: #fff; border: 1px solid #e5e5e5; border-radius: 10px; padding: 1rem; display: flex; flex-direction: column; gap: .35rem; }
    .card img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 6px; }
    .card h3 { margin: .25rem 0 0; font-size: 1rem; }
    .card small { color: #777; }
    .card button { margin-top: auto; }
    .precio { font-weight: bold; font-size: 1.1rem; margin: .25rem 0; }
    .paginacion { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
    .error { color: #c00; }
  `],
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  cart = inject(CartService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  category = signal('');
  page = signal(1);
  lastPage = signal(1);
  loading = signal(false);
  error = signal('');
  search = '';

  ngOnInit() {
    this.productService.categories().subscribe(c => this.categories.set(c));
    this.load(1);
  }

  selectCategory(slug: string) {
    this.category.set(slug);
    this.load(1);
  }

  load(page: number) {
    this.loading.set(true);
    this.error.set('');
    this.productService.list({ category: this.category(), q: this.search, page }).subscribe({
      next: res => {
        this.products.set(res.data);          // Laravel pagina dentro de "data"
        this.page.set(res.current_page);
        this.lastPage.set(res.last_page);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con la API. ¿Está corriendo php artisan serve?');
        this.loading.set(false);
      },
    });
  }
}
