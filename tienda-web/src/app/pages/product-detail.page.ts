import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { Product } from '../models';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { FavoritesService } from '../services/favorites.service';
import { ToastService } from '../services/toast.service';
import { IconComponent } from '../shared/icon.component';
import { CopPipe } from '../shared/cop.pipe';
import { ProductImageComponent } from '../shared/product-image.component';
import { QtyStepperComponent } from '../shared/qty-stepper.component';
import { ProductCardComponent } from '../components/product-card.component';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, IconComponent, CopPipe, ProductImageComponent, QtyStepperComponent, ProductCardComponent],
  template: `
    <div class="container page">
      @if (loading()) {
        <div class="grid">
          <div class="skeleton media-sk"></div>
          <div class="info">
            <div class="skeleton" style="height: 14px; width: 30%"></div>
            <div class="skeleton" style="height: 36px; width: 80%"></div>
            <div class="skeleton" style="height: 28px; width: 40%"></div>
            <div class="skeleton" style="height: 90px"></div>
            <div class="skeleton" style="height: 50px; border-radius: 999px"></div>
          </div>
        </div>
      } @else if (notFound()) {
        <div class="empty">
          <div class="empty-icon"><app-icon name="search" [size]="36" /></div>
          <h2>Este producto no existe o ya no está disponible</h2>
          <p>Puede que lo hayamos retirado del catálogo.</p>
          <a routerLink="/tienda" class="btn btn-primary">Volver a la tienda</a>
        </div>
      } @else {
      @if (product(); as p) {
        <nav class="crumbs" aria-label="Ruta de navegación">
          <a routerLink="/">Inicio</a><app-icon name="chevron-right" [size]="14" />
          <a routerLink="/tienda">Tienda</a><app-icon name="chevron-right" [size]="14" />
          <a routerLink="/tienda" [queryParams]="{ category: p.category.slug }">{{ p.category.name }}</a>
          <app-icon name="chevron-right" [size]="14" /><span>{{ p.name }}</span>
        </nav>

        <div class="grid">
          <!-- Imagen -->
          <div class="media">
            <app-product-image [src]="p.image_url" [alt]="p.name" />
            @if (p.discount_percent > 0) { <span class="badge badge-sale media-badge">-{{ p.discount_percent }}%</span> }
          </div>

          <!-- Información y compra -->
          <div class="info">
            <span class="badge badge-brand">{{ p.category.name }}</span>
            <h1>{{ p.name }}</h1>

            <div class="price-block">
              <span class="price" [class.sale]="p.discount_percent > 0">{{ p.price | cop }}</span>
              @if (p.discount_percent > 0) {
                <span class="compare">{{ p.compare_at_price | cop }}</span>
                <span class="save">Ahorras {{ savings() | cop }}</span>
              }
            </div>

            <p class="stock" [class.low]="p.stock > 0 && p.stock <= 5" [class.out]="p.stock === 0">
              <span class="dot"></span>
              @if (p.stock === 0) { Agotado por ahora }
              @else if (p.stock <= 5) { ¡Solo quedan {{ p.stock }} unidades! }
              @else { Disponible para envío inmediato }
            </p>

            @if (p.description) { <p class="desc">{{ p.description }}</p> }

            @if (p.stock > 0) {
              <div class="buy">
                <app-qty [value]="qty()" [max]="maxQty()" (changed)="qty.set($event)" />
                <button class="btn btn-primary btn-lg grow" (click)="add(p)" [disabled]="maxQty() === 0">
                  <app-icon name="cart" [size]="20" /> Agregar al carrito
                </button>
                <button class="icon-btn fav" [class.on]="isFav()" (click)="toggleFav(p)"
                        [attr.aria-label]="isFav() ? 'Quitar de favoritos' : 'Agregar a favoritos'" [attr.aria-pressed]="isFav()">
                  <app-icon name="heart" [filled]="isFav()" />
                </button>
              </div>
              <button class="btn btn-outline btn-lg btn-block" (click)="buyNow(p)" [disabled]="maxQty() === 0">
                Comprar ahora
              </button>
              @if (inCart() > 0) {
                <p class="in-cart"><app-icon name="check" [size]="16" /> Ya tienes {{ inCart() }} en tu carrito</p>
              }
            } @else {
              <button class="btn btn-outline btn-lg btn-block" (click)="toggleFav(p)">
                <app-icon name="heart" [filled]="isFav()" [size]="18" />
                {{ isFav() ? 'Guardado en favoritos' : 'Guardar en favoritos' }}
              </button>
            }

            <ul class="perks">
              <li><app-icon name="truck" [size]="20" /><div><strong>Envío a todo el país</strong><span>Gratis desde {{ cart.settings().free_shipping_from | cop }}</span></div></li>
              <li><app-icon name="cash" [size]="20" /><div><strong>Paga al recibir</strong><span>Contra entrega o transferencia</span></div></li>
              <li><app-icon name="refresh" [size]="20" /><div><strong>Cambios fáciles</strong><span>Si no te queda, te ayudamos</span></div></li>
            </ul>
          </div>
        </div>

        @if (related().length > 0) {
          <section class="section">
            <div class="section-head"><h2>También te puede gustar</h2></div>
            <div class="product-grid">
              @for (r of related(); track r.id) { <app-product-card [product]="r" /> }
            </div>
          </section>
        }
      }
      }
    </div>
  `,
  styles: [`
    .page { padding-top: 1.5rem; }
    .crumbs { margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 3rem; align-items: start; }

    .media { position: relative; aspect-ratio: 1; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); background: var(--surface); position: sticky; top: 96px; }
    .media-sk { aspect-ratio: 1; border-radius: var(--radius-lg); }
    .media-badge { position: absolute; top: 1rem; left: 1rem; font-size: .9rem; padding: .35rem .8rem; }

    .info { display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; }
    .info > .btn-block { width: 100%; }
    h1 { font-size: clamp(1.7rem, 3.5vw, 2.4rem); font-weight: 800; }

    .price-block { display: flex; align-items: baseline; gap: .75rem; flex-wrap: wrap; }
    .price { font-size: 2rem; font-weight: 800; letter-spacing: -.02em; }
    .price.sale { color: var(--accent); }
    .compare { font-size: 1.1rem; color: var(--muted); text-decoration: line-through; }
    .save { font-size: .85rem; font-weight: 700; color: var(--success); background: var(--success-50); padding: .25rem .65rem; border-radius: 999px; }

    .stock { display: flex; align-items: center; gap: .5rem; font-weight: 600; color: var(--success); font-size: .95rem; }
    .stock .dot { width: 10px; height: 10px; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 4px color-mix(in srgb, currentColor 20%, transparent); }
    .stock.low { color: var(--warning); }
    .stock.out { color: var(--muted); }

    .desc { color: var(--ink-2); font-size: 1.02rem; line-height: 1.7; }

    .buy { display: flex; gap: .75rem; width: 100%; align-items: center; }
    .grow { flex: 1; }
    .fav { border: 1.5px solid var(--border); width: 50px; height: 50px; }
    .fav.on { color: var(--accent); border-color: var(--accent); background: var(--accent-50); }
    .in-cart { display: flex; align-items: center; gap: .35rem; font-size: .88rem; color: var(--success); font-weight: 600; }

    .perks { list-style: none; padding: 1.25rem; margin: .5rem 0 0; width: 100%; display: flex; flex-direction: column; gap: 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
    .perks li { display: flex; gap: .85rem; align-items: center; color: var(--brand-700); }
    .perks strong { display: block; color: var(--ink); font-size: .92rem; }
    .perks span { font-size: .84rem; color: var(--muted); }

    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; gap: 1.5rem; }
      .media { position: relative; top: 0; }
    }
    @media (max-width: 480px) {
      .buy { flex-wrap: wrap; }
      .grow { order: 3; flex-basis: 100%; }
    }
  `],
})
export class ProductDetailPage {
  // Llega desde la URL /producto/:slug gracias a withComponentInputBinding()
  slug = input.required<string>();

