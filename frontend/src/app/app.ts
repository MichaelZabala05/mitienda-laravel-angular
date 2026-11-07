import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header>
      <a routerLink="/" class="logo">🛍️ MiTienda</a>
      <a routerLink="/carrito" class="carrito">Carrito ({{ cart.count() }})</a>
    </header>
    <main><router-outlet /></main>
  `,
  styles: [`
    header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #222; }
    header a { color: #fff; text-decoration: none; font-weight: bold; }
    .logo { font-size: 1.2rem; }
    main { padding: 2rem 1rem; max-width: 1100px; margin: auto; }
  `],
})
export class App {
  cart = inject(CartService);
}
