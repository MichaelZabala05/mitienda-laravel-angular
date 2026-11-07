import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../config';

export interface OrderPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  items: { product_id: number; quantity: number }[];  // sin precios, a propósito
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  create(payload: OrderPayload) {
    return this.http.post<{ id: number; total: string }>(`${API_URL}/orders`, payload);
  }
}
