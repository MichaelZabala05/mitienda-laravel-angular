import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../services/cart.service';
import { FavoritesService } from '../services/favorites.service';
import { IconComponent } from '../shared/icon.component';
import { CopPipe } from '../shared/cop.pipe';

@Component({
  selector: 'app-header',
  imports: [FormsModule, RouterLink, RouterLinkActive, IconComponent, CopPipe],
  template: `
    <div class="announce">
      <app-icon name="truck" [size]="16" />
      Envío gratis en compras desde <strong>{{ cart.settings().free_shipping_from | cop }}</strong>
      <span class="sep">·</span> <span class="extra">Paga contra entrega o por transferencia</span>
    </div>

    <header class="header">
      <div class="container bar">
        <a routerLink="/" class="logo" aria-label="MiTienda, ir al inicio">
          <span class="logo-mark">M</span><span>MiTienda</span>
        </a>

        <nav class="nav" aria-label="Principal">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
          <a routerLink="/tienda" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Tienda</a>
          <a routerLink="/tienda" [queryParams]="{ on_sale: 1 }" class="sale">Ofertas</a>
        </nav>

        <form class="search" role="search" (ngSubmit)="search()">
          <app-icon name="search" [size]="18" />
          <input type="search" name="q" [(ngModel)]="term"
                 placeholder="Buscar camisetas, tenis, audífonos…" aria-label="Buscar productos" />
        </form>

        <div class="actions">
          <a routerLink="/favoritos" class="icon-btn" aria-label="Favoritos">
            <app-icon name="heart" />
            @if (fav.count() > 0) { <span class="dot">{{ fav.count() }}</span> }
          </a>
          <button class="icon-btn" (click)="cart.open()" aria-label="Abrir carrito">
            <app-icon name="cart" />
            @if (cart.count() > 0) { <span class="dot">{{ cart.count() }}</span> }
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .announce {
      display: flex; justify-content: center; align-items: center; gap: .45rem; flex-wrap: wrap;
      background: var(--brand-900); color: var(--brand-100);
      font-size: .82rem; padding: .5rem 1rem; text-align: center;
    }
    .announce strong { color: #fff; }
    .sep { opacity: .5; }

    .header {
      position: sticky; top: 0; z-index: 40;
      background: rgba(255, 255, 255, .9);
      backdrop-filter: saturate(180%) blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .bar {
      display: grid; grid-template-columns: auto auto 1fr auto;
      grid-template-areas: "logo nav search actions";
      align-items: center; gap: 1.5rem; min-height: 72px;
    }
    .logo { grid-area: logo; display: flex; align-items: center; gap: .55rem; font-weight: 800; font-size: 1.3rem; letter-spacing: -.03em; }
    .logo-mark {
      width: 36px; height: 36px; border-radius: 11px; display: grid; place-items: center;
      background: linear-gradient(135deg, var(--brand-600), var(--accent)); color: #fff; font-size: 1.05rem;
      box-shadow: 0 6px 14px rgba(79, 70, 229, .3);
    }

    .nav { grid-area: nav; display: flex; gap: .25rem; }
    .nav a { padding: .5rem .9rem; border-radius: var(--radius-full); font-weight: 600; color: var(--ink-2); font-size: .95rem; transition: background .2s, color .2s; white-space: nowrap; }
    .nav a:hover, .nav a.active { background: var(--brand-50); color: var(--brand-700); }
    .nav a.sale { color: var(--accent); }
    .nav a.sale:hover { background: var(--accent-50); }

    .search {
      grid-area: search; justify-self: end; width: 100%; max-width: 440px;
      display: flex; align-items: center; gap: .5rem; height: 46px; padding: 0 1rem;
      background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--radius-full);
      color: var(--muted); transition: border-color .2s, box-shadow .2s, background .2s;
    }
    .search:focus-within { border-color: var(--brand-500); box-shadow: 0 0 0 4px var(--brand-100); background: #fff; }
    .search input { border: none; background: transparent; outline: none; width: 100%; height: 100%; color: var(--ink); }

    .actions { grid-area: actions; display: flex; gap: .25rem; }
    .dot {
      position: absolute; top: 2px; right: 0; min-width: 20px; height: 20px; padding: 0 5px;
      border-radius: 999px; background: var(--accent); color: #fff; font-size: .7rem; font-weight: 800;
      display: grid; place-items: center; border: 2px solid #fff;
      animation: pop .35s var(--ease);
    }
    @keyframes pop { from { transform: scale(.4); } }

    /* Móvil: logo + acciones arriba, búsqueda y menú debajo */
    @media (max-width: 880px) {
      .bar {
        grid-template-columns: 1fr auto;
        grid-template-areas: "logo actions" "search search" "nav nav";
        gap: .65rem; padding-top: .75rem; padding-bottom: .5rem;
      }
      .search { max-width: none; }
      .nav { overflow-x: auto; }
      .announce .sep, .announce .extra { display: none; }
    }
  `],
})
export class HeaderComponent {
  cart = inject(CartService);
  fav = inject(FavoritesService);
  private router = inject(Router);
  term = '';

  search() {
    const q = this.term.trim();
    this.router.navigate(['/tienda'], { queryParams: { q: q || null } });
  }
}
