import { Component, computed, effect, input, signal } from '@angular/core';

// Imagen de producto con respaldo: si la foto no carga, muestra
// un degradado con las iniciales del producto en vez de un ícono roto.
@Component({
  selector: 'app-product-image',
  template: `
    @if (src() && !failed()) {
      <img [src]="src()" [alt]="alt()" loading="lazy" (error)="failed.set(true)" />
    } @else {
      <div class="ph" role="img" [attr.aria-label]="alt()"><span>{{ initials() }}</span></div>
    }
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; overflow: hidden; background: var(--brand-50); }
    img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s var(--ease); }
    .ph {
      width: 100%; height: 100%; display: grid; place-items: center;
      background: linear-gradient(135deg, var(--brand-100), var(--accent-50));
      color: var(--brand-700); font-weight: 800; font-size: clamp(1rem, 4vw, 2.2rem); letter-spacing: .05em;
    }
  `],
})
export class ProductImageComponent {
  src = input<string | null>(null);
  alt = input('');
  failed = signal(false);

  initials = computed(() =>
    this.alt().split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
  );

  constructor() {
    // Si cambia la imagen (ej. navegar a otro producto), se vuelve a intentar
    effect(() => {
      this.src();
      this.failed.set(false);
    });
  }
}
