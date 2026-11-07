import { Component, input } from '@angular/core';

// Íconos SVG propios (estilo línea). Sin librerías externas = menos peso.
// Uso: <app-icon name="cart" [size]="20" />
export type IconName =
  | 'cart' | 'search' | 'heart' | 'truck' | 'shield' | 'refresh' | 'card'
  | 'x' | 'plus' | 'minus' | 'trash' | 'arrow-right' | 'arrow-left' | 'check'
  | 'check-circle' | 'filter' | 'chevron-right' | 'chevron-left' | 'tag'
  | 'package' | 'alert' | 'info' | 'mail' | 'phone' | 'map-pin' | 'cash';

@Component({
  selector: 'app-icon',
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24"
         [attr.fill]="filled() ? 'currentColor' : 'none'" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @switch (name()) {
        @case ('cart') {
          <svg:path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <svg:line x1="3" y1="6" x2="21" y2="6" />
          <svg:path d="M16 10a4 4 0 0 1-8 0" />
        }
        @case ('search') {
          <svg:circle cx="11" cy="11" r="8" />
          <svg:line x1="21" y1="21" x2="16.65" y2="16.65" />
        }
        @case ('heart') {
          <svg:path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        }
        @case ('truck') {
          <svg:rect x="1" y="3" width="15" height="13" />
          <svg:polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <svg:circle cx="5.5" cy="18.5" r="2.5" />
          <svg:circle cx="18.5" cy="18.5" r="2.5" />
        }
        @case ('shield') {
          <svg:path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <svg:polyline points="9 12 11 14 15 10" />
        }
        @case ('refresh') {
          <svg:polyline points="1 4 1 10 7 10" />
          <svg:path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        }
        @case ('card') {
          <svg:rect x="1" y="4" width="22" height="16" rx="2" />
          <svg:line x1="1" y1="10" x2="23" y2="10" />
        }
        @case ('cash') {
          <svg:rect x="2" y="6" width="20" height="12" rx="2" />
          <svg:circle cx="12" cy="12" r="2.5" />
          <svg:line x1="6" y1="12" x2="6.01" y2="12" />
          <svg:line x1="18" y1="12" x2="18.01" y2="12" />
        }
        @case ('x') {
          <svg:line x1="18" y1="6" x2="6" y2="18" />
          <svg:line x1="6" y1="6" x2="18" y2="18" />
        }
        @case ('plus') {
          <svg:line x1="12" y1="5" x2="12" y2="19" />
          <svg:line x1="5" y1="12" x2="19" y2="12" />
        }
        @case ('minus') {
          <svg:line x1="5" y1="12" x2="19" y2="12" />
        }
        @case ('trash') {
          <svg:polyline points="3 6 5 6 21 6" />
          <svg:path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        }
        @case ('arrow-right') {
          <svg:line x1="5" y1="12" x2="19" y2="12" />
          <svg:polyline points="12 5 19 12 12 19" />
        }
        @case ('arrow-left') {
          <svg:line x1="19" y1="12" x2="5" y2="12" />
          <svg:polyline points="12 19 5 12 12 5" />
        }
        @case ('check') {
          <svg:polyline points="20 6 9 17 4 12" />
        }
        @case ('check-circle') {
          <svg:path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <svg:polyline points="22 4 12 14.01 9 11.01" />
        }
        @case ('filter') {
          <svg:polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        }
        @case ('chevron-right') {
          <svg:polyline points="9 18 15 12 9 6" />
        }
        @case ('chevron-left') {
          <svg:polyline points="15 18 9 12 15 6" />
        }
        @case ('tag') {
          <svg:path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <svg:line x1="7" y1="7" x2="7.01" y2="7" />
        }
        @case ('package') {
          <svg:path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <svg:polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <svg:line x1="12" y1="22.08" x2="12" y2="12" />
        }
        @case ('mail') {
          <svg:path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <svg:polyline points="22 6 12 13 2 6" />
        }
        @case ('phone') {
          <svg:path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        }
        @case ('map-pin') {
          <svg:path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <svg:circle cx="12" cy="10" r="3" />
        }
        @default {
          <!-- alert / info -->
          <svg:circle cx="12" cy="12" r="10" />
          <svg:line x1="12" y1="8" x2="12" y2="12" />
          <svg:line x1="12" y1="16" x2="12.01" y2="16" />
        }
      }
    </svg>
  `,
  styles: [`:host { display: inline-flex; line-height: 0; flex-shrink: 0; }`],
})
export class IconComponent {
  name = input.required<IconName>();
  size = input(22);
  filled = input(false);
}
