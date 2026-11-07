import { Routes } from '@angular/router';

// loadComponent = carga diferida: cada página se descarga solo cuando se visita,
// así la primera carga del sitio es más rápida.
export const routes: Routes = [
  {
    path: '',
    title: 'MiTienda — Tienda en línea',
    loadComponent: () => import('./pages/home.page').then(m => m.HomePage),
  },
  {
    path: 'tienda',
    title: 'Tienda — MiTienda',
    loadComponent: () => import('./pages/catalog.page').then(m => m.CatalogPage),
  },
  {
    path: 'producto/:slug',
    title: 'Producto — MiTienda',
    loadComponent: () => import('./pages/product-detail.page').then(m => m.ProductDetailPage),
  },
  {
    path: 'carrito',
    title: 'Carrito — MiTienda',
    loadComponent: () => import('./pages/cart.page').then(m => m.CartPage),
  },
  {
    path: 'checkout',
    title: 'Finalizar compra — MiTienda',
    loadComponent: () => import('./pages/checkout.page').then(m => m.CheckoutPage),
  },
  {
    path: 'pedido/:code',
    title: 'Pedido confirmado — MiTienda',
    loadComponent: () => import('./pages/order-success.page').then(m => m.OrderSuccessPage),
  },
  {
    path: 'favoritos',
    title: 'Favoritos — MiTienda',
    loadComponent: () => import('./pages/favorites.page').then(m => m.FavoritesPage),
  },
  { path: '**', redirectTo: '' },
];