  private api = inject(ProductService);
  private router = inject(Router);
  private titleService = inject(Title);
  private fav = inject(FavoritesService);
  private toast = inject(ToastService);
  cart = inject(CartService);

  product = signal<Product | null>(null);
  related = signal<Product[]>([]);
  loading = signal(true);
  notFound = signal(false);
  qty = signal(1);
  private sub?: Subscription;

  inCart = computed(() => {
    const p = this.product();
    return p ? this.cart.quantityOf(p.id) : 0;
  });
  // No deja elegir más de lo que queda (stock − lo que ya está en el carrito)
  maxQty = computed(() => Math.max(0, (this.product()?.stock ?? 0) - this.inCart()));
  savings = computed(() => {
    const p = this.product();
    return p && p.compare_at_price ? Number(p.compare_at_price) - Number(p.price) : 0;
  });
  isFav = computed(() => {
    const p = this.product();
    return p ? this.fav.has(p.id) : false;
  });

  constructor() {
    // Se recarga cada vez que cambia el slug (ej. al abrir un producto relacionado)
    effect(() => {
      const slug = this.slug();
      untracked(() => this.load(slug));
    });
  }

  private load(slug: string) {
    this.sub?.unsubscribe();
    this.loading.set(true);
    this.notFound.set(false);
    this.qty.set(1);

    this.sub = this.api.get(slug).subscribe({
      next: ({ product, related }) => {
        this.product.set(product);
        this.related.set(related);
        this.titleService.setTitle(`${product.name} — MiTienda`);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  add(p: Product) {
    if (this.cart.add(p, this.qty())) {
      this.qty.set(1);
      this.cart.open();
    } else {
      this.toast.show('Ya tienes en el carrito todas las unidades disponibles', 'info');
    }
  }

  buyNow(p: Product) {
    this.cart.add(p, this.qty());
    this.router.navigate(['/checkout']);
  }

  toggleFav(p: Product) {
    const added = this.fav.toggle(p);
    this.toast.show(added ? 'Guardado en favoritos' : 'Quitado de favoritos', 'info');
  }
}
