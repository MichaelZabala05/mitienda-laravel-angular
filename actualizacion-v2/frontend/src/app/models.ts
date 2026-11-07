export interface Category {
  id: number;
  name: string;
  slug: string;
  products_count?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;                    // Laravel decimal:2 llega como texto
  compare_at_price: string | null;  // precio "antes" (oferta)
  discount_percent: number;         // calculado en Laravel
  stock: number;
  image_url: string | null;
  is_featured: boolean;
  category: Category;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ProductDetail {
  product: Product;
  related: Product[];
}

export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'name';

export interface ProductFilters {
  category?: string;
  q?: string;
  sort?: SortOption;
  min?: number | null;
  max?: number | null;
  on_sale?: boolean;
  page?: number;
  per_page?: number;
}

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  price: number;          // ya convertido a número
  imageUrl: string | null;
  quantity: number;
  stock: number;          // para no dejar pedir más de lo disponible
}

export interface StoreSettings {
  free_shipping_from: number;
  shipping_cost: number;
}

export type PaymentMethod = 'contraentrega' | 'transferencia';

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
  product: { id: number; name: string; slug: string; image_url: string | null };
}

export interface Order {
  id: number;
  code: string;
  customer_name: string;
  city: string;
  status: string;
  payment_method: PaymentMethod;
  subtotal: string;
  shipping: string;
  total: string;
  created_at: string;
  items: OrderItem[];
}
