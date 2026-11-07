import { Component, computed, input } from '@angular/core';

// Tarjetas "fantasma" mientras cargan los productos (se siente más rápido que un spinner)
@Component({
  selector: 'app-skeleton-grid',
  template: `
    <div class="product-grid" aria-busy="true" aria-label="Cargando productos">
      @for (i of items(); track i) {
        <div class="sk-card">
          <div class="skeleton sk-img"></div>
          <div class="sk-body">
            <div class="skeleton sk-line short"></div>
            <div class="skeleton sk-line"></div>
            <div class="skeleton sk-line mid"></div>
            <div class="skeleton sk-btn"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .sk-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
    .sk-img { aspect-ratio: 1; border-radius: 0; }
    .sk-body { padding: 1rem; display: flex; flex-direction: column; gap: .6rem; }
    .sk-line { height: 14px; }
    .sk-line.short { width: 40%; height: 10px; }
    .sk-line.mid { width: 55%; height: 18px; }
    .sk-btn { height: 40px; border-radius: var(--radius-full); margin-top: .4rem; }
  `],
})
export class SkeletonGridComponent {
  count = input(8);
  items = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
