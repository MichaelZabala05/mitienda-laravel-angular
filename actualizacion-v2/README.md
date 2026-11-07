# 🛍️ MiTienda v2 — Rediseño completo

Actualización de la tienda Laravel + Angular: nuevo sistema de diseño, más páginas y mejores
prácticas de conversión (lo que hace que una visita termine en compra).

---

## 1. Cómo aplicar la actualización

1. **Detén** `ng serve` en su terminal (`Ctrl + C`). `php artisan serve` puede seguir corriendo.
2. Descomprime `tienda-v2.zip` **dentro** de tu carpeta del proyecto. Debe quedar así:
   ```
   tienda-fullstack\
   ├── tienda-api\
   ├── tienda-web\
   └── actualizacion-v2\   ← lo nuevo
   ```
3. En la terminal de VS Code:
   ```powershell
   cd actualizacion-v2
   powershell -ExecutionPolicy Bypass -File .\actualizar.ps1
   ```
4. Vuelve a levantar Angular:
   ```powershell
   cd ..\tienda-web
   npx ng serve
   ```
5. Abre http://localhost:4200. Si ves la versión anterior, recarga con `Ctrl + Shift + R`.

> **¿Se pierden los pedidos?** No. Las migraciones nuevas solo **agregan** columnas, y el seeder usa
> `updateOrCreate`, así que actualiza productos sin duplicarlos. El stock de los productos de prueba
> vuelve a sus valores iniciales.

---

## 2. Paleta de colores

| Rol | Color | Uso | Por qué |
|---|---|---|---|
| Marca | `#4338CA` índigo | Botones principales, enlaces, foco | Transmite confianza; contraste 7.9:1 con blanco (WCAG AAA) |
| Marca oscuro | `#1E1B4B` | Barra superior, hero, footer | Da profundidad y hace resaltar las fotos |
| Acento | `#E11D48` rosa intenso | Descuentos, contadores, "Solo ofertas" | El color de urgencia; se usa poco para que no compita con el botón de compra |
| Éxito | `#15803D` | Envío gratis, stock disponible, pedido confirmado | Refuerzo positivo |
| Advertencia | `#B45309` | "¡Últimas unidades!" | Escasez sin parecer error |
| Error | `#B91C1C` | Validaciones del formulario | Claro y accesible |
| Neutros | `#0F172A` → `#F8FAFC` | Texto y fondos | Legibilidad |

Tipografía: **Plus Jakarta Sans** (Google Fonts). Todos los colores son variables CSS en `src/styles.scss`,
así que cambiar la marca de un cliente es editar unas pocas líneas.

---

## 3. Qué cambió

### Diseño y experiencia
- **Home nueva**: hero con productos destacados, barra de beneficios, categorías con contador, destacados y banner de ofertas.
- **Encabezado fijo** con buscador, favoritos y carrito con contador animado; barra de anuncios con el umbral de envío gratis.
- **Mini carrito lateral** (drawer): se abre al agregar sin sacar al usuario de la página. Se cierra con `Esc`.
- **Barra de envío gratis**: "Te faltan $X para el envío gratis" (sube el ticket promedio).
- **Tarjetas de producto** con descuento, "¡Últimas N!", agotado, favoritos y efecto hover.
- **Imágenes con respaldo**: si una foto falla, se muestra un degradado con las iniciales.
- **Skeletons** de carga en lugar de "Cargando…".
- **Notificaciones (toasts)** con acción "Ver carrito".
- **Responsive** completo: filtros como panel lateral en móvil, carrito y checkout adaptados.
- **Accesibilidad**: foco visible, `aria-label`, enlace "Saltar al contenido", respeta "reducir movimiento".

### Páginas nuevas
| Ruta | Página |
|---|---|
| `/` | Inicio |
| `/tienda` | Catálogo con filtros (categoría, precio, ofertas), orden y paginación. Los filtros viven en la URL |
| `/producto/:slug` | Detalle: precio con ahorro, stock, cantidad, comprar ahora, relacionados |
| `/carrito` | Carrito completo con resumen |
| `/checkout` | Checkout en 3 pasos con validación por campo y método de pago |
| `/pedido/:code` | Confirmación con resumen y próximos pasos |
| `/favoritos` | Lista de deseos (guardada en el navegador) |

### Backend
- `compare_at_price` (precio "antes") y `discount_percent` calculado → ofertas reales.
- `is_featured` → productos destacados en la home.
- Filtros: `q` (nombre y descripción), `min`, `max`, `on_sale`, `sort` (recomendados, nuevos, precio, nombre).
- **Envío calculado en el servidor** (`config/tienda.php`), expuesto en `GET /api/settings`.
- Pedidos con **código público** (`MT-XXXXXXXX`) en lugar del id numérico, ciudad, notas y método de pago.
- Datos personales ocultos en las respuestas públicas (`$hidden`).
- **Rate limit**: máximo 10 pedidos por minuto por IP.
- Mensajes de stock en español ("Solo quedan 2 unidades de…").

### Endpoints
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/settings` | Umbral de envío gratis y costo de envío |
| GET | `/api/categories` | Categorías con `products_count` |
| GET | `/api/products` | Catálogo filtrable y paginado |
| GET | `/api/products/featured` | Destacados |
| GET | `/api/products/{slug}` | `{ product, related }` |
| POST | `/api/orders` | Crea el pedido (throttle 10/min) |
| GET | `/api/orders/{code}` | Confirmación del pedido |

---

## 4. Personalizar para un cliente

- **Colores**: `tienda-web/src/styles.scss`, bloque `:root`.
- **Nombre y contacto**: `tienda-web/src/app/config.ts` (`STORE`).
- **Envío**: en `tienda-api/.env` agrega `TIENDA_ENVIO_GRATIS_DESDE=150000` y `TIENDA_COSTO_ENVIO=10000`, luego `php artisan config:clear`.
- **Productos**: `tienda-api/database/seeders/DatabaseSeeder.php` (las fotos son de prueba; en producción usa fotos reales).

## 5. Problemas comunes

| Síntoma | Solución |
|---|---|
| Se ve la versión vieja | `Ctrl + Shift + R` en el navegador |
| "No pudimos conectar con la tienda" | Revisa que `php artisan serve` esté corriendo |
| Error en `migrate` | Revisa `DB_PASSWORD` en `tienda-api\.env` |
| Las fotos no cargan | Es normal si el servicio de fotos de prueba está lento; aparece el placeholder con iniciales |
| `ng serve` falla al compilar | Copia el error completo de la terminal y revísalo (o pídele ayuda a Claude) |
