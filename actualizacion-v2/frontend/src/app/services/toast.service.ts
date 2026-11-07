import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  action?: { label: string; run: () => void };
}

// Notificaciones flotantes ("Producto agregado", errores, etc.)
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;

  show(message: string, type: ToastType = 'success', action?: Toast['action'], ms = 3500) {
    const id = ++this.seq;
    // Máximo 3 a la vez para no tapar la pantalla
    this.toasts.update(list => [...list.slice(-2), { id, message, type, action }]);
    setTimeout(() => this.dismiss(id), ms);
  }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
