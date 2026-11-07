import { Component, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-toasts',
  imports: [IconComponent],
  template: `
    <div class="toasts" aria-live="polite" aria-atomic="false">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class.success]="t.type === 'success'" [class.error]="t.type === 'error'" role="status">
          <app-icon [name]="t.type === 'success' ? 'check-circle' : t.type === 'error' ? 'alert' : 'info'" [size]="20" />
          <span class="msg">{{ t.message }}</span>
          @if (t.action) {
            <button class="action" (click)="t.action?.run(); toast.dismiss(t.id)">{{ t.action.label }}</button>
          }
          <button class="close" (click)="toast.dismiss(t.id)" aria-label="Cerrar notificación">
            <app-icon name="x" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toasts { position: fixed; bottom: 1.25rem; right: 1.25rem; z-index: 80; display: flex; flex-direction: column; gap: .6rem; width: min(380px, calc(100% - 2.5rem)); }
    .toast {
      display: flex; align-items: center; gap: .7rem; padding: .85rem 1rem;
      background: var(--ink); color: #fff; border-radius: var(--radius-sm); box-shadow: var(--shadow-lg);
      font-size: .9rem; animation: up .3s var(--ease);
    }
    .toast.success app-icon { color: #4ADE80; }
    .toast.error { background: var(--danger); }
    .msg { flex: 1; }
    .action { border: none; background: rgba(255, 255, 255, .15); color: #fff; font-weight: 700; padding: .35rem .7rem; border-radius: 999px; cursor: pointer; font-size: .82rem; }
    .action:hover { background: rgba(255, 255, 255, .25); }
    .close { border: none; background: transparent; color: rgba(255, 255, 255, .7); cursor: pointer; padding: .2rem; }
    .close:hover { color: #fff; }
    @keyframes up { from { transform: translateY(20px); opacity: 0; } }
    @media (max-width: 560px) { .toasts { right: 50%; transform: translateX(50%); } }
  `],
})
export class ToastContainerComponent {
  toast = inject(ToastService);
}
