<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    // Idempotente: usa updateOrCreate por slug, así se puede ejecutar varias veces
    // sin duplicar productos ni borrar los pedidos existentes.
    public function run(): void
    {
        // [nombre, precio, precio antes (null = sin oferta), stock, destacado, palabra clave foto, descripción]
        $catalogo = [
            'Ropa' => [
                ['Camiseta básica', 45000, 59000, 30, true, 'tshirt',
                    'Camiseta 100% algodón peinado, corte regular y cuello redondo. Suave, fresca y perfecta para el día a día.'],
                ['Jean clásico', 120000, null, 15, false, 'jeans',
                    'Jean de corte recto en denim resistente con un toque de elasticidad. Combina con todo.'],
                ['Chaqueta impermeable', 210000, 260000, 8, true, 'jacket',
                    'Chaqueta liviana con capucha y costuras selladas. Te protege de la lluvia sin perder estilo.'],
                ['Buzo con capota', 95000, null, 20, false, 'hoodie',
                    'Buzo afelpado por dentro, bolsillo canguro y capota ajustable. Ideal para las noches frías.'],
                ['Camisa de lino', 135000, 165000, 4, false, 'linen,shirt',
                    'Camisa de lino transpirable, perfecta para clima cálido y ocasiones semiformales.'],
            ],
            'Calzado' => [
                ['Tenis urbanos', 189000, 229000, 10, true, 'sneakers',
                    'Tenis con suela acolchada y diseño minimalista. Comodidad para caminar todo el día.'],
                ['Sandalias', 65000, null, 20, false, 'sandals',
                    'Sandalias ligeras con plantilla anatómica y correas ajustables.'],
                ['Botas de cuero', 260000, null, 5, true, 'boots',
                    'Botas en cuero genuino con suela antideslizante. Duraderas y con mucho carácter.'],
                ['Tenis running', 245000, 289000, 3, false, 'running,shoes',
                    'Tenis deportivos con amortiguación reactiva y malla transpirable para tus entrenamientos.'],
            ],
            'Accesorios' => [
                ['Gorra', 35000, null, 25, false, 'cap',
                    'Gorra de algodón con logo bordado y cierre ajustable.'],
                ['Morral', 99000, 129000, 12, true, 'backpack',
                    'Morral urbano con compartimento acolchado para portátil de hasta 15" y bolsillos organizadores.'],
                ['Reloj deportivo', 150000, null, 0, false, 'watch',
                    'Reloj resistente al agua con cronómetro y luz nocturna.'],
                ['Gafas de sol', 85000, null, 7, false, 'sunglasses',
                    'Gafas con filtro UV400 y marco liviano. Estilo y protección para tus ojos.'],
                ['Billetera de cuero', 70000, 89000, 18, false, 'wallet',
                    'Billetera delgada en cuero con espacio para tarjetas y billetes.'],
            ],
            'Tecnología' => [
                ['Audífonos inalámbricos', 159000, 199000, 9, true, 'headphones',
                    'Audífonos Bluetooth con cancelación de ruido y hasta 30 horas de batería.'],
                ['Reloj inteligente', 289000, 349000, 6, true, 'smartwatch',
                    'Monitorea tu actividad, ritmo cardiaco y notificaciones desde tu muñeca.'],
                ['Parlante bluetooth', 119000, null, 14, false, 'speaker',
                    'Parlante portátil resistente al agua con sonido envolvente y graves potentes.'],
            ],
        ];

        $lock = 1; // hace que cada foto de prueba sea siempre la misma

        foreach ($catalogo as $nombreCategoria => $productos) {
            $category = Category::updateOrCreate(
                ['slug' => Str::slug($nombreCategoria)],
                ['name' => $nombreCategoria],
            );

            foreach ($productos as [$nombre, $precio, $antes, $stock, $destacado, $foto, $descripcion]) {
                Product::updateOrCreate(
                    ['slug' => Str::slug($nombre)],
                    [
                        'category_id'      => $category->id,
                        'name'             => $nombre,
                        'description'      => $descripcion,
                        'price'            => $precio,
                        'compare_at_price' => $antes,
                        'stock'            => $stock,
                        'is_featured'      => $destacado,
                        'is_active'        => true,
                        // Fotos de prueba por palabra clave; si fallan, Angular muestra un placeholder
                        'image_url'        => "https://loremflickr.com/640/640/{$foto}?lock=" . $lock++,
                    ],
                );
            }
        }
    }
}
