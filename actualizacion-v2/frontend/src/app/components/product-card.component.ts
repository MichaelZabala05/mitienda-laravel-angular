import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../models';
import { CartService } from '../services/cart.service';
import { FavoritesService } from '../services/favorites.service';
import { ToastService } from '../services/toast.service';
import { IconComponent } from '../shared/icon.component';
import { CopPipe } from '../shared/cop.pipe';
import { ProductImageComponent } from '../shared/product-image.component';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, IconComponent, CopPipe, ProductImageComponent],
  template: `
    <article class="card" [class.soldout]="soldOut()">
      <a class="media" [routerLink]="['/producto', p().slug]" [attr.aria-label]="'Ver ' + p().name">
        <app-product-image [src]="p().image_url" [alt]="p().name" />
        <div class="badges">
          @if (p().discount_percent > 0) { <span class="badge badge-sale">-{{ p().discount_percent }}%</span> }
          @if (soldOut()) { <span class="badge badge-muted">Agotado</span> }
          @else if (p().stock <= 5) { <span class="badge badge-warn">¡Últimas {{ p().stock }}!</span> }
        </div>
      </a>

      <button class="fav" [class.on]="isFav()" (click)="toggleFav()"
              [attr.aria-label]="isFav() ? 'Quitar de favoritos' : 'Agregar a favoritos'" [attr.aria-pressed]="isFav()">
        <app-icon name="heart" [filled]="isFav()" [size]="18" />
      </button>

      <div class="body">
        <span class="cat">{{ p().category.name }}</span>
        <a class="name" [routerLink]="['/producto', p().slug]">{{ p().name }}</a>
        <div class="prices">
          <span class="price" [class.sale]="p().discount_percent > 0">{{ p().price | cop }}</span>
          @if (p().discount_percent > 0) { <span class="compare">{{ p().compare_at_price | cop }}</span> }
        </div>
        <button class="btn btn-primary btn-block add" [disabled]="soldOut()" (click)="add()">
          @if (soldOut()) { Agotado } @else { <app-icon name="cart" [size]="18" /> Agregar }
        </button>
      </div>
    </article>
  `,
  styles: [`
    .card {
      position: relative; height: 100%; display: flex; flex-direction: column;
      background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
      overflow: hidden; transition: box-shadow .25s var(--ease), transform .25s var(--ease), border-color .25s;
    }
    .card:hover { box-shadow: var(--shadow); transform: translateY(-3px); border-color: transparent; }
    .card:hover app-product-image ::ng-deep img { transform: scale(1.06); }

    .media { position: relative; display: block; aspect-ratio: 1; }
    .soldout .media { opacity: .55; }
    .badges { position: absolute; top: .75rem; left: .75rem; display: flex; flex-direction: column; gap: .35rem; align-items: flex-start; }

    .fav {
      position: absolute; top: .65rem; right: .65rem; width: 38px; height: 38px; border-radius: 50%;
      display: grid; place-items: center; border: none; cursor: pointer;
      background: rgba(255, 255, 255, .92); color: var(--ink-2); box-shadow: var(--shadow-sm);
      transition: transform .2s var(--ease), color .2s;
    }
    .fav:hover { transform: scale(1.1); color: var(--accent); }
    .fav.on { color: var(--accent); }

    .body { padding: 1rem; display: flex; flex-direction: column; gap: .3rem; flex: 1; }
    .cat { font-size: .74rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
    .name { font-weight: 700; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .name:hover { color: var(--brand-700); }
    .prices { display: flex; align-items: baseline; gap: .5rem; flex-wrap: wrap; margin: .15rem 0 .75rem; }
    .price { font-size: 1.15rem; font-weight: 800; }
    .price.sale { color: var(--accent); }
    .compare { font-size: .85rem; color: var(--muted); text-decoration: line-through; }
    .add { margin-top: auto; }

    @media (max-width: 560px) {
      .body { padding: .75rem; }
      .price { font-size: 1rem; }
      .add { padding: .6rem .8rem; font-size: .85rem; }
    }
  `],
})
export class ProductCardComponent {
  product = input.required<Product>();
  p = this.product; // alias corto para la plantilla

  private cart = inject(CartService);
  private fav = inject(FavoritesService);
  private toast = inject(ToastService);

  soldOut = computed(() => this.p().stock <= 0);
  isFav = computed(() => this.fav.has(this.p().id));

  add() {
    if (this.cart.add(this.p())) {
      this.toast.show(`${this.p().name} agregado al carrito`, 'success', {
        label: 'Ver carrito',
        run: () => this.cart.open(),
      });
    } else {
      this.toast.show('Ya tienes en el carrito todas las unidades disponibles', 'info');
    }
  }

  toggleFav() {
    const added = this.fav.toggle(this.p());
    this.toast.show(added ? 'Guardado en favoritos' : 'Quitado de favoritos', 'info');
  }
}
