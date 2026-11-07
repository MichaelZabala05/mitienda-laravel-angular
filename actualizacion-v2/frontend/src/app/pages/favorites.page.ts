import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../services/favorites.service';
import { IconComponent } from '../shared/icon.component';
import { ProductCardComponent } from '../components/product-card.component';

@Component({
  selector: 'app-favorites',
  imports: [RouterLink, IconComponent, ProductCardComponent],
  template: `
    <div class="container page">
      <div class="section-head">
        <div>
          <span class="eyebrow">Tu lista de deseos</span>
          <h1>Favoritos</h1>
        </div>
        @if (fav.count() > 0) { <span class="muted">{{ fav.count() }} guardados</span> }
      </div>

      @if (fav.count() === 0) {
        <div class="empty panel">
          <div class="empty-icon"><app-icon name="heart" [size]="36" /></div>
          <h2>Aún no tienes favoritos</h2>
          <p>Toca el corazón en cualquier producto para guardarlo aquí y comprarlo después.</p>
          <a routerLink="/tienda" class="btn btn-primary btn-lg">Explorar productos</a>
        </div>
      } @else {
        <p class="note muted">
          <app-icon name="info" [size]="16" /> Precios y disponibilidad pueden haber cambiado; ábrelo para ver el dato actual.
        </p>
        <div class="product-grid">
          @for (p of fav.items(); track p.id) { <app-product-card [product]="p" /> }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding-top: 2rem; }
    h1 { font-size: clamp(1.7rem, 3.5vw, 2.4rem); font-weight: 800; }
    .note { display: flex; align-items: center; gap: .4rem; font-size: .85rem; margin-bottom: 1rem; }
  `],
})
export class FavoritesPage {
  fav = inject(FavoritesService);
}
