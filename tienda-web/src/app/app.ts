import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header.component';
import { FooterComponent } from './components/footer.component';
import { CartDrawerComponent } from './components/cart-drawer.component';
import { ToastContainerComponent } from './components/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CartDrawerComponent, ToastContainerComponent],
  template: `
    <a class="skip-link" href="#contenido">Saltar al contenido</a>
    <app-header />
    <main id="contenido"><router-outlet /></main>
    <app-footer />
    <app-cart-drawer />
    <app-toasts />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    main { flex: 1; }
  `],
})
export class App {}
