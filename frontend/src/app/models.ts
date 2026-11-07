export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;          // Laravel decimal:2 llega como texto
  stock: number;
  image_url: string | null;
  category: Category;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;          // ya convertido a número
  imageUrl: string | null;
  quantity: number;
  stock: number;          // para no dejar pedir más de lo disponible
}
