import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../config';
import { Order, PaymentMethod } from '../models';

export interface OrderPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  city: string;
  address: string;
  notes: string;
  payment_method: PaymentMethod;
  items: { product_id: number; quantity: number }[];  // sin precios, a propósito
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  create(payload: OrderPayload) {
    return this.http.post<Order>(`${API_URL}/orders`, payload);
  }

  get(code: string) {
    return this.http.get<Order>(`${API_URL}/orders/${encodeURIComponent(code)}`);
  }
}
