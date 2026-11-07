# 🛒 Tienda en línea — Laravel API + Angular

Proyecto de portafolio freelance: e-commerce con catálogo, carrito, checkout y control de stock.

```
tienda-fullstack/
├── instalar.ps1          ← script que arma TODO automáticamente (Windows)
├── backend/              ← archivos propios de la API Laravel (se copian encima del esqueleto)
│   ├── app/Models/
│   ├── app/Http/Controllers/Api/
│   ├── database/migrations/
│   ├── database/seeders/
│   └── routes/api.php
└── frontend/             ← archivos propios de Angular (se copian encima del esqueleto)
    └── src/
        ├── main.ts
        ├── styles.scss
        └── app/ (config, modelos, servicios, páginas, rutas)
```

> **¿Por qué no viene el proyecto completo?**
> Un proyecto Laravel recién creado trae miles de archivos en `vendor/` y Angular trae `node_modules/`.
> Esos se generan con `composer` y `npm` en TU computador, con las versiones correctas para tu sistema.
> Por eso el zip solo trae el código que escribimos nosotros, y el script `instalar.ps1` arma el esqueleto
> oficial y copia nuestros archivos encima.

---

## 0. Requisitos (verifica en la terminal de VS Code)

```bash
php -v          # PHP 8.2 o superior
composer -V
node -v         # Node 20 o superior
npm -v
mysql --version # o tener XAMPP/Laragon con MySQL encendido
```

En `php.ini` deben estar activas las extensiones `pdo_mysql`, `mbstring`, `openssl`, `fileinfo` y `zip`
(quita el `;` del inicio de cada línea `extension=...`).

---

## 1. Instalación automática (recomendada)

1. Descomprime el zip, por ejemplo en `C:\Proyectos\tienda-fullstack`.
2. Crea la base de datos vacía en MySQL:
   ```sql
   CREATE DATABASE tienda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Abre la carpeta en VS Code (**File → Open Folder**) y marca **Trust** si te lo pregunta.
4. Abre la terminal (`Ctrl + ñ`) y ejecuta:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\instalar.ps1
   ```
   Si tu usuario de MySQL tiene contraseña, pásala así:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\instalar.ps1 -DbPassword "tuClave"
   ```

El script crea `tienda-api/` y `tienda-web/`, copia el código, configura MySQL y carga datos de prueba.

---

## 2. Instalación manual (si el script falla)

### Backend
```bash
composer create-project laravel/laravel tienda-api
cd tienda-api
php artisan install:api --without-migration-prompt
```
Copia **el contenido** de `backend/` dentro de `tienda-api/` (reemplaza `routes/api.php`).

Edita `tienda-api/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tienda
DB_USERNAME=root
DB_PASSWORD=
```
Luego:
```bash
php artisan migrate:fresh --seed
```

### Frontend
```bash
npx @angular/cli new tienda-web --routing --style=scss --ssr=false --skip-git --defaults
```
Borra la carpeta `tienda-web/src/app/` completa y copia en su lugar el contenido de `frontend/src/`
(`app/`, `main.ts` y `styles.scss`).

---

## 3. Ejecutar (dos terminales en VS Code)

| Terminal 1 (API) | Terminal 2 (Web) |
|---|---|
| `cd tienda-api` | `cd tienda-web` |
| `php artisan serve` | `npx ng serve` |
| http://localhost:8000/api/products | http://localhost:4200 |

---

## 4. Endpoints de la API

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/categories` | Lista categorías |
| GET | `/api/products?category=ropa&q=jean&page=1` | Catálogo paginado (12 por página) |
| GET | `/api/products/{slug}` | Detalle de un producto |
| POST | `/api/orders` | Crea un pedido (valida stock y recalcula precios en el servidor) |

Ejemplo de cuerpo para `POST /api/orders`:
```json
{
  "customer_name": "Laura Pérez",
  "customer_email": "laura@correo.com",
  "customer_phone": "3001234567",
  "address": "Calle 1 # 2-3, Bogotá",
  "items": [ { "product_id": 1, "quantity": 2 } ]
}
```

---

## 5. Decisiones de diseño (para explicarle al cliente)

- **El precio nunca viene del navegador.** El frontend solo envía `product_id` y `quantity`; Laravel calcula el total.
- **`DB::transaction` + `lockForUpdate`**: si dos personas compran la última unidad a la vez, solo una lo logra.
- **`unit_price` en `order_items`**: congela el precio de venta aunque luego cambie en el catálogo.
- **`decimal(12,2)` para dinero**, nunca `float`.
- **Carrito en `localStorage` con signals**: no exige login; el tradeoff es que no se sincroniza entre dispositivos.
- **`is_active`** permite ocultar productos sin borrarlos (los pedidos viejos los siguen referenciando).

## 6. Siguientes pasos para subir el precio del proyecto

1. Pasarela de pago (Wompi o Mercado Pago) con webhook que cambie el pedido a `pagado`.
2. Panel admin con login (Sanctum): CRUD de productos y gestión de pedidos.
3. Subida de imágenes reales a `storage/`.
4. Despliegue: API en hosting PHP/VPS, Angular en Netlify o Vercel.

## 7. Problemas comunes

| Error | Solución |
|---|---|
| `could not find driver` | Activa `extension=pdo_mysql` en `php.ini` |
| `Access denied for user 'root'` | Revisa `DB_PASSWORD` en `tienda-api/.env` |
| `Unknown database 'tienda'` | Crea la base de datos (paso 1.2) |
| CORS en el navegador | Verifica que la API corre en el puerto 8000 y que `routes/api.php` se copió |
| `ng` no se reconoce | Usa `npx ng serve` en lugar de `ng serve` |
| PowerShell bloquea el script | Usa `powershell -ExecutionPolicy Bypass -File .\instalar.ps1` |
