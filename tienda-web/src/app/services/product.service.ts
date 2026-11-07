import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { shareReplay } from 'rxjs';
import { API_URL } from '../config';
import { Category, Paginated, Product, ProductDetail, ProductFilters } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  // Las categorías casi no cambian: se piden una vez y se reutilizan (caché en memoria)
  private categories$ = this.http.get<Category[]>(`${API_URL}/categories`).pipe(shareReplay(1));

  list(filters: ProductFilters = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      // Omite filtros vacíos para que la URL quede limpia
      if (value === undefined || value === null || value === '' || value === false) continue;
      params = params.set(key, value === true ? '1' : String(value));
    }
    return this.http.get<Paginated<Product>>(`${API_URL}/products`, { params });
  }

  featured() {
    return this.http.get<Product[]>(`${API_URL}/products/featured`);
  }

  get(slug: string) {
    return this.http.get<ProductDetail>(`${API_URL}/products/${encodeURIComponent(slug)}`);
  }

  categories() {
    return this.categories$;
  }
}
