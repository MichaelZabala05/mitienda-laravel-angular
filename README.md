# 🛍️ MiTienda — E-commerce con Laravel + Angular

Tienda en línea full-stack: catálogo con filtros, carrito, checkout y control de stock.

**Stack:** Laravel (API REST) · Angular (standalone + signals) · MySQL

## ✨ Funcionalidades
- Catálogo con búsqueda, filtros por categoría, precio y ofertas, orden y paginación (filtros en la URL)
- Detalle de producto con descuentos, stock en vivo y productos relacionados
- Carrito persistente con mini carrito lateral y barra de "envío gratis"
- Checkout en 3 pasos con validación y pago contra entrega o transferencia
- Favoritos, notificaciones, skeletons de carga y diseño 100% responsive
- Seguridad: precios y envío calculados en el servidor, transacciones con bloqueo
  de stock (`lockForUpdate`), rate limiting y datos personales ocultos

## 🚀 Cómo ejecutarlo

### Backend
```bash
cd tienda-api
composer install
cp .env.example .env        # configurar DB_* con tu MySQL
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend
```bash
cd tienda-web
npm install
npx ng serve
```
Abrir http://localhost:4200

## 📡 API
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/products` | Catálogo filtrable y paginado |
| GET | `/api/products/featured` | Destacados |
| GET | `/api/products/{slug}` | Detalle + relacionados |
| GET | `/api/categories` | Categorías con conteo |
| POST | `/api/orders` | Crear pedido |
| GET | `/api/orders/{code}` | Confirmación del pedido |