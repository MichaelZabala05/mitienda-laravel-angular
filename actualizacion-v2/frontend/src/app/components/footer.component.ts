import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/icon.component';
import { STORE } from '../config';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent],
  template: `
    <footer class="footer">
      <div class="container cols">
        <div class="brand">
          <a routerLink="/" class="logo"><span class="logo-mark">M</span>{{ store.name }}</a>
          <p>Ropa, calzado, accesorios y tecnología seleccionados para tu día a día. Compra fácil y segura.</p>
        </div>

        <div>
          <h3>Tienda</h3>
          <ul>
            <li><a routerLink="/tienda">Todos los productos</a></li>
            <li><a routerLink="/tienda" [queryParams]="{ on_sale: 1 }">Ofertas</a></li>
            <li><a routerLink="/tienda" [queryParams]="{ sort: 'newest' }">Novedades</a></li>
            <li><a routerLink="/favoritos">Mis favoritos</a></li>
          </ul>
        </div>

        <div>
          <h3>Ayuda</h3>
          <ul>
            <li>Envíos a todo el país</li>
            <li>Pago contra entrega</li>
            <li>Pago por transferencia</li>
            <li>Cambios y devoluciones</li>
          </ul>
        </div>

        <div>
          <h3>Contacto</h3>
          <ul class="contact">
            <li><app-icon name="mail" [size]="16" /> {{ store.email }}</li>
            <li><app-icon name="phone" [size]="16" /> {{ store.phone }}</li>
            <li><app-icon name="map-pin" [size]="16" /> {{ store.city }}</li>
          </ul>
        </div>
      </div>

      <div class="container bottom">
        <span>© {{ year }} {{ store.name }}. Todos los derechos reservados.</span>
        <span>Hecho con Angular + Laravel</span>
      </div>
    </footer>
  `,
  styles: [`
    .footer { background: var(--brand-900); color: #C7D2FE; margin-top: 4rem; padding-top: 3.5rem; }
    .cols { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1.2fr; gap: 2rem; }
    .logo { display: inline-flex; align-items: center; gap: .55rem; font-weight: 800; font-size: 1.25rem; color: #fff; margin-bottom: .9rem; }
    .logo-mark { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: linear-gradient(135deg, var(--brand-500), var(--accent)); color: #fff; }
    .brand p { max-width: 320px; font-size: .92rem; line-height: 1.6; }
    h3 { color: #fff; font-size: .95rem; margin-bottom: .9rem; }
    ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .55rem; font-size: .92rem; }
    a:hover { color: #fff; }
    .contact li { display: flex; align-items: center; gap: .5rem; }
    .bottom {
      display: flex; justify-content: space-between; flex-wrap: wrap; gap: .5rem;
      border-top: 1px solid rgba(199, 210, 254, .15); margin-top: 2.5rem; padding-top: 1.25rem; padding-bottom: 1.5rem;
      font-size: .82rem; color: #A5B4FC;
    }
    @media (max-width: 820px) { .cols { grid-template-columns: 1fr 1fr; } .brand { grid-column: 1 / -1; } }
  `],
})
export class FooterComponent {
  store = STORE;
  year = new Date().getFullYear();
}
