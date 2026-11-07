import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Category, Product } from '../models';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { IconComponent, IconName } from '../shared/icon.component';
import { CopPipe } from '../shared/cop.pipe';
import { ProductImageComponent } from '../shared/product-image.component';
import { SkeletonGridComponent } from '../shared/skeleton-grid.component';
import { ProductCardComponent } from '../components/product-card.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, IconComponent, CopPipe, ProductImageComponent, SkeletonGridComponent, ProductCardComponent],
  template: `
    <!-- ================= HERO ================= -->
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="pill">✨ Nueva colección {{ year }}</span>
          <h1>Estilo que se siente,<br /><span class="hl">precios que enamoran</span></h1>
          <p>Ropa, calzado, accesorios y tecnología seleccionados para ti. Compra en minutos, paga como prefieras y recibe en casa.</p>
          <div class="hero-cta">
            <a routerLink="/tienda" class="btn btn-light btn-lg">Explorar tienda <app-icon name="arrow-right" [size]="18" /></a>
            <a routerLink="/tienda" [queryParams]="{ on_sale: 1 }" class="btn btn-lg btn-glass">
              <app-icon name="tag" [size]="18" /> Ver ofertas
            </a>
          </div>
          <ul class="trust">
            <li><app-icon name="check" [size]="16" /> Pago contra entrega</li>
            <li><app-icon name="check" [size]="16" /> Envíos a todo el país</li>
            <li><app-icon name="check" [size]="16" /> Cambios fáciles</li>
          </ul>
        </div>

        <div class="hero-art" aria-hidden="true">
          @if (heroProducts().length === 3) {
            @for (p of heroProducts(); track p.id; let i = $index) {
              <a class="tile tile-{{ i }}" [routerLink]="['/producto', p.slug]" tabindex="-1">
                <app-product-image [src]="p.image_url" [alt]="p.name" />
                <span class="tile-label">
                  <span>{{ p.name }}</span>
                  <strong>{{ p.price | cop }}</strong>
                </span>
                @if (p.discount_percent > 0) { <span class="badge badge-sale tile-badge">-{{ p.discount_percent }}%</span> }
              </a>
            }
          } @else {
            <div class="tile tile-0 ghost"></div>
            <div class="tile tile-1 ghost"></div>
            <div class="tile tile-2 ghost"></div>
          }
        </div>
      </div>
    </section>

    <!-- ================= BENEFICIOS ================= -->
    <section class="container">
      <ul class="benefits">
        @for (b of benefits(); track b.title) {
          <li>
            <span class="b-icon"><app-icon [name]="b.icon" /></span>
            <div><strong>{{ b.title }}</strong><span>{{ b.text }}</span></div>
          </li>
        }
      </ul>
    </section>

    <!-- ================= CATEGORÍAS ================= -->
    <section class="section container">
      <div class="section-head">
        <div><span class="eyebrow">Explora</span><h2>Compra por categoría</h2></div>
        <a routerLink="/tienda" class="link">Ver todo <app-icon name="arrow-right" [size]="16" /></a>
      </div>
      <div class="cats">
        @for (c of categories(); track c.id; let i = $index) {
          <a class="cat" [routerLink]="['/tienda']" [queryParams]="{ category: c.slug }" [style.--tone]="tones[i % tones.length]">
            <span class="cat-name">{{ c.name }}</span>
            <span class="cat-count">{{ c.products_count }} productos</span>
            <span class="cat-arrow"><app-icon name="arrow-right" [size]="18" /></span>
          </a>
        } @empty {
          @for (i of [0, 1, 2, 3]; track i) { <div class="cat skeleton"></div> }
        }
      </div>
    </section>

    <!-- ================= DESTACADOS ================= -->
    <section class="section container">
      <div class="section-head">
        <div><span class="eyebrow">Lo más pedido</span><h2>Productos destacados</h2></div>
        <a routerLink="/tienda" class="link">Ver catálogo <app-icon name="arrow-right" [size]="16" /></a>
      </div>

      @if (loading()) {
        <app-skeleton-grid [count]="4" />
      } @else if (error()) {
        <div class="empty">
          <div class="empty-icon"><app-icon name="alert" [size]="36" /></div>
          <h2>No pudimos conectar con la tienda</h2>
          <p>Verifica que la API esté corriendo (php artisan serve) y recarga la página.</p>
        </div>
      } @else {
        <div class="product-grid">
          @for (p of featured(); track p.id) { <app-product-card [product]="p" /> }
        </div>
      }
    </section>

    <!-- ================= BANNER OFERTAS ================= -->
    <section class="container">
      <div class="promo">
        <div>
          <span class="eyebrow light">Temporada de ofertas</span>
          <h2>Descuentos en productos seleccionados</h2>
          <p>Aprovecha precios especiales mientras haya unidades disponibles.</p>
        </div>
        <a routerLink="/tienda" [queryParams]="{ on_sale: 1 }" class="btn btn-light btn-lg">
          Ver ofertas <app-icon name="arrow-right" [size]="18" />
        </a>
      </div>
    </section>
  `,
  styles: [`
    /* ----- Hero ----- */
    .hero {
      color: #fff; padding: 4rem 0 6rem;
      background:
        radial-gradient(900px 400px at 85% 10%, rgba(225, 29, 72, .35), transparent 60%),
        radial-gradient(700px 500px at 0% 100%, rgba(99, 102, 241, .45), transparent 60%),
        linear-gradient(135deg, var(--brand-900), var(--brand-700));
    }
    .hero-grid { display: grid; grid-template-columns: 1.05fr 1fr; gap: 3rem; align-items: center; }
    .pill { display: inline-block; padding: .4rem .9rem; border-radius: 999px; background: rgba(255, 255, 255, .12); border: 1px solid rgba(255, 255, 255, .2); font-size: .85rem; font-weight: 600; margin-bottom: 1.25rem; }
    h1 { font-size: clamp(2.2rem, 5vw, 3.6rem); font-weight: 800; letter-spacing: -.035em; line-height: 1.08; }
    .hl { background: linear-gradient(90deg, #FDA4AF, #C7D2FE); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .hero-copy p { font-size: 1.1rem; color: #E0E7FF; margin: 1.25rem 0 2rem; max-width: 520px; }
    .hero-cta { display: flex; gap: .75rem; flex-wrap: wrap; }
    .btn-glass { background: rgba(255, 255, 255, .1); color: #fff; border-color: rgba(255, 255, 255, .35); }
    .btn-glass:hover { background: rgba(255, 255, 255, .18); }
    .trust { list-style: none; padding: 0; margin: 2rem 0 0; display: flex; gap: 1.25rem; flex-wrap: wrap; font-size: .9rem; color: #C7D2FE; }
    .trust li { display: flex; align-items: center; gap: .35rem; }

    .hero-art { display: grid; grid-template-columns: 1.2fr 1fr; grid-template-rows: 1fr 1fr; gap: 1rem; height: 440px; }
    .tile { position: relative; border-radius: var(--radius-lg); overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, .3); display: block; }
    .tile-0 { grid-row: 1 / 3; }
    .tile.ghost { background: rgba(255, 255, 255, .1); }
    .tile:hover app-product-image ::ng-deep img { transform: scale(1.05); }
    .tile-label {
      position: absolute; left: .75rem; right: .75rem; bottom: .75rem; display: flex; justify-content: space-between; gap: .5rem; align-items: center;
      background: rgba(255, 255, 255, .92); color: var(--ink); padding: .55rem .8rem; border-radius: 12px; font-size: .85rem; font-weight: 600;
      backdrop-filter: blur(6px);
    }
    .tile-label span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tile-badge { position: absolute; top: .75rem; left: .75rem; }

    /* ----- Beneficios (se monta sobre el hero) ----- */
    .benefits {
      list-style: none; margin: -3rem 0 0; padding: 1.25rem; position: relative; z-index: 2;
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
      background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow);
    }
    .benefits li { display: flex; align-items: center; gap: .85rem; padding: .5rem; }
    .b-icon { width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; background: var(--brand-50); color: var(--brand-700); flex-shrink: 0; }
    .benefits strong { display: block; font-size: .95rem; }
    .benefits span { font-size: .83rem; color: var(--muted); }

    /* ----- Categorías ----- */
    .cats { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 1rem; }
    .cat {
      --tone: var(--brand-50);
      position: relative; display: flex; flex-direction: column; gap: .25rem; min-height: 140px; padding: 1.4rem;
      background: var(--tone); border-radius: var(--radius); overflow: hidden;
      transition: transform .25s var(--ease), box-shadow .25s;
    }
    .cat:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
    .cat-name { font-size: 1.3rem; font-weight: 800; }
    .cat-count { font-size: .88rem; color: var(--ink-2); }
    .cat-arrow { position: absolute; right: 1.2rem; bottom: 1.2rem; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: #fff; box-shadow: var(--shadow-sm); transition: transform .25s var(--ease); }
    .cat:hover .cat-arrow { transform: translateX(4px); }

    /* ----- Banner ----- */
    .promo {
      display: flex; align-items: center; justify-content: space-between; gap: 2rem; flex-wrap: wrap;
      padding: 2.5rem; border-radius: var(--radius-lg); color: #fff;
      background: linear-gradient(120deg, var(--accent-600), var(--accent) 45%, var(--brand-600));
    }
    .promo h2 { font-size: clamp(1.5rem, 3vw, 2.1rem); font-weight: 800; margin: .35rem 0 .5rem; }
    .promo p { color: #FFE4E6; }
    .eyebrow.light { color: #FFE4E6; }

    @media (max-width: 960px) {
      .hero { padding: 3rem 0 5rem; }
      .hero-grid { grid-template-columns: 1fr; }
      .hero-art { height: 300px; }
      .benefits { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 560px) {
      .benefits { grid-template-columns: 1fr; }
      .hero-art { height: 240px; }
      .tile-label { display: none; }
      .promo { padding: 1.75rem; }
    }
  `],
})
export class HomePage {
  private api = inject(ProductService);
  private cart = inject(CartService);

  year = new Date().getFullYear();
  featured = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal(false);

  heroProducts = computed(() => this.featured().slice(0, 3));

  // Colores suaves para las tarjetas de categoría (de la misma paleta)
  tones = ['#EEF2FF', '#FFF1F2', '#F0FDF4', '#FFFBEB', '#F0F9FF'];

  benefits = computed<{ icon: IconName; title: string; text: string }[]>(() => [
    { icon: 'truck', title: 'Envío gratis', text: `En compras desde ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(this.cart.settings().free_shipping_from)}` },
    { icon: 'cash', title: 'Paga al recibir', text: 'Contra entrega o transferencia' },
    { icon: 'shield', title: 'Compra segura', text: 'Tus datos están protegidos' },
    { icon: 'refresh', title: 'Cambios fáciles', text: 'Si no te queda, lo cambiamos' },
  ]);

  constructor() {
    this.api.categories().pipe(takeUntilDestroyed()).subscribe(c => this.categories.set(c));
    this.api.featured().pipe(takeUntilDestroyed()).subscribe({
      next: p => { this.featured.set(p); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }
}
