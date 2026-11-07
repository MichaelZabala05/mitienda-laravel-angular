import { Routes } from '@angular/router';
import { ProductList } from './pages/product-list.component';
import { Cart } from './pages/cart.component';
import { Checkout } from './pages/checkout.component';

export const routes: Routes = [
  { path: '', component: ProductList, title: 'MiTienda' },
  { path: 'carrito', component: Cart, title: 'Carrito — MiTienda' },
  { path: 'checkout', component: Checkout, title: 'Checkout — MiTienda' },
  { path: '**', redirectTo: '' },
];
