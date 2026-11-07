import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../config';
import { Category, Paginated, Product } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  list(filters: { category?: string; q?: string; page?: number } = {}) {
    let params = new HttpParams();
    if (filters.category) params = params.set('category', filters.category);
    if (filters.q) params = params.set('q', filters.q);
    if (filters.page) params = params.set('page', filters.page);
    return this.http.get<Paginated<Product>>(`${API_URL}/products`, { params });
  }

  categories() {
    return this.http.get<Category[]>(`${API_URL}/categories`);
  }
}
