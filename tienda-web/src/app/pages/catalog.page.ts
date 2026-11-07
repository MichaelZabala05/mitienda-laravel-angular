import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { Category, Product, SortOption } from '../models';
import { ProductService } from '../services/product.service';
import { IconComponent } from '../shared/icon.component';
import { CopPipe } from '../shared/cop.pipe';
import { SkeletonGridComponent } from '../shared/skeleton-grid.component';
import { ProductCardComponent } from '../components/product-card.component';

// Los filtros viven en la URL (?category=ropa&sort=price_asc...):
// así el usuario puede compartir el enlace o usar el botón "atrás".
@Component({
  selector: 'app-catalog',
  imports: [FormsModule, RouterLink, IconComponent, CopPipe, SkeletonGridComponent, ProductCardComponent],
  template: `
    <section class="page-head">
      <div class="container">
        <nav class="crumbs" aria-label="Ruta de navegación">
          <a routerLink="/">Inicio</a><app-icon name="chevron-right" [size]="14" /><span>Tienda</span>
        </nav>
        <h1>{{ title() }}</h1>
        <p class="muted">
          @if (loading()) { Buscando productos… }
          @else { {{ total() }} {{ total() === 1 ? 'producto encontrado' : 'productos encontrados' }} }
        </p>
      </div>
    </section>

    <div class="container layout">
      <!-- ========== FILTROS ========== -->
      <aside class="filters" [class.open]="showFilters()" aria-label="Filtros">
        <div class="filters-head">
          <h2>Filtros</h2>
          <button class="icon-btn only-mobile" (click)="showFilters.set(false)" aria-label="Cerrar filtros">
            <app-icon name="x" />
          </button>
        </div>

        <div class="group">
          <h3>Categorías</h3>
          <button class="cat-btn" [class.active]="!category()" (click)="update({ category: null })">
            <span>Todas</span>
          </button>
          @for (c of categories(); track c.id) {
            <button class="cat-btn" [class.active]="category() === c.slug" (click)="update({ category: c.slug })">
              <span>{{ c.name }}</span><span class="count">{{ c.products_count }}</span>
            </button>
          }
        </div>

        <div class="group">
          <h3>Precio</h3>
          <div class="price-inputs">
            <input class="input" type="number" min="0" step="1000" placeholder="Mínimo" [(ngModel)]="minInput" aria-label="Precio mínimo" />
            <span class="muted">–</span>
            <input class="input" type="number" min="0" step="1000" placeholder="Máximo" [(ngModel)]="maxInput" aria-label="Precio máximo" />
          </div>
          <button class="btn btn-outline btn-sm btn-block" (click)="applyPrice()">Aplicar precio</button>
        </div>

        <div class="group">
          <label class="switch">
            <input type="checkbox" [checked]="onSale()" (change)="update({ on_sale: $any($event.target).checked ? 1 : null })" />
            <span class="slider" aria-hidden="true"></span>
            <span>Solo ofertas</span>
          </label>
        </div>

        @if (hasFilters()) {
          <button class="btn btn-ghost btn-sm btn-block" (click)="clearAll()">
            <app-icon name="x" [size]="16" /> Limpiar filtros
          </button>
        }
      </aside>
      @if (showFilters()) { <div class="filters-overlay" (click)="showFilters.set(false)"></div> }

      <!-- ========== RESULTADOS ========== -->
      <section class="results">
        <div class="toolbar">
          <button class="btn btn-outline btn-sm only-mobile" (click)="showFilters.set(true)">
            <app-icon name="filter" [size]="16" /> Filtros
          </button>

          <div class="chips">
            @if (q()) {
              <button class="chip" (click)="update({ q: null })">“{{ q() }}” <app-icon name="x" [size]="14" /></button>
            }
            @if (categoryName()) {
              <button class="chip" (click)="update({ category: null })">{{ categoryName() }} <app-icon name="x" [size]="14" /></button>
            }
            @if (onSale()) {
              <button class="chip" (click)="update({ on_sale: null })">Ofertas <app-icon name="x" [size]="14" /></button>
            }
            @if (min() !== null || max() !== null) {
              <button class="chip" (click)="update({ min: null, max: null })">
                {{ min() ?? 0 | cop }} – {{ max() !== null ? (max() | cop) : 'más' }} <app-icon name="x" [size]="14" />
              </button>
            }
          </div>

          <label class="sort">
            <span class="muted">Ordenar por</span>
            <select class="input" aria-label="Ordenar productos"
                    (change)="setSort($any($event.target).value)">
              @for (o of sortOptions; track o.value) {
                <option [value]="o.value" [selected]="o.value === sort()">{{ o.label }}</option>
              }
            </select>
          </label>
        </div>

        @if (error()) {
          <div class="empty">
            <div class="empty-icon"><app-icon name="alert" [size]="36" /></div>
            <h2>No pudimos cargar los productos</h2>
            <p>{{ error() }}</p>
            <button class="btn btn-primary" (click)="load()">Reintentar</button>
          </div>
        } @else if (loading()) {
          <app-skeleton-grid [count]="6" />
        } @else if (products().length === 0) {
          <div class="empty">
            <div class="empty-icon"><app-icon name="search" [size]="36" /></div>
            <h2>No encontramos productos</h2>
            <p>Prueba con otra búsqueda o quita algunos filtros.</p>
            <button class="btn btn-primary" (click)="clearAll()">Ver todos los productos</button>
          </div>
        } @else {
          <div class="product-grid">
            @for (p of products(); track p.id) { <app-product-card [product]="p" /> }
          </div>

          @if (lastPage() > 1) {
            <nav class="pager" aria-label="Paginación">
              <button class="icon-btn" [disabled]="page() === 1" (click)="goToPage(page() - 1)" aria-label="Página anterior">
                <app-icon name="chevron-left" />
              </button>
              @for (n of pages(); track n) {
                <button class="page" [class.active]="n === page()" (click)="goToPage(n)" [attr.aria-current]="n === page() ? 'page' : null">{{ n }}</button>
              }
              <button class="icon-btn" [disabled]="page() === lastPage()" (click)="goToPage(page() + 1)" aria-label="Página siguiente">
                <app-icon name="chevron-right" />
              </button>
            </nav>
          }
        }
      </section>
    </div>
  `,
  styles: [`
    .page-head { padding: 2rem 0 1.5rem; }
    .page-head h1 { font-size: clamp(1.7rem, 3.5vw, 2.4rem); font-weight: 800; margin: .5rem 0 .25rem; }

    .layout { display: grid; grid-template-columns: 260px 1fr; gap: 2rem; align-items: start; }

    .filters { position: sticky; top: 96px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .filters-head { display: flex; justify-content: space-between; align-items: center; }
    .filters-head h2 { font-size: 1.1rem; }
    .group { display: flex; flex-direction: column; gap: .35rem; }
    .group h3 { font-size: .8rem; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin-bottom: .35rem; }
    .cat-btn {
      display: flex; justify-content: space-between; align-items: center; width: 100%;
      padding: .55rem .75rem; border: none; background: transparent; border-radius: var(--radius-sm);
      cursor: pointer; font-weight: 600; color: var(--ink-2); text-align: left;
    }
    .cat-btn:hover { background: var(--bg); }
    .cat-btn.active { background: var(--brand-50); color: var(--brand-700); }
    .count { font-size: .78rem; background: var(--bg); padding: .1rem .5rem; border-radius: 999px; color: var(--muted); }
    .cat-btn.active .count { background: #fff; color: var(--brand-700); }
    .price-inputs { display: grid; grid-template-columns: 1fr auto 1fr; gap: .4rem; align-items: center; margin-bottom: .5rem; }
    .price-inputs .input { padding: .55rem .6rem; font-size: .88rem; }

    /* Interruptor "Solo ofertas" */
    .switch { display: flex; align-items: center; gap: .65rem; cursor: pointer; font-weight: 600; }
    .switch input { position: absolute; opacity: 0; width: 1px; height: 1px; }
    .slider { width: 44px; height: 24px; border-radius: 999px; background: var(--border); position: relative; transition: background .2s; flex-shrink: 0; }
    .slider::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: var(--shadow-sm); transition: transform .2s var(--ease); }
    .switch input:checked + .slider { background: var(--accent); }
    .switch input:checked + .slider::after { transform: translateX(20px); }
    .switch input:focus-visible + .slider { outline: 3px solid var(--brand-500); outline-offset: 2px; }

    .toolbar { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
    .chips { display: flex; gap: .5rem; flex-wrap: wrap; flex: 1; }
    .sort { display: flex; align-items: center; gap: .6rem; font-size: .88rem; margin-left: auto; }
    .sort select { width: auto; padding-top: .55rem; padding-bottom: .55rem; font-weight: 600; }

    .pager { display: flex; justify-content: center; align-items: center; gap: .35rem; margin-top: 2.5rem; flex-wrap: wrap; }
    .pager .icon-btn:disabled { opacity: .35; cursor: not-allowed; }
    .page { min-width: 42px; height: 42px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); font-weight: 700; cursor: pointer; }
    .page:hover { border-color: var(--brand-500); color: var(--brand-700); }
    .page.active { background: var(--brand-700); color: #fff; border-color: var(--brand-700); }

    .only-mobile { display: none; }
    .filters-overlay { display: none; }

    /* Móvil: los filtros se vuelven un panel deslizable */
    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .only-mobile { display: inline-flex; }
      .filters {
        position: fixed; top: 0; left: 0; bottom: 0; width: min(320px, 88%); z-index: 70;
        border-radius: 0 var(--radius) var(--radius) 0; overflow-y: auto;
        transform: translateX(-105%); transition: transform .3s var(--ease);
      }
      .filters.open { transform: none; box-shadow: var(--shadow-lg); }
      .filters-overlay { display: block; position: fixed; inset: 0; background: rgba(15, 23, 42, .45); z-index: 69; }
      .sort span { display: none; }
    }
  `],
})
export class CatalogPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ProductService);
  private loadSub?: Subscription;

  // ---------- Resultados ----------
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  total = signal(0);
  page = signal(1);
  lastPage = signal(1);
  loading = signal(true);
  error = signal('');

  // ---------- Filtros (reflejo de la URL) ----------
  category = signal('');
  q = signal('');
  sort = signal<SortOption>('relevance');
  min = signal<number | null>(null);
  max = signal<number | null>(null);
  onSale = signal(false);

  showFilters = signal(false);
  minInput: number | null = null;
  maxInput: number | null = null;

  sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Recomendados' },
    { value: 'newest', label: 'Más nuevos' },
    { value: 'price_asc', label: 'Precio: menor a mayor' },
    { value: 'price_desc', label: 'Precio: mayor a menor' },
    { value: 'name', label: 'Nombre (A–Z)' },
  ];

  categoryName = computed(() => this.categories().find(c => c.slug === this.category())?.name ?? '');

  title = computed(() => {
    if (this.q()) return `Resultados para “${this.q()}”`;
    if (this.onSale() && !this.category()) return 'Ofertas';
    return this.categoryName() || 'Todos los productos';
  });

  hasFilters = computed(() =>
    !!(this.category() || this.q() || this.onSale() || this.min() !== null || this.max() !== null)
  );

  pages = computed(() => Array.from({ length: this.lastPage() }, (_, i) => i + 1));

  constructor() {
    this.api.categories().pipe(takeUntilDestroyed()).subscribe(c => this.categories.set(c));

    // Cada vez que cambia la URL, se leen los filtros y se recarga
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(pm => {
      this.category.set(pm.get('category') ?? '');
      this.q.set(pm.get('q') ?? '');
      this.sort.set((pm.get('sort') as SortOption) || 'relevance');
      this.min.set(toNumber(pm.get('min')));
      this.max.set(toNumber(pm.get('max')));
      this.onSale.set(pm.get('on_sale') === '1');
      this.page.set(Number(pm.get('page')) || 1);
      this.minInput = this.min();
      this.maxInput = this.max();
      this.load();
    });
  }

  load() {
    this.loadSub?.unsubscribe(); // cancela una búsqueda anterior que siga en curso
    this.loading.set(true);
    this.error.set('');

    this.loadSub = this.api.list({
      category: this.category(),
      q: this.q(),
      sort: this.sort(),
      min: this.min(),
      max: this.max(),
      on_sale: this.onSale(),
      page: this.page(),
    }).subscribe({
      next: res => {
        this.products.set(res.data);
        this.total.set(res.total);
        this.page.set(res.current_page);
        this.lastPage.set(res.last_page);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Verifica que la API esté corriendo (php artisan serve) e inténtalo de nuevo.');
        this.loading.set(false);
      },
    });
  }

  /** Cambia filtros en la URL. Por defecto vuelve a la página 1. */
  update(params: Params, keepPage = false) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: keepPage ? params : { ...params, page: null },
      queryParamsHandling: 'merge',
    });
    this.showFilters.set(false);
  }

  setSort(value: SortOption) {
    this.update({ sort: value === 'relevance' ? null : value });
  }

  applyPrice() {
    let min = this.minInput ?? null;
    let max = this.maxInput ?? null;
    if (min !== null && max !== null && min > max) [min, max] = [max, min]; // corrige si los invirtieron
    this.update({ min, max });
  }

  goToPage(n: number) {
    if (n < 1 || n > this.lastPage()) return;
    this.update({ page: n === 1 ? null : n }, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearAll() {
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    this.showFilters.set(false);
  }
}

function toNumber(v: string | null): number | null {
  if (v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
